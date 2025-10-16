"""
Workflow Model - Orchestration workflows for multi-agent coordination
"""
import uuid
import enum
from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class WorkflowStatus(str, enum.Enum):
    """Workflow status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"
    ARCHIVED = "archived"


class WorkflowTriggerType(str, enum.Enum):
    """Workflow trigger type enumeration"""
    MANUAL = "manual"
    SCHEDULED = "scheduled"
    EVENT = "event"
    API = "api"
    WEBHOOK = "webhook"


class Workflow(Base, TimestampMixin):
    """
    Workflow model - represents an orchestrated sequence of agent tasks
    """
    __tablename__ = "workflows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(WorkflowStatus), default=WorkflowStatus.DRAFT, nullable=False)
    
    # Workflow definition
    definition = Column(JSONB, nullable=False)  # DAG structure with nodes and edges
    trigger_type = Column(SQLEnum(WorkflowTriggerType), default=WorkflowTriggerType.MANUAL, nullable=False)
    
    # Schedule configuration (for scheduled workflows)
    schedule_cron = Column(String(100), nullable=True)  # Cron expression
    
    # Configuration
    config = Column(JSONB, default=dict, nullable=False)
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    
    # Execution settings
    timeout_seconds = Column(Integer, default=3600, nullable=False)  # 1 hour default
    max_retries = Column(Integer, default=3, nullable=False)
    
    # Features
    enable_approval = Column(Boolean, default=False, nullable=False)
    enable_notifications = Column(Boolean, default=True, nullable=False)
    
    # Version control
    version = Column(String(20), default="1.0.0", nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="workflows")
    executions = relationship("WorkflowExecution", back_populates="workflow", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Workflow {self.name} ({self.status})>"
