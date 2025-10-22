"""
Agent Executor - Core execution loop for APA agents using ReAct pattern
"""
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session

from app.models import Agent, WorkflowExecution, AgentReasoningTrace, LearningFeedback
from app.services.apa.reasoning_engine import ReasoningEngine
from app.services.apa.context_manager import ContextManager
from app.services.apa.safety_engine import SafetyEngine
from app.services.apa.vector_store import VectorStore
from app.services.apa.tool_registry import ToolRegistry


class AgentExecutor:
    """
    Agent Executor implementing the ReAct pattern (Reasoning + Acting)
    
    Execution Loop:
    1. Thought - Agent reasons about the task
    2. Action - Agent selects and executes an action
    3. Observation - Agent observes the result
    4. Reflection - Agent reflects on the outcome
    5. Repeat until task complete or max iterations
    """
    
    def __init__(
        self,
        db: Session,
        reasoning_engine: ReasoningEngine,
        context_manager: ContextManager,
        safety_engine: SafetyEngine,
        vector_store: Optional[VectorStore] = None,
        tool_registry: Optional[ToolRegistry] = None,
    ):
        self.db = db
        self.reasoning_engine = reasoning_engine
        self.context_manager = context_manager
        self.safety_engine = safety_engine
        self.vector_store = vector_store
        self.tool_registry = tool_registry or ToolRegistry(db)
    
    async def execute_task(
        self,
        agent: Agent,
        execution: WorkflowExecution,
        task: Dict[str, Any],
        max_iterations: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Execute a task using the ReAct pattern
        
        Args:
            agent: The agent to execute the task
            execution: The workflow execution context
            task: The task description and parameters
            max_iterations: Maximum reasoning iterations (defaults to agent.max_iterations)
        
        Returns:
            Execution result with status and output
        """
        max_iterations = max_iterations or getattr(agent, 'max_iterations', 10)
        
        # Load context
        context = await self.context_manager.load_context(
            agent_id=agent.id,
            execution_id=execution.id,
            task=task,
        )
        
        # Initialize state
        state = {
            "task": task,
            "context": context,
            "actions": [],
            "observations": [],
            "iteration": 0,
            "status": "running",
        }
        
        # Execute ReAct loop
        while state["iteration"] < max_iterations:
            step_index = state["iteration"]
            
            try:
                # 1. THOUGHT - Reasoning step
                thought = await self.reasoning_engine.reason(
                    agent=agent,
                    task=state["task"],
                    context=state["context"],
                    previous_actions=state["actions"],
                    previous_observations=state["observations"],
                )
                
                # 2. ACTION - Select and validate action
                action = thought.get("action", {})
                
                # Check if task is complete
                if action.get("type") == "finish":
                    state["status"] = "completed"
                    state["result"] = action.get("result", {})
                    
                    # Store final trace
                    await self._store_trace(
                        agent_id=agent.id,
                        run_id=execution.id,
                        step_index=step_index,
                        thought=thought.get("reasoning", ""),
                        action=action,
                        observation={"message": "Task completed"},
                        reflection=thought.get("reflection"),
                        tokens_used=thought.get("tokens_used"),
                        latency_ms=thought.get("latency_ms"),
                    )
                    break
                
                # 3. SAFETY CHECK
                safety_check = await self.safety_engine.validate_action(
                    agent=agent,
                    action=action,
                    context=state["context"],
                )
                
                if not safety_check["allowed"]:
                    # Handle blocked action
                    if safety_check.get("requires_human_approval"):
                        # Create HITL request
                        hitl_result = await self.safety_engine.request_human_approval(
                            agent=agent,
                            execution=execution,
                            action=action,
                            reason=safety_check.get("reason", "High-risk action"),
                            risk_level=safety_check.get("risk_level", "high"),
                        )
                        
                        if hitl_result["decision"] != "approved":
                            state["status"] = "blocked"
                            state["reason"] = safety_check["reason"]
                            break
                    else:
                        state["status"] = "blocked"
                        state["reason"] = safety_check["reason"]
                        break
                
                # 4. EXECUTE ACTION
                observation = await self._execute_action(
                    agent=agent,
                    action=action,
                    context=state["context"],
                )
                
                # 5. STORE TRACE
                await self._store_trace(
                    agent_id=agent.id,
                    run_id=execution.id,
                    step_index=step_index,
                    thought=thought.get("reasoning", ""),
                    action=action,
                    observation=observation,
                    reflection=thought.get("reflection"),
                    tokens_used=thought.get("tokens_used"),
                    latency_ms=thought.get("latency_ms"),
                )
                
                # 6. UPDATE STATE
                state["actions"].append(action)
                state["observations"].append(observation)
                state["iteration"] += 1
                
                # Update context with new information
                state["context"] = await self.context_manager.update_context(
                    context=state["context"],
                    action=action,
                    observation=observation,
                )
                
                # Store memory if enabled
                if agent.enable_memory:
                    await self.context_manager.store_memory(
                        agent_id=agent.id,
                        content=f"Action: {action.get('type')} - Result: {observation.get('status')}",
                        memory_type="episodic",
                        metadata={
                            "action": action,
                            "observation": observation,
                            "task_id": task.get("id"),
                        },
                    )
                
            except Exception as e:
                # Handle execution error
                state["status"] = "error"
                state["error"] = str(e)
                
                # Store error trace
                await self._store_trace(
                    agent_id=agent.id,
                    run_id=execution.id,
                    step_index=step_index,
                    thought="Error occurred during execution",
                    action=state["actions"][-1] if state["actions"] else {},
                    observation={"error": str(e)},
                    reflection="Execution failed",
                )
                
                # Store learning feedback
                if agent.enable_learning:
                    await self._store_learning_feedback(
                        agent_id=agent.id,
                        run_id=execution.id,
                        task_description=task.get("description", ""),
                        action_taken=state["actions"][-1] if state["actions"] else {},
                        outcome="failure",
                        success=False,
                        error_message=str(e),
                    )
                break
        
        # Check for timeout
        if state["iteration"] >= max_iterations and state["status"] == "running":
            state["status"] = "timeout"
            state["reason"] = f"Maximum iterations ({max_iterations}) exceeded"
        
        # Store final learning feedback on success
        if state["status"] == "completed" and agent.enable_learning:
            await self._store_learning_feedback(
                agent_id=agent.id,
                run_id=execution.id,
                task_description=task.get("description", ""),
                action_taken=state["actions"][-1] if state["actions"] else {},
                outcome="success",
                success=True,
            )
        
        return {
            "status": state["status"],
            "result": state.get("result"),
            "iterations": state["iteration"],
            "actions_taken": len(state["actions"]),
            "reason": state.get("reason"),
            "error": state.get("error"),
        }
    
    async def _execute_action(
        self,
        agent: Agent,
        action: Dict[str, Any],
        context: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Execute a specific action using the tool registry
        """
        action_type = action.get("type")
        action_params = action.get("parameters", {})
        
        # Execute tool through registry
        result = await self.tool_registry.execute_tool(
            tool_name=action_type,
            parameters=action_params,
            agent_id=agent.id,
        )
        
        return {
            "status": result.get("status", "success"),
            "action_type": action_type,
            "result": result.get("result"),
            "error": result.get("error"),
            "timestamp": datetime.utcnow().isoformat(),
        }
    
    async def _store_trace(
        self,
        agent_id: uuid.UUID,
        run_id: uuid.UUID,
        step_index: int,
        thought: str,
        action: Dict[str, Any],
        observation: Dict[str, Any],
        reflection: Optional[str] = None,
        tokens_used: Optional[int] = None,
        latency_ms: Optional[int] = None,
    ) -> None:
        """Store a reasoning trace step"""
        trace = AgentReasoningTrace(
            run_id=run_id,
            agent_id=agent_id,
            step_index=step_index,
            thought=thought,
            action=action,
            observation=observation,
            reflection=reflection,
            tokens_used=tokens_used,
            latency_ms=latency_ms,
        )
        self.db.add(trace)
        self.db.commit()
    
    async def _store_learning_feedback(
        self,
        agent_id: uuid.UUID,
        run_id: uuid.UUID,
        task_description: str,
        action_taken: Dict[str, Any],
        outcome: str,
        success: bool,
        error_message: Optional[str] = None,
    ) -> None:
        """Store learning feedback for continuous improvement"""
        feedback = LearningFeedback(
            agent_id=agent_id,
            run_id=run_id,
            feedback_type="execution_outcome",
            task_description=task_description,
            action_taken=action_taken,
            outcome=outcome,
            success=success,
            error_message=error_message,
            metadata={},
        )
        self.db.add(feedback)
        self.db.commit()
