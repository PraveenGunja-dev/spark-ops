"""
Run (WorkflowExecution) Pydantic Schemas
Validation and serialization for Run/WorkflowExecution API
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.models.workflow_execution import ExecutionStatus


# Request Schemas
class RunCreate(BaseModel):
    """Schema for creating a new run (triggering workflow execution)"""
    workflow_id: str = Field(..., description="Workflow ID to execute")
    agent_id: str = Field(..., description="Agent ID to execute workflow")
    env: str = Field(..., pattern="^(dev|staging|prod)$", description="Environment")
    trigger: str = Field(default="manual", description="Trigger type")
    
    # Optional runtime parameters
    input_data: Dict[str, Any] = Field(default_factory=dict, description="Input data for execution")
    config: Dict[str, Any] = Field(default_factory=dict, description="Runtime configuration overrides")


class RunUpdate(BaseModel):
    """Schema for updating a run (mainly status updates)"""
    status: Optional[str] = None
    ended_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    output_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None


# Response Schemas  
class RunStepResponse(BaseModel):
    """Schema for run step response - matches frontend RunStep type"""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    id: str
    run_id: str = Field(serialization_alias="runId")
    idx: int
    type: str
    name: str
    started_at: datetime = Field(serialization_alias="startedAt")
    ended_at: datetime = Field(serialization_alias="endedAt")
    duration_ms: int = Field(serialization_alias="durationMs")
    success: bool
    error_message: Optional[str] = Field(None, serialization_alias="errorMessage")
    request: Optional[Dict[str, Any]] = Field(None, serialization_alias="request")
    response: Optional[Dict[str, Any]] = Field(None, serialization_alias="response")


class RunResponse(BaseModel):
    """Schema for run response - matches frontend Run type"""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    id: str
    workflow_id: str = Field(serialization_alias="workflowId")
    workflow_version: int = Field(1, serialization_alias="workflowVersion")
    agent_id: str = Field(serialization_alias="agentId")
    project_id: str = Field(serialization_alias="projectId")
    env: str
    trigger: str
    status: str
    started_at: datetime = Field(serialization_alias="startedAt")
    ended_at: Optional[datetime] = Field(None, serialization_alias="endedAt")
    duration_ms: Optional[int] = Field(None, serialization_alias="durationMs")
    
    # Metrics (optional, calculated from execution)
    tokens_prompt: Optional[int] = Field(None, serialization_alias="tokensPrompt")
    tokens_completion: Optional[int] = Field(None, serialization_alias="tokensCompletion")
    usd_cost: Optional[float] = Field(None, serialization_alias="usdCost")
    
    retries: int = Field(default=0)
    has_human_in_loop: bool = Field(default=False, serialization_alias="hasHumanInLoop")
    region: str = Field(default="us-east-1")
    
    # Additional fields
    input_data: Dict[str, Any] = Field(default_factory=dict, serialization_alias="inputData")
    output_data: Dict[str, Any] = Field(default_factory=dict, serialization_alias="outputData")
    error_message: Optional[str] = Field(None, serialization_alias="errorMessage")
    config: Dict[str, Any] = Field(default_factory=dict)
    metadata_: Dict[str, Any] = Field(default_factory=dict, alias="metadata")


class RunListResponse(BaseModel):
    """Paginated response for run list"""
    items: List[RunResponse] = Field(default_factory=list, alias="runs")
    total: int
    page: int
    page_size: int = Field(serialization_alias="pageSize", alias="limit")
    total_pages: int = Field(serialization_alias="totalPages")


class RunStepCreate(BaseModel):
    """Schema for creating a run step"""
    run_id: str
    step_index: int
    step_type: str  # Changed from StepType enum
    name: str
    agent_id: Optional[str] = None
    tool_id: Optional[str] = None
    input_data: Dict[str, Any] = Field(default_factory=dict)


class RunStepUpdate(BaseModel):
    """Schema for updating a run step"""
    ended_at: Optional[datetime] = None
    duration_ms: Optional[int] = None
    success: Optional[bool] = None
    output_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
