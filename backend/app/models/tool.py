"""
Tool Model - Reusable tools/functions that agents can use
"""
import uuid
import enum
from sqlalchemy import Column, String, Text, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class ToolType(str, enum.Enum):
    """Tool type enumeration"""
    API = "api"
    FUNCTION = "function"
    DATABASE = "database"
    WEBHOOK = "webhook"
    INTEGRATION = "integration"
    CUSTOM = "custom"


class ToolStatus(str, enum.Enum):
    """Tool status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    TESTING = "testing"
    DEPRECATED = "deprecated"


class Tool(Base, TimestampMixin):
    """
    Tool model - represents a reusable function/capability
    """
    __tablename__ = "tools"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    type = Column(SQLEnum(ToolType), default=ToolType.FUNCTION, nullable=False)
    status = Column(SQLEnum(ToolStatus), default=ToolStatus.TESTING, nullable=False)
    
    # Tool definition (OpenAI function calling format)
    function_schema = Column(JSONB, nullable=False)  # JSON Schema for the function
    
    # Implementation details
    implementation = Column(Text, nullable=True)  # Code or endpoint
    endpoint_url = Column(String(500), nullable=True)  # For API/webhook tools
    
    # Authentication for external tools
    auth_config = Column(JSONB, default=dict, nullable=False)
    
    # Configuration
    config = Column(JSONB, default=dict, nullable=False)
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    
    # Features
    is_global = Column(Boolean, default=False, nullable=False)  # Available to all projects
    requires_approval = Column(Boolean, default=False, nullable=False)
    
    # Version control
    version = Column(String(20), default="1.0.0", nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="tools")

    def __repr__(self):
        return f"<Tool {self.name} ({self.type})>"
