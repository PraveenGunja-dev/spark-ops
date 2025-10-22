"""
Agent Reasoning Models - APA reasoning traces and memory
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, Boolean, ForeignKey, DateTime, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class AgentReasoningTrace(Base):
    """
    Agent Reasoning Trace - Stores individual reasoning steps (ReAct pattern)
    """
    __tablename__ = "agent_reasoning_traces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("workflow_executions.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True)
    step_index = Column(Integer, nullable=False)
    
    # ReAct pattern components
    thought = Column(Text, nullable=False)  # Agent's reasoning
    action = Column(JSONB, default=dict, nullable=False)  # Action taken
    observation = Column(JSONB, default=dict, nullable=False)  # Result observed
    reflection = Column(Text, nullable=True)  # Post-action reflection
    
    # Metrics
    tokens_used = Column(Integer, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    execution = relationship("WorkflowExecution", foreign_keys=[run_id])
    agent = relationship("Agent", foreign_keys=[agent_id])

    def __repr__(self):
        return f"<AgentReasoningTrace step={self.step_index} agent={self.agent_id}>"


class AgentMemory(Base):
    """
    Agent Memory - Long-term memory storage with vector embeddings
    """
    __tablename__ = "agent_memory"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True)
    memory_type = Column(String(50), nullable=False, index=True)  # "episodic", "semantic", "procedural"
    content = Column(Text, nullable=False)
    
    # Vector embedding for semantic search (using PostgreSQL array for now, pgvector integration later)
    embedding = Column(ARRAY(Float), nullable=True)
    
    # Metadata and importance
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    importance_score = Column(Float, nullable=True)  # 0.0-1.0
    
    # Access tracking
    access_count = Column(Integer, default=0, nullable=False)
    last_accessed_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    agent = relationship("Agent", foreign_keys=[agent_id])

    def __repr__(self):
        return f"<AgentMemory type={self.memory_type} agent={self.agent_id}>"


class LearningFeedback(Base):
    """
    Learning Feedback - Stores outcomes and improvements for agent learning
    """
    __tablename__ = "learning_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id", ondelete="CASCADE"), nullable=False, index=True)
    run_id = Column(UUID(as_uuid=True), ForeignKey("workflow_executions.id", ondelete="SET NULL"), nullable=True)
    trace_id = Column(UUID(as_uuid=True), ForeignKey("agent_reasoning_traces.id", ondelete="SET NULL"), nullable=True)
    
    feedback_type = Column(String(50), nullable=False)  # "success", "failure", "human_correction"
    task_description = Column(Text, nullable=False)
    action_taken = Column(JSONB, default=dict, nullable=False)
    outcome = Column(String(50), nullable=False, index=True)  # "success", "failure", "partial"
    success = Column(Boolean, nullable=False)
    
    # Error details if failed
    error_message = Column(Text, nullable=True)
    improvement_suggestions = Column(Text, nullable=True)
    
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Relationships
    agent = relationship("Agent", foreign_keys=[agent_id])
    execution = relationship("WorkflowExecution", foreign_keys=[run_id])
    trace = relationship("AgentReasoningTrace", foreign_keys=[trace_id])

    def __repr__(self):
        return f"<LearningFeedback outcome={self.outcome} agent={self.agent_id}>"
