"""
LangChain-based Workflow Executor
Implements single-agent ReAct pattern workflows using LangChain framework
"""

import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

from langchain_classic.agents import AgentExecutor, create_react_agent
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import Tool
from langchain_classic.memory import ConversationBufferMemory
from langchain_community.callbacks import get_openai_callback

from app.core.config import settings
from app.services.apa.safety_engine import SafetyEngine
from app.services.apa.context_manager import ContextManager
from app.services.apa.tool_registry import ToolRegistry

logger = logging.getLogger(__name__)


class LangChainExecutor:
    """
    Executes workflows using LangChain's ReAct agent pattern.
    Best for single-agent tasks with reasoning-action-observation loops.
    """

    def __init__(
        self,
        safety_engine: SafetyEngine,
        context_manager: ContextManager,
        tool_registry: Optional[ToolRegistry] = None,
    ):
        self.safety_engine = safety_engine
        self.context_manager = context_manager
        self.tool_registry = tool_registry or ToolRegistry()
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
        )

    def _get_llm(self, provider: str, model: str, temperature: float = 0.7):
        """Get LLM instance based on provider"""
        if provider.lower() == "openai":
            return ChatOpenAI(
                model=model,
                temperature=temperature,
                api_key=settings.OPENAI_API_KEY,
            )
        elif provider.lower() == "anthropic":
            return ChatAnthropic(
                model=model,
                temperature=temperature,
                api_key=settings.ANTHROPIC_API_KEY,
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {provider}")

    def _create_langchain_tools(self, tool_configs: List[Dict[str, Any]]) -> List[Tool]:
        """Convert tool configurations to LangChain Tool objects"""
        langchain_tools = []

        for tool_config in tool_configs:
            tool_name = tool_config.get("name", "")
            tool_description = tool_config.get("description", "")
            
            # Get the actual tool function from registry
            tool_func = self.tool_registry.get_tool(tool_name)
            
            if tool_func:
                langchain_tool = Tool(
                    name=tool_name,
                    func=tool_func,
                    description=tool_description,
                )
                langchain_tools.append(langchain_tool)
            else:
                logger.warning(f"Tool not found in registry: {tool_name}")

        return langchain_tools

    def _create_react_prompt(self, agent_config: Dict[str, Any]) -> PromptTemplate:
        """Create ReAct prompt template for the agent"""
        system_message = agent_config.get("system_prompt", "You are a helpful AI assistant.")
        
        template = f"""
{system_message}

You have access to the following tools:

{{tools}}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{{tool_names}}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {{input}}
Thought: {{agent_scratchpad}}
"""
        
        return PromptTemplate(
            template=template,
            input_variables=["input", "tools", "tool_names", "agent_scratchpad"],
        )

    async def execute_workflow(
        self,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
        input_data: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Execute a workflow using LangChain ReAct agent.
        
        Args:
            nodes: List of workflow nodes (expects single agent node)
            edges: List of workflow edges (sequential flow)
            input_data: Initial input for the workflow
            
        Returns:
            Execution result with output, metrics, and trace
        """
        logger.info(f"Starting LangChain workflow execution with {len(nodes)} nodes")
        start_time = datetime.now()
        
        try:
            # Extract agent configuration from nodes
            agent_node = next((n for n in nodes if n.get("type") == "agent"), None)
            if not agent_node:
                raise ValueError("No agent node found in workflow")

            agent_data = agent_node.get("data", {})
            agent_id = agent_data.get("agentId")
            
            # Get agent configuration
            # In production, fetch from database using agent_id
            provider = agent_data.get("provider", settings.DEFAULT_LLM_PROVIDER)
            model = agent_data.get("model", "gpt-4")
            tools = agent_data.get("tools", [])
            
            # Create LLM instance
            llm = self._get_llm(provider, model)
            
            # Create tools
            langchain_tools = self._create_langchain_tools(tools)
            
            # Create prompt
            prompt = self._create_react_prompt(agent_data)
            
            # Create ReAct agent
            agent = create_react_agent(
                llm=llm,
                tools=langchain_tools,
                prompt=prompt,
            )
            
            # Create agent executor with safety checks
            agent_executor = AgentExecutor(
                agent=agent,
                tools=langchain_tools,
                memory=self.memory,
                verbose=True,
                max_iterations=settings.MAX_REASONING_ITERATIONS,
                handle_parsing_errors=True,
            )
            
            # Prepare input
            user_input = input_data.get("input", "") if input_data else ""
            
            # Execute with token tracking
            with get_openai_callback() as cb:
                result = agent_executor.invoke({"input": user_input})
                
                execution_time = (datetime.now() - start_time).total_seconds()
                
                return {
                    "status": "success",
                    "output": result.get("output", ""),
                    "metrics": {
                        "total_tokens": cb.total_tokens,
                        "prompt_tokens": cb.prompt_tokens,
                        "completion_tokens": cb.completion_tokens,
                        "total_cost": cb.total_cost,
                        "execution_time": execution_time,
                    },
                    "framework": "langchain",
                    "agent_steps": len(result.get("intermediate_steps", [])),
                    "trace": {
                        "intermediate_steps": str(result.get("intermediate_steps", [])),
                        "chat_history": str(self.memory.buffer),
                    }
                }
                
        except Exception as e:
            logger.error(f"LangChain execution failed: {str(e)}", exc_info=True)
            execution_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "status": "error",
                "error": str(e),
                "metrics": {
                    "execution_time": execution_time,
                },
                "framework": "langchain",
            }

    async def execute_with_safety(
        self,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
        input_data: Optional[Dict[str, Any]] = None,
        user_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Execute workflow with safety checks and HITL integration.
        """
        # Pre-execution safety check
        if settings.ENABLE_HITL and user_id:
            safety_check = await self.safety_engine.check_safety(
                action="workflow_execution",
                parameters={"nodes": nodes, "input": input_data},
                user_id=user_id,
            )
            
            if not safety_check.get("approved", False):
                return {
                    "status": "blocked",
                    "reason": safety_check.get("reason", "Safety check failed"),
                    "framework": "langchain",
                }
        
        # Execute workflow
        result = await self.execute_workflow(nodes, edges, input_data)
        
        # Store execution context for learning
        if settings.ENABLE_AGENT_LEARNING and result.get("status") == "success":
            await self.context_manager.store_execution(
                framework="langchain",
                input_data=input_data,
                output_data=result.get("output"),
                metrics=result.get("metrics", {}),
            )
        
        return result


# Example usage
async def example_usage():
    """Example of using LangChainExecutor"""
    from sqlalchemy.orm import Session
    
    # Initialize dependencies
    db = None  # Get from dependency injection
    safety_engine = SafetyEngine(db=db)
    context_manager = ContextManager(db=db)
    
    # Create executor
    executor = LangChainExecutor(
        safety_engine=safety_engine,
        context_manager=context_manager,
    )
    
    # Define workflow
    nodes = [
        {
            "id": "agent-1",
            "type": "agent",
            "data": {
                "agentId": "test-agent",
                "provider": "openai",
                "model": "gpt-4",
                "system_prompt": "You are a helpful research assistant.",
                "tools": [
                    {
                        "name": "web_search",
                        "description": "Search the web for information",
                    }
                ],
            },
        }
    ]
    
    edges = []
    
    input_data = {
        "input": "What are the latest developments in AI agents?"
    }
    
    # Execute
    result = await executor.execute_with_safety(
        nodes=nodes,
        edges=edges,
        input_data=input_data,
        user_id=1,
    )
    
    print("Execution result:", result)
