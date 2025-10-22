"""
Multi-Agent Collaboration Models - APA multi-agent coordination
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base


class MultiAgentCollaboration(Base):
    """
    Multi-Agent Collaboration - Tracks multi-agent coordination sessions
    """
    __tablename__ = "multi_agent_collaborations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("workflow_executions.id", ondelete="CASCADE"), nullable=False, index=True)
    coordinator_agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False)
    participant_agent_ids = Column(ARRAY(UUID(as_uuid=True)), nullable=False)
    
    collaboration_type = Column(String(50), nullable=False)  # "sequential", "parallel", "hierarchical"
    shared_context = Column(JSONB, default=dict, nullable=False)
    communication_log = Column(JSONB, default=list, nullable=False)  # Array of messages
    
    status = Column(String(50), nullable=False)  # "active", "completed", "failed"
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    execution = relationship("WorkflowExecution", foreign_keys=[run_id])
    coordinator = relationship("Agent", foreign_keys=[coordinator_agent_id])

    def __repr__(self):
        return f"<MultiAgentCollaboration type={self.collaboration_type} coordinator={self.coordinator_agent_id}>"
