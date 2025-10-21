"""
Workflow Execution Models - Runtime tracking for workflow executions
"""
import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, ForeignKey, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class ExecutionStatus(str, enum.Enum):
    """Execution status enumeration"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"


class WorkflowExecution(Base, TimestampMixin):
    """
    Workflow Execution model - tracks individual workflow runs
    """
    __tablename__ = "workflow_executions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False, index=True)
    triggered_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Additional runtime context (stored in metadata for now, can be migrated to columns later)
    # agent_id, project_id, env are accessed via properties from metadata
    
    status = Column(SQLEnum(ExecutionStatus), default=ExecutionStatus.PENDING, nullable=False, index=True)
    
    # Execution tracking
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)  # Maps to ended_at in API
    duration_seconds = Column(Integer, nullable=True)  # Maps to duration_ms in API (converted)
    
    # Input/Output
    input_data = Column(JSONB, default=dict, nullable=False)
    output_data = Column(JSONB, default=dict, nullable=False)
    
    # Error tracking
    error_message = Column(Text, nullable=True)
    error_details = Column(JSONB, default=dict, nullable=False)
    
    # Metadata (stores agent_id, project_id, env, etc.)
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    workflow = relationship("Workflow", back_populates="executions")
    triggered_by = relationship("User")
    steps = relationship("WorkflowStep", back_populates="execution", cascade="all, delete-orphan")
    
    # Properties for API compatibility
    @property
    def agent_id(self):
        """Get agent_id from metadata"""
        agent_id_str = self.metadata_.get('agent_id')
        return UUID(agent_id_str) if agent_id_str else None
    
    @property
    def project_id(self):
        """Get project_id from metadata"""
        project_id_str = self.metadata_.get('project_id')
        return UUID(project_id_str) if project_id_str else None
    
    @property
    def env(self):
        """Get environment from metadata"""
        return self.metadata_.get('env', 'dev')
    
    @property
    def ended_at(self):
        """Alias for completed_at"""
        return self.completed_at
    
    @property
    def duration_ms(self):
        """Convert duration_seconds to milliseconds"""
        return self.duration_seconds * 1000 if self.duration_seconds else None

    def __repr__(self):
        return f"<WorkflowExecution {self.id} ({self.status})>"


class WorkflowStep(Base, TimestampMixin):
    """
    Workflow Step model - tracks individual steps within an execution
    """
    __tablename__ = "workflow_steps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    execution_id = Column(UUID(as_uuid=True), ForeignKey("workflow_executions.id"), nullable=False, index=True)
    
    # Step identification
    step_id = Column(String(100), nullable=False)  # ID from workflow definition
    step_name = Column(String(255), nullable=False)
    step_type = Column(String(50), nullable=False)  # "agent", "tool", "condition", etc.
    
    # Status
    status = Column(SQLEnum(ExecutionStatus), default=ExecutionStatus.PENDING, nullable=False)
    
    # Execution tracking
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    duration_seconds = Column(Integer, nullable=True)
    
    # Input/Output
    input_data = Column(JSONB, default=dict, nullable=False)
    output_data = Column(JSONB, default=dict, nullable=False)
    
    # Error tracking
    error_message = Column(Text, nullable=True)
    error_details = Column(JSONB, default=dict, nullable=False)
    
    # Agent/Tool used
    agent_id = Column(UUID(as_uuid=True), nullable=True)
    tool_id = Column(UUID(as_uuid=True), nullable=True)
    
    # Metadata
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    execution = relationship("WorkflowExecution", back_populates="steps")

    def __repr__(self):
        return f"<WorkflowStep {self.step_name} ({self.status})>"
