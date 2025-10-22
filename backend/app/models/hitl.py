"""
Human-in-the-Loop (HITL) Models - APA safety and governance
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base


class HITLRequest(Base):
    """
    HITL Request - Human approval requests for high-risk actions
    """
    __tablename__ = "hitl_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("workflow_executions.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True)
    step_id = Column(UUID(as_uuid=True), nullable=True)
    
    request_type = Column(String(50), nullable=False)  # "action_approval", "decision_input", "error_resolution"
    reason = Column(Text, nullable=False)
    action_details = Column(JSONB, default=dict, nullable=False)
    risk_level = Column(String(20), nullable=False)  # "low", "medium", "high", "critical"
    
    # Status tracking
    status = Column(String(50), nullable=False, server_default="pending", index=True)  # "pending", "approved", "rejected", "timeout"
    requested_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    responded_at = Column(DateTime, nullable=True)
    responded_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    # Decision
    decision = Column(String(20), nullable=True)  # "approve", "reject", "modify"
    feedback = Column(Text, nullable=True)
    
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    execution = relationship("WorkflowExecution", foreign_keys=[run_id])
    agent = relationship("Agent", foreign_keys=[agent_id])
    responded_by = relationship("User", foreign_keys=[responded_by_id])

    def __repr__(self):
        return f"<HITLRequest type={self.request_type} risk={self.risk_level} status={self.status}>"
