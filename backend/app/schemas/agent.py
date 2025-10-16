"""
Agent Pydantic Schemas
Validation and serialization for Agent API
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator, ConfigDict
from app.models.agent import AgentType, AgentStatus


# Request Schemas
class AgentCreate(BaseModel):
    """Schema for creating a new agent"""
    name: str = Field(..., min_length=1, max_length=255, description="Agent name")
    project_id: str = Field(..., description="Project ID this agent belongs to")
    type: AgentType = Field(default=AgentType.TASK_ORIENTED, description="Agent type")
    
    # AI Configuration
    model: str = Field(..., min_length=1, max_length=100, description="LLM model (e.g., gpt-4, claude-3-opus)")
    provider: str = Field(..., min_length=1, max_length=50, description="LLM provider (e.g., openai, anthropic)")
    temperature: int = Field(default=7, ge=0, le=10, description="Temperature (0-10 scale)")
    
    # Runtime Configuration
    runtime: str = Field(..., pattern="^(python|node)$", description="Runtime environment")
    env: str = Field(..., pattern="^(dev|staging|prod)$", description="Environment")
    concurrency: int = Field(default=1, ge=1, le=100, description="Max concurrent executions")
    
    # Instructions
    system_prompt: Optional[str] = Field(None, description="System prompt for the agent")
    instructions: Optional[str] = Field(None, description="Behavioral instructions")
    prompt_summary: Optional[str] = Field(None, max_length=500, description="Brief prompt summary")
    
    # Capabilities
    tools: List[str] = Field(default_factory=list, description="List of tool IDs")
    capabilities: Dict[str, Any] = Field(default_factory=dict, description="Agent capabilities")
    
    # Autoscaling
    autoscale_min: int = Field(default=1, ge=1, le=100, description="Min autoscale instances")
    autoscale_max: int = Field(default=10, ge=1, le=100, description="Max autoscale instances")
    autoscale_target_cpu: int = Field(default=70, ge=1, le=100, description="Target CPU % for autoscaling")
    
    # Configuration
    config: Dict[str, Any] = Field(default_factory=dict, description="Additional configuration")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Custom metadata")

    @field_validator('autoscale_max')
    @classmethod
    def validate_autoscale(cls, v: int, info) -> int:
        """Ensure autoscale_max >= autoscale_min"""
        if 'autoscale_min' in info.data and v < info.data['autoscale_min']:
            raise ValueError('autoscale_max must be >= autoscale_min')
        return v


class AgentUpdate(BaseModel):
    """Schema for updating an existing agent"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    type: Optional[AgentType] = None
    status: Optional[AgentStatus] = None
    
    # AI Configuration
    model: Optional[str] = Field(None, min_length=1, max_length=100)
    provider: Optional[str] = Field(None, min_length=1, max_length=50)
    temperature: Optional[int] = Field(None, ge=0, le=10)
    
    # Runtime Configuration
    runtime: Optional[str] = Field(None, pattern="^(python|node)$")
    env: Optional[str] = Field(None, pattern="^(dev|staging|prod)$")
    concurrency: Optional[int] = Field(None, ge=1, le=100)
    
    # Instructions
    system_prompt: Optional[str] = None
    instructions: Optional[str] = None
    prompt_summary: Optional[str] = Field(None, max_length=500)
    
    # Capabilities
    tools: Optional[List[str]] = None
    capabilities: Optional[Dict[str, Any]] = None
    
    # Autoscaling
    autoscale_min: Optional[int] = Field(None, ge=1, le=100)
    autoscale_max: Optional[int] = Field(None, ge=1, le=100)
    autoscale_target_cpu: Optional[int] = Field(None, ge=1, le=100)
    
    # Configuration
    config: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


# Response Schemas
class AgentResponse(BaseModel):
    """Schema for agent response - matches frontend Agent type"""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    
    id: str
    name: str
    runtime: str
    model: str
    tools: List[str]
    project_id: str = Field(serialization_alias="projectId")
    env: str
    concurrency: int
    
    # Status
    type: AgentType
    status: AgentStatus
    health: str = Field(default="healthy")
    last_heartbeat: Optional[datetime] = Field(None, serialization_alias="lastHeartbeat")
    
    # Instructions
    prompt_summary: Optional[str] = Field(None, serialization_alias="promptSummary")
    system_prompt: Optional[str] = None
    instructions: Optional[str] = None
    
    # Additional fields
    provider: str
    temperature: int
    capabilities: Dict[str, Any] = Field(default_factory=dict)
    config: Dict[str, Any] = Field(default_factory=dict)
    metadata_: Dict[str, Any] = Field(default_factory=dict, alias="metadata")
    
    # Autoscale fields from database
    autoscale_min: int = 1
    autoscale_max: int = 10
    autoscale_target_cpu: int = 70
    
    # Timestamps
    created_at: datetime = Field(serialization_alias="createdAt")
    updated_at: datetime = Field(serialization_alias="updatedAt")

    def model_dump(self, **kwargs):
        """Override to add autoscale dict when serializing"""
        data = super().model_dump(**kwargs)
        # Add autoscale as a dict
        data['autoscale'] = {
            "min": self.autoscale_min,
            "max": self.autoscale_max,
            "targetCpu": self.autoscale_target_cpu
        }
        # Remove individual autoscale fields
        data.pop('autoscale_min', None)
        data.pop('autoscale_max', None)
        data.pop('autoscale_target_cpu', None)
        return data


class AgentListResponse(BaseModel):
    """Paginated response for agent list"""
    items: List[AgentResponse]
    total: int
    page: int
    page_size: int = Field(serialization_alias="pageSize")
    total_pages: int = Field(serialization_alias="totalPages")


class AgentHealthResponse(BaseModel):
    """Agent health metrics"""
    health: str = Field(..., pattern="^(healthy|degraded|unhealthy)$")
    last_heartbeat: Optional[datetime] = Field(None, serialization_alias="lastHeartbeat")
    metrics: Dict[str, Any] = Field(default_factory=dict)
    uptime_seconds: Optional[int] = Field(None, serialization_alias="uptimeSeconds")
    error_count: Optional[int] = Field(None, serialization_alias="errorCount")
    last_error: Optional[str] = Field(None, serialization_alias="lastError")
