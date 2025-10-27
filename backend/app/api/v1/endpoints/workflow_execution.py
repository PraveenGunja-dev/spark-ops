"""
Workflow Execution API Endpoints
Multi-framework execution support for workflows
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.core.config import settings
from app.services.apa.safety_engine import SafetyEngine
from app.services.apa.context_manager import ContextManager
from app.services.apa.langchain_executor import LangChainExecutor
from app.services.apa.crew_orchestrator import CrewOrchestrator
from app.services.apa.workflow_engine import WorkflowEngine

router = APIRouter()


# Request/Response Models
class WorkflowNode(BaseModel):
    """Workflow node representation"""
    id: str
    type: str
    data: Dict[str, Any]
    position: Optional[Dict[str, float]] = None


class WorkflowEdge(BaseModel):
    """Workflow edge representation"""
    id: Optional[str] = None
    source: str
    target: str
    data: Optional[Dict[str, Any]] = None


class WorkflowExecutionRequest(BaseModel):
    """Request model for workflow execution"""
    workflowId: Optional[str] = Field(None, description="Optional workflow ID for persistence")
    framework: str = Field(..., description="Execution framework: langchain, crewai, langgraph, or custom")
    nodes: List[WorkflowNode] = Field(..., description="List of workflow nodes")
    edges: List[WorkflowEdge] = Field(..., description="List of workflow edges")
    input: Optional[Dict[str, Any]] = Field(None, description="Input data for the workflow")


class WorkflowExecutionResponse(BaseModel):
    """Response model for workflow execution"""
    status: str
    output: Optional[str] = None
    error: Optional[str] = None
    metrics: Dict[str, Any]
    framework: str
    trace: Optional[Dict[str, Any]] = None


class WorkflowAnalysisRequest(BaseModel):
    """Request model for workflow analysis"""
    nodes: List[WorkflowNode]
    edges: List[WorkflowEdge]


class WorkflowAnalysisResponse(BaseModel):
    """Response model for workflow analysis"""
    suggested_framework: str
    reason: str
    workflow_stats: Dict[str, Any]
    compatible_frameworks: List[str]


@router.post("/workflows/execute", response_model=WorkflowExecutionResponse)
async def execute_workflow(
    request: WorkflowExecutionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkflowExecutionResponse:
    """
    Execute a workflow using the specified framework.
    
    Supports:
    - langchain: Single-agent ReAct pattern
    - crewai: Multi-agent collaboration
    - langgraph: State machine with conditional logic
    - custom: Custom implementation
    """
    try:
        # Initialize services
        safety_engine = SafetyEngine(db=db)
        context_manager = ContextManager(db=db)
        
        # Convert Pydantic models to dicts
        nodes = [node.model_dump() for node in request.nodes]
        edges = [edge.model_dump() for edge in request.edges]
        
        # Route to appropriate executor based on framework
        framework = request.framework.lower()
        
        if framework == "langchain":
            executor = LangChainExecutor(
                safety_engine=safety_engine,
                context_manager=context_manager,
            )
            result = await executor.execute_with_safety(
                nodes=nodes,
                edges=edges,
                input_data=request.input,
                user_id=current_user.id,
            )
            
        elif framework == "crewai":
            orchestrator = CrewOrchestrator(
                safety_engine=safety_engine,
                context_manager=context_manager,
            )
            result = await orchestrator.execute_with_safety(
                nodes=nodes,
                edges=edges,
                input_data=request.input,
                user_id=current_user.id,
            )
            
        elif framework == "langgraph":
            workflow_engine = WorkflowEngine(
                safety_engine=safety_engine,
                context_manager=context_manager,
            )
            result = await workflow_engine.execute_with_safety(
                nodes=nodes,
                edges=edges,
                input_data=request.input,
                user_id=current_user.id,
            )
            
        elif framework == "custom":
            # Use existing custom implementation
            from app.services.apa.agent_executor import AgentExecutor
            from app.services.apa.reasoning_engine import ReasoningEngine
            
            reasoning_engine = ReasoningEngine(llm_provider=settings.DEFAULT_LLM_PROVIDER)
            executor = AgentExecutor(
                db=db,
                reasoning_engine=reasoning_engine,
                context_manager=context_manager,
                safety_engine=safety_engine,
            )
            # Custom executor expects different format, adapt as needed
            result = {
                "status": "success",
                "output": "Custom execution not yet fully adapted to new workflow format",
                "metrics": {},
                "framework": "custom",
            }
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported framework: {framework}. Use langchain, crewai, langgraph, or custom.",
            )
        
        return WorkflowExecutionResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Workflow execution failed: {str(e)}",
        )


@router.post("/workflows/analyze", response_model=WorkflowAnalysisResponse)
async def analyze_workflow(
    request: WorkflowAnalysisRequest,
    current_user: User = Depends(get_current_user),
) -> WorkflowAnalysisResponse:
    """
    Analyze workflow structure and suggest optimal framework.
    
    Returns:
    - Recommended framework
    - Reasoning for recommendation
    - Workflow statistics
    - List of compatible frameworks
    """
    try:
        nodes = [node.model_dump() for node in request.nodes]
        edges = [edge.model_dump() for edge in request.edges]
        
        # Analyze workflow characteristics
        node_count = len(nodes)
        edge_count = len(edges)
        
        # Count agent nodes
        agent_count = sum(1 for node in nodes if node.get("type") == "agent")
        
        # Detect conditions (decision nodes or conditional edges)
        has_conditions = (
            any(node.get("type") == "decision" for node in nodes) or
            any(edge.get("data", {}).get("condition") for edge in edges)
        )
        
        # Detect parallel paths (nodes with multiple outgoing edges)
        has_parallel_paths = any(
            sum(1 for edge in edges if edge.get("source") == node.get("id")) > 1
            for node in nodes
        )
        
        # Suggest framework based on analysis
        suggested_framework = "custom"
        reason = "Default framework for simple workflows"
        compatible_frameworks = ["custom"]
        
        if node_count == 0:
            reason = "No nodes in workflow"
        elif node_count == 1 or agent_count == 1:
            suggested_framework = "langchain"
            reason = f"Single agent workflow detected ({node_count} node) - LangChain ReAct is optimal for single-agent tasks with reasoning loops"
            compatible_frameworks = ["langchain", "custom"]
        elif has_conditions and has_parallel_paths:
            suggested_framework = "langgraph"
            reason = "Complex workflow with conditional logic and parallel paths - LangGraph provides robust state machine capabilities"
            compatible_frameworks = ["langgraph", "crewai", "custom"]
        elif agent_count > 1:
            suggested_framework = "crewai"
            reason = f"Multi-agent workflow with {agent_count} agents - CrewAI excels at coordinating multiple agents with shared context"
            compatible_frameworks = ["crewai", "langgraph", "custom"]
        elif has_conditions:
            suggested_framework = "langgraph"
            reason = "Workflow contains conditional logic - LangGraph state machine is recommended for condition handling"
            compatible_frameworks = ["langgraph", "custom"]
        
        workflow_stats = {
            "node_count": node_count,
            "edge_count": edge_count,
            "agent_count": agent_count,
            "has_conditions": has_conditions,
            "has_parallel_paths": has_parallel_paths,
        }
        
        return WorkflowAnalysisResponse(
            suggested_framework=suggested_framework,
            reason=reason,
            workflow_stats=workflow_stats,
            compatible_frameworks=compatible_frameworks,
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Workflow analysis failed: {str(e)}",
        )


@router.get("/workflows/frameworks")
async def list_frameworks(
    current_user: User = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    List all available execution frameworks and their characteristics.
    """
    return {
        "frameworks": [
            {
                "id": "langchain",
                "name": "LangChain ReAct",
                "description": "Best for single-agent tasks with Reasoning-Action-Observation loop",
                "use_cases": ["single-agent", "code-execution"],
                "pros": [
                    "Battle-tested and stable",
                    "Extensive tool ecosystem",
                    "Great documentation",
                    "Built-in memory management",
                    "Easy to debug",
                ],
                "cons": [
                    "Not optimized for multi-agent",
                    "Less structured than alternatives",
                ],
            },
            {
                "id": "crewai",
                "name": "CrewAI",
                "description": "Built for multi-agent collaboration with roles and processes",
                "use_cases": ["sequential-multi-agent", "parallel-multi-agent", "research-analysis"],
                "pros": [
                    "Purpose-built for multi-agent",
                    "Sequential & hierarchical processes",
                    "Shared memory between agents",
                    "Role-based agent design",
                    "Production-ready",
                ],
                "cons": [
                    "Overkill for single-agent tasks",
                    "More complex setup",
                ],
            },
            {
                "id": "langgraph",
                "name": "LangGraph",
                "description": "State machine-based workflow engine for complex conditional logic",
                "use_cases": ["conditional-workflow", "sequential-multi-agent"],
                "pros": [
                    "Excellent for conditional logic",
                    "State persistence",
                    "Cyclic workflows supported",
                    "Visual workflow graphs",
                    "Human-in-the-loop built-in",
                ],
                "cons": [
                    "Steeper learning curve",
                    "More verbose code",
                ],
            },
            {
                "id": "custom",
                "name": "Custom Implementation",
                "description": "Use our custom ReAct engine with full control",
                "use_cases": ["single-agent", "code-execution"],
                "pros": [
                    "Full control over execution",
                    "Custom safety engine integration",
                    "No external dependencies",
                    "Optimized for our use case",
                ],
                "cons": [
                    "More maintenance required",
                    "Limited community support",
                ],
            },
        ]
    }
