"""
Workflow Pydantic Schemas
Validation and serialization for Workflow API
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.models.workflow import WorkflowStatus, WorkflowTriggerType


# Version tracking schema
class WorkflowVersion(BaseModel):
    """Schema for workflow version information"""
    version: int
    status: str  # 'draft' or 'released'
    updated_at: datetime = Field(serialization_alias="updatedAt")
    author_user_id: str = Field(serialization_alias="authorUserId")
    note: Optional[str] = None


# Request Schemas
class WorkflowCreate(BaseModel):
    """Schema for creating a new workflow"""
    name: str = Field(..., min_length=1, max_length=255, description="Workflow name")
    project_id: str = Field(..., description="Project ID this workflow belongs to")
    description: Optional[str] = Field(None, description="Workflow description")
    
    # Tags for categorization (matches frontend)
    tags: List[str] = Field(default_factory=list, description="Tags for categorization")
    
    # Workflow definition (DAG structure)
    definition: Dict[str, Any] = Field(default_factory=dict, description="Workflow DAG definition")
    
    # Trigger configuration
    trigger_type: WorkflowTriggerType = Field(default=WorkflowTriggerType.MANUAL)
    schedule_cron: Optional[str] = Field(None, description="Cron expression for scheduled workflows")
    
    # Execution settings
    timeout_seconds: int = Field(default=3600, ge=60, le=86400)
    max_retries: int = Field(default=3, ge=0, le=10)
    
    # Features
    enable_approval: bool = Field(default=False)
    enable_notifications: bool = Field(default=True)
    
    # Configuration
    config: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class WorkflowUpdate(BaseModel):
    """Schema for updating an existing workflow"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[WorkflowStatus] = None
    tags: Optional[List[str]] = None
    definition: Optional[Dict[str, Any]] = None
    trigger_type: Optional[WorkflowTriggerType] = None
    schedule_cron: Optional[str] = None
    timeout_seconds: Optional[int] = Field(None, ge=60, le=86400)
    max_retries: Optional[int] = Field(None, ge=0, le=10)
    enable_approval: Optional[bool] = None
    enable_notifications: Optional[bool] = None
    config: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


# Response Schemas
class WorkflowResponse(BaseModel):
    """Schema for workflow response - matches frontend Workflow type"""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    id: str
    name: str
    project_id: str = Field(serialization_alias="projectId")
    tags: List[str] = Field(default_factory=list)
    
    # Version information (frontend expects array of versions)
    versions: List[WorkflowVersion] = Field(default_factory=list)
    
    # Statistics (calculated from executions)
    avg_duration_ms: Optional[int] = Field(None, serialization_alias="avgDurationMs")
    success_rate: Optional[float] = Field(None, serialization_alias="successRate")
    last_run_at: Optional[datetime] = Field(None, serialization_alias="lastRunAt")
    
    # Additional fields
    description: Optional[str] = None
    status: str
    definition: Dict[str, Any] = Field(default_factory=dict)
    trigger_type: str = Field(serialization_alias="triggerType")
    schedule_cron: Optional[str] = Field(None, serialization_alias="scheduleCron")
    timeout_seconds: int = Field(serialization_alias="timeoutSeconds")
    max_retries: int = Field(serialization_alias="maxRetries")
    enable_approval: bool = Field(serialization_alias="enableApproval")
    enable_notifications: bool = Field(serialization_alias="enableNotifications")
    version: str
    config: Dict[str, Any] = Field(default_factory=dict)
    metadata_: Dict[str, Any] = Field(default_factory=dict, alias="metadata")
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")


class WorkflowListResponse(BaseModel):
    """Paginated response for workflow list"""
    items: List[WorkflowResponse]
    total: int
    page: int
    page_size: int = Field(serialization_alias="pageSize")
    total_pages: int = Field(serialization_alias="totalPages")


class WorkflowAnalyticsResponse(BaseModel):
    """Analytics for a specific workflow"""
    avg_duration_ms: int = Field(serialization_alias="avgDurationMs")
    success_rate: float = Field(serialization_alias="successRate")
    total_runs: int = Field(serialization_alias="totalRuns")
    last_run_at: Optional[datetime] = Field(None, serialization_alias="lastRunAt")
    failed_runs: int = Field(serialization_alias="failedRuns")
    succeeded_runs: int = Field(serialization_alias="succeededRuns")
