"""
Schedule Pydantic Schemas
Validation and serialization for Schedule API
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.models.schedule import ScheduleStatus


# Request Schemas
class ScheduleCreate(BaseModel):
    """Schema for creating a new schedule"""
    name: str = Field(..., min_length=1, max_length=255, description="Schedule name")
    project_id: str = Field(..., description="Project ID this schedule belongs to")
    workflow_id: str = Field(..., description="Workflow ID to trigger")
    description: Optional[str] = Field(None, description="Schedule description")
    
    # Schedule configuration
    cron_expression: str = Field(..., description="Cron expression for scheduling")
    timezone: str = Field(default="UTC", description="Timezone for the schedule")
    
    # Configuration
    config: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class ScheduleUpdate(BaseModel):
    """Schema for updating an existing schedule"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[ScheduleStatus] = None
    cron_expression: Optional[str] = None
    timezone: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


# Response Schemas
class ScheduleBase(BaseModel):
    """Base schema for schedule responses"""
    id: str
    name: str
    project_id: str
    workflow_id: str
    description: Optional[str] = None
    status: ScheduleStatus
    cron_expression: str
    timezone: str
    next_run_at: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ScheduleResponse(ScheduleBase):
    """Full schedule response with configuration"""
    config: Dict[str, Any]
    metadata: Dict[str, Any]


class ScheduleListResponse(BaseModel):
    """Response schema for schedule list"""
    items: List[ScheduleResponse]
    total: int
    page: int
    page_size: int
    total_pages: int