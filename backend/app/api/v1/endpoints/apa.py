"""
APA API Endpoints - Agent reasoning and execution
"""
from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models import User, Agent, WorkflowExecution, AgentReasoningTrace
from app.schemas.apa import (
    AgentReasonRequest,
    AgentReasonResponse,
    ReasoningTraceResponse,
    LearningFeedbackRequest,
    LearningFeedbackResponse,
    AgentMemoryResponse,
)
from app.services.apa.agent_executor import AgentExecutor
from app.services.apa.reasoning_engine import ReasoningEngine
from app.services.apa.context_manager import ContextManager
from app.services.apa.safety_engine import SafetyEngine
from app.services.apa.vector_store import VectorStore
from app.services.apa.tool_registry import ToolRegistry

router = APIRouter()


# Initialize APA services (in production, these should be dependency injected)
def get_agent_executor(db: Session = Depends(get_db)) -> AgentExecutor:
    """Get agent executor instance with all dependencies"""
    # Initialize services
    reasoning_engine = ReasoningEngine(llm_provider="openai")
    vector_store = VectorStore(store_type="chromadb")
    context_manager = ContextManager(db, vector_store=vector_store)
    safety_engine = SafetyEngine(db)
    tool_registry = ToolRegistry(db)
    
    return AgentExecutor(
        db=db,
        reasoning_engine=reasoning_engine,
        context_manager=context_manager,
        safety_engine=safety_engine,
        vector_store=vector_store,
        tool_registry=tool_registry,
    )


@router.post("/agents/{agent_id}/reason", response_model=AgentReasonResponse)
async def agent_reason(
    agent_id: UUID,
    request: AgentReasonRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Trigger agent reasoning for a task
    """
    # Get agent
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    
    # Create or get execution
    execution_id = request.execution_id
    if execution_id:
        execution = db.query(WorkflowExecution).filter(WorkflowExecution.id == execution_id).first()
        if not execution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Execution {execution_id} not found"
            )
    else:
        # Create a new execution for this reasoning task
        execution = WorkflowExecution(
            workflow_id=agent.project_id,  # Placeholder
            status="running",
            metadata_={"task": request.dict(), "agent_id": str(agent_id)},
        )
        db.add(execution)
        db.commit()
        db.refresh(execution)
    
    # Execute task using agent executor
    executor = get_agent_executor(db)
    result = await executor.execute_task(
        agent=agent,
        execution=execution,
        task={
            "description": request.description,
            "parameters": request.parameters,
        },
        max_iterations=request.max_iterations,
    )
    
    return AgentReasonResponse(
        agent_id=str(agent_id),
        execution_id=str(execution.id),
        result=result,
    )


@router.get("/agents/{agent_id}/reasoning-trace", response_model=ReasoningTraceResponse)
async def get_agent_reasoning_trace(
    agent_id: UUID,
    run_id: Optional[UUID] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get reasoning traces for an agent
    
    Query parameters:
    - run_id: Filter by specific run
    - limit: Maximum number of traces to return
    """
    query = db.query(AgentReasoningTrace).filter(AgentReasoningTrace.agent_id == agent_id)
    
    if run_id:
        query = query.filter(AgentReasoningTrace.run_id == run_id)
    
    traces = query.order_by(AgentReasoningTrace.created_at.desc()).limit(limit).all()
    
    return {
        "agent_id": str(agent_id),
        "run_id": str(run_id) if run_id else None,
        "count": len(traces),
        "traces": [
            {
                "id": str(trace.id),
                "run_id": str(trace.run_id),
                "step_index": trace.step_index,
                "thought": trace.thought,
                "action": trace.action,
                "observation": trace.observation,
                "reflection": trace.reflection,
                "tokens_used": trace.tokens_used,
                "latency_ms": trace.latency_ms,
                "created_at": trace.created_at.isoformat(),
            }
            for trace in traces
        ],
    }


@router.post("/agents/{agent_id}/learn", response_model=LearningFeedbackResponse)
async def agent_learn(
    agent_id: UUID,
    request: LearningFeedbackRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Provide learning feedback to an agent
    """
    from app.models import LearningFeedback
    
    # Get agent
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent {agent_id} not found"
        )
    
    # Create learning feedback
    learning_feedback = LearningFeedback(
        agent_id=agent_id,
        feedback_type="manual",
        task_description=request.task_description,
        action_taken=request.action_taken,
        outcome=request.outcome,
        success=request.success,
        error_message=request.error_message,
        improvement_suggestions=request.improvement_suggestions,
        metadata_={"source": "user", "user_id": str(current_user.id)},
    )
    
    db.add(learning_feedback)
    db.commit()
    db.refresh(learning_feedback)
    
    return LearningFeedbackResponse(
        feedback_id=str(learning_feedback.id),
        agent_id=str(agent_id),
        status="stored",
    )


@router.get("/agents/{agent_id}/memory", response_model=AgentMemoryResponse)
async def get_agent_memory(
    agent_id: UUID,
    memory_type: Optional[str] = None,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get agent's memory
    
    Query parameters:
    - memory_type: Filter by memory type (episodic, semantic, procedural)
    - limit: Maximum number of memories to return
    """
    from app.models import AgentMemory
    
    query = db.query(AgentMemory).filter(AgentMemory.agent_id == agent_id)
    
    if memory_type:
        query = query.filter(AgentMemory.memory_type == memory_type)
    
    memories = query.order_by(AgentMemory.created_at.desc()).limit(limit).all()
    
    return {
        "agent_id": str(agent_id),
        "memory_type": memory_type,
        "count": len(memories),
        "memories": [
            {
                "id": str(memory.id),
                "type": memory.memory_type,
                "content": memory.content,
                "importance_score": memory.importance_score,
                "access_count": memory.access_count,
                "last_accessed_at": memory.last_accessed_at.isoformat() if memory.last_accessed_at else None,
                "created_at": memory.created_at.isoformat(),
            }
            for memory in memories
        ],
    }
