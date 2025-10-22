"""
Reasoning Engine - LLM-powered reasoning for APA agents
"""
import time
import os
import json
from typing import Dict, List, Any, Optional
from datetime import datetime

from app.models import Agent

# LLM client imports
try:
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    from anthropic import AsyncAnthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False


class ReasoningEngine:
    """
    Reasoning Engine using LLM for agent reasoning (ReAct pattern)
    
    Integrates with OpenAI, Anthropic, or other LLM providers
    """
    
    def __init__(self, llm_provider: str = "openai"):
        self.llm_provider = llm_provider
        
        # Initialize LLM clients
        if llm_provider == "openai" and OPENAI_AVAILABLE:
            api_key = os.getenv("OPENAI_API_KEY")
            self.openai_client = AsyncOpenAI(api_key=api_key) if api_key else None
        else:
            self.openai_client = None
        
        if llm_provider == "anthropic" and ANTHROPIC_AVAILABLE:
            api_key = os.getenv("ANTHROPIC_API_KEY")
            self.anthropic_client = AsyncAnthropic(api_key=api_key) if api_key else None
        else:
            self.anthropic_client = None
    
    async def reason(
        self,
        agent: Agent,
        task: Dict[str, Any],
        context: Dict[str, Any],
        previous_actions: List[Dict[str, Any]],
        previous_observations: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Generate reasoning for the next action using LLM
        
        Args:
            agent: The agent performing reasoning
            task: The task to reason about
            context: Current execution context
            previous_actions: List of previous actions taken
            previous_observations: List of previous observations
        
        Returns:
            Reasoning result containing thought, action, and metadata
        """
        start_time = time.time()
        
        # Build prompt for LLM
        prompt = self._build_react_prompt(
            agent=agent,
            task=task,
            context=context,
            previous_actions=previous_actions,
            previous_observations=previous_observations,
        )
        
        # Call appropriate LLM based on agent configuration
        provider = agent.provider.lower() if agent.provider else self.llm_provider
        model = agent.model or "gpt-4"
        temperature = (agent.temperature / 10.0) if agent.temperature else 0.7
        max_tokens = agent.max_tokens or 2000
        
        try:
            if provider == "openai" and self.openai_client:
                thought = await self.reason_with_openai(
                    prompt=prompt,
                    model=model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
            elif provider == "anthropic" and self.anthropic_client:
                thought = await self.reason_with_anthropic(
                    prompt=prompt,
                    model=model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
            else:
                # Fallback to mock if no LLM available
                thought = self._mock_llm_call(prompt)
        except Exception as e:
            # Fallback to mock on error
            print(f"LLM API error: {e}, falling back to mock")
            thought = self._mock_llm_call(prompt)
        
        latency_ms = int((time.time() - start_time) * 1000)
        
        return {
            "reasoning": thought.get("reasoning", ""),
            "action": thought.get("action", {}),
            "reflection": thought.get("reflection"),
            "tokens_used": thought.get("tokens_used", 0),
            "latency_ms": latency_ms,
        }
    
    def _parse_react_response(self, content: str) -> Dict[str, Any]:
        """
        Parse LLM response to extract thought, action, and reflection
        
        Expected format:
        Thought: [reasoning]
        Action: [action_type]
        Action Input: [parameters]
        """
        lines = content.strip().split('\n')
        
        thought = ""
        action_type = ""
        action_input = ""
        reflection = ""
        
        for i, line in enumerate(lines):
            line_lower = line.lower().strip()
            
            if line_lower.startswith('thought:'):
                thought = line.split(':', 1)[1].strip()
            elif line_lower.startswith('action:'):
                action_type = line.split(':', 1)[1].strip()
            elif line_lower.startswith('action input:'):
                action_input = line.split(':', 1)[1].strip()
            elif line_lower.startswith('result:'):
                reflection = line.split(':', 1)[1].strip()
        
        # Parse action input as JSON if possible
        try:
            action_params = json.loads(action_input) if action_input else {}
        except json.JSONDecodeError:
            action_params = {"raw": action_input}
        
        return {
            "reasoning": thought,
            "action": {
                "type": action_type or "finish",
                "description": thought,
                "parameters": action_params,
                "result": reflection if action_type == "finish" else None,
            },
            "reflection": reflection,
        }
    
    def _build_react_prompt(
        self,
        agent: Agent,
        task: Dict[str, Any],
        context: Dict[str, Any],
        previous_actions: List[Dict[str, Any]],
        previous_observations: List[Dict[str, Any]],
    ) -> str:
        """Build ReAct prompt for LLM"""
        
        # System prompt
        system_prompt = agent.system_prompt or "You are a helpful AI agent."
        
        # Task description
        task_description = task.get("description", "Complete the task.")
        
        # Previous steps
        history = ""
        for i, (action, obs) in enumerate(zip(previous_actions, previous_observations)):
            history += f"\nStep {i+1}:\n"
            history += f"Action: {action.get('type')} - {action.get('description', '')}\n"
            history += f"Observation: {obs.get('status')} - {obs.get('result', '')}\n"
        
        # Available tools
        tools = "\n".join([f"- {tool}" for tool in agent.tools])
        
        # Build full prompt
        prompt = f"""
{system_prompt}

Task: {task_description}

Available Tools:
{tools}

Previous Steps:{history}

Current Context:
{context}

Based on the task, previous steps, and current context, determine the next action.
Use the following format:

Thought: [Your reasoning about what to do next]
Action: [The action to take]
Action Input: [The input for the action]

If the task is complete, use:
Thought: [Explain why the task is complete]
Action: finish
Result: [The final result]
"""
        return prompt
    
    def _mock_llm_call(self, prompt: str) -> Dict[str, Any]:
        """
        Mock LLM call for development
        TODO: Replace with actual LLM API call
        """
        return {
            "reasoning": "Analyzing the task and determining next steps...",
            "action": {
                "type": "finish",
                "description": "Task completed successfully",
                "result": {"status": "success", "message": "Mock completion"},
            },
            "reflection": "Successfully completed the task",
            "tokens_used": 150,
        }
    
    async def reason_with_openai(
        self,
        prompt: str,
        model: str = "gpt-4",
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> Dict[str, Any]:
        """
        Call OpenAI API for reasoning
        """
        if not self.openai_client:
            raise ValueError("OpenAI client not initialized. Set OPENAI_API_KEY environment variable.")
        
        try:
            response = await self.openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are an AI agent using the ReAct pattern (Reasoning + Acting). Think step by step."},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens,
            )
            
            content = response.choices[0].message.content
            tokens_used = response.usage.total_tokens if response.usage else 0
            
            # Parse the LLM response to extract thought and action
            parsed = self._parse_react_response(content)
            parsed["tokens_used"] = tokens_used
            
            return parsed
            
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")
    
    async def reason_with_anthropic(
        self,
        prompt: str,
        model: str = "claude-3-opus-20240229",
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> Dict[str, Any]:
        """
        Call Anthropic API for reasoning
        """
        if not self.anthropic_client:
            raise ValueError("Anthropic client not initialized. Set ANTHROPIC_API_KEY environment variable.")
        
        try:
            response = await self.anthropic_client.messages.create(
                model=model,
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[
                    {"role": "user", "content": prompt}
                ],
            )
            
            content = response.content[0].text
            tokens_used = response.usage.input_tokens + response.usage.output_tokens if response.usage else 0
            
            # Parse the LLM response to extract thought and action
            parsed = self._parse_react_response(content)
            parsed["tokens_used"] = tokens_used
            
            return parsed
            
        except Exception as e:
            raise Exception(f"Anthropic API error: {str(e)}")
