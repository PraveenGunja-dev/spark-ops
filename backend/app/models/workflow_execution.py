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
    
    status = Column(SQLEnum(ExecutionStatus), default=ExecutionStatus.PENDING, nullable=False, index=True)
    
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
    
    # Metadata
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    workflow = relationship("Workflow", back_populates="executions")
    triggered_by = relationship("User")
    steps = relationship("WorkflowStep", back_populates="execution", cascade="all, delete-orphan")

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
