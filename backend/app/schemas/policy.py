"""
Policy Pydantic Schemas
Validation and serialization for Policy API
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.models.policy import PolicyType, PolicyStatus


# Request Schemas
class PolicyCreate(BaseModel):
    """Schema for creating a new policy"""
    name: str = Field(..., min_length=1, max_length=255, description="Policy name")
    project_id: str = Field(..., description="Project ID this policy belongs to")
    description: Optional[str] = Field(None, description="Policy description")
    type: PolicyType = Field(..., description="Policy type")
    status: PolicyStatus = Field(default=PolicyStatus.ACTIVE, description="Policy status")
    
    # Policy configuration
    config: Dict[str, Any] = Field(default_factory=dict, description="Policy configuration")
    rules: List[Dict[str, Any]] = Field(default_factory=list, description="Policy rules")
    
    # Metadata
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Policy metadata")


class PolicyUpdate(BaseModel):
    """Schema for updating an existing policy"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[PolicyStatus] = None
    config: Optional[Dict[str, Any]] = None
    rules: Optional[List[Dict[str, Any]]] = None
    metadata: Optional[Dict[str, Any]] = None


# Response Schemas
class PolicyBase(BaseModel):
    """Base schema for policy responses"""
    id: str
    name: str
    project_id: str
    description: Optional[str] = None
    type: PolicyType
    status: PolicyStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PolicyResponse(PolicyBase):
    """Full policy response with configuration"""
    config: Dict[str, Any]
    rules: List[Dict[str, Any]]
    metadata: Dict[str, Any]


class PolicyListResponse(BaseModel):
    """Response schema for policy list"""
    items: List[PolicyResponse]
    total: int
    page: int
    page_size: int
    total_pages: int