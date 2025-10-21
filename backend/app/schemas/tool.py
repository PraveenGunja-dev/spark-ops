"""
Tool Pydantic Schemas
Validation and serialization for Tool API
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.models.tool import ToolType, ToolStatus


# Request Schemas
class ToolCreate(BaseModel):
    """Schema for creating a new tool"""
    name: str = Field(..., min_length=1, max_length=255, description="Tool name")
    project_id: str = Field(..., description="Project ID this tool belongs to")
    kind: str = Field(..., description="Tool kind/category")  # Will be stored as type in DB
    auth_type: str = Field(..., description="Authentication type")
    
    # Optional fields
    provider: Optional[str] = Field(None, max_length=100, description="Tool provider (e.g., OpenAI, Slack)")
    description: Optional[str] = Field(None, description="Tool description")
    env: str = Field(..., pattern="^(dev|staging|prod)$", description="Environment")
    
    # Configuration
    scopes: List[str] = Field(default_factory=list, description="OAuth scopes or permissions")
    rate_limit_per_min: Optional[int] = Field(None, ge=1, description="Rate limit per minute")
    
    # Tool specification (OpenAI function format)
    function_schema: Dict[str, Any] = Field(default_factory=dict, description="OpenAI function schema")
    config: Dict[str, Any] = Field(default_factory=dict, description="Tool configuration")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Custom metadata")
    
    # Flags
    is_global: bool = Field(default=False, description="Available to all agents in project")
    is_enabled: bool = Field(default=True, description="Tool is enabled")


class ToolUpdate(BaseModel):
    """Schema for updating an existing tool"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    kind: Optional[str] = None
    auth_type: Optional[str] = None
    provider: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    env: Optional[str] = Field(None, pattern="^(dev|staging|prod)$")
    scopes: Optional[List[str]] = None
    rate_limit_per_min: Optional[int] = Field(None, ge=1)
    function_schema: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    is_global: Optional[bool] = None
    is_enabled: Optional[bool] = None


# Response Schemas
class ToolResponse(BaseModel):
    """Schema for tool response - matches frontend Tool type"""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    id: str
    name: str
    kind: str
    provider: Optional[str] = None
    auth_type: str = Field(serialization_alias="authType")
    scopes: List[str] = Field(default_factory=list)
    project_id: str = Field(serialization_alias="projectId")
    env: str
    created_at: datetime = Field(serialization_alias="createdAt")
    last_error_at: Optional[datetime] = Field(None, serialization_alias="lastErrorAt")
    rate_limit_per_min: Optional[int] = Field(None, serialization_alias="rateLimitPerMin")
    
    # Additional fields not in frontend type but useful
    description: Optional[str] = None
    function_schema: Dict[str, Any] = Field(default_factory=dict, serialization_alias="functionSchema")
    config: Dict[str, Any] = Field(default_factory=dict)
    metadata_: Dict[str, Any] = Field(default_factory=dict, alias="metadata")
    is_global: bool = Field(serialization_alias="isGlobal")
    is_enabled: bool = Field(serialization_alias="isEnabled")
    updated_at: datetime = Field(serialization_alias="updatedAt")


class ToolListResponse(BaseModel):
    """Paginated response for tool list"""
    items: List[ToolResponse]
    total: int
    page: int
    page_size: int = Field(serialization_alias="pageSize")
    total_pages: int = Field(serialization_alias="totalPages")


class ToolTestResponse(BaseModel):
    """Response for tool connection test"""
    success: bool
    message: str
    details: Optional[Dict[str, Any]] = None
