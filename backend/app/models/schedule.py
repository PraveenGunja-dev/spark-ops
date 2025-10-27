"""
Schedule Model - Scheduled workflow triggers
"""
import uuid
import enum
from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class ScheduleStatus(str, enum.Enum):
    """Schedule status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    PAUSED = "paused"


class Schedule(Base, TimestampMixin):
    """
    Schedule model - represents a scheduled trigger for workflows
    """
    __tablename__ = "schedules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True)
    workflow_id = Column(UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(ScheduleStatus), default=ScheduleStatus.ACTIVE, nullable=False)
    
    # Schedule configuration
    cron_expression = Column(String(100), nullable=False)  # Cron expression for scheduling
    timezone = Column(String(50), default="UTC", nullable=False)
    
    # Next execution time (for optimization)
    next_run_at = Column(String(50), nullable=True)  # ISO format datetime
    
    # Configuration
    config = Column(JSONB, default=dict, nullable=False)
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="schedules")
    workflow = relationship("Workflow", back_populates="schedules")