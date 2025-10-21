"""
Agent Model - AI agents with capabilities and configurations
"""
import uuid
import enum
from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class AgentType(str, enum.Enum):
    """Agent type enumeration"""
    CONVERSATIONAL = "conversational"
    TASK_ORIENTED = "task_oriented"
    ANALYTICAL = "analytical"
    CREATIVE = "creative"
    CUSTOM = "custom"


class AgentStatus(str, enum.Enum):
    """Agent status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    TESTING = "testing"
    DEPRECATED = "deprecated"


class Agent(Base, TimestampMixin):
    """
    Agent model - represents an AI agent with specific capabilities
    """
    __tablename__ = "agents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    type = Column(SQLEnum(AgentType), default=AgentType.TASK_ORIENTED, nullable=False)
    status = Column(SQLEnum(AgentStatus), default=AgentStatus.TESTING, nullable=False)
    
    # Agent configuration
    model = Column(String(100), nullable=False)  # e.g., "gpt-4", "claude-3-opus"
    provider = Column(String(50), nullable=False)  # e.g., "openai", "anthropic"
    temperature = Column(Integer, default=7, nullable=False)  # 0-10 scale
    max_tokens = Column(Integer, default=2000, nullable=False)
    
    # Instructions and behavior
    system_prompt = Column(Text, nullable=True)
    instructions = Column(Text, nullable=True)
    
    # Capabilities
    tools = Column(ARRAY(String), default=list, nullable=False)  # Tool IDs the agent can use
    capabilities = Column(JSONB, default=dict, nullable=False)
    
    # Configuration
    config = Column(JSONB, default=dict, nullable=False)
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    
    # Features
    enable_memory = Column(Boolean, default=True, nullable=False)
    enable_tools = Column(Boolean, default=True, nullable=False)
    enable_code_interpreter = Column(Boolean, default=False, nullable=False)
    
    # Version control
    version = Column(String(20), default="1.0.0", nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="agents")

    def __repr__(self):
        return f"<Agent {self.name} ({self.type})>"
