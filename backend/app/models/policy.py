"""
Policy Model - Governance and compliance policies
"""
import uuid
import enum
from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class PolicyType(str, enum.Enum):
    """Policy type enumeration"""
    SAFETY = "safety"
    BUDGET = "budget"
    APPROVAL = "approval"
    COMPLIANCE = "compliance"


class PolicyStatus(str, enum.Enum):
    """Policy status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    DRAFT = "draft"


class Policy(Base, TimestampMixin):
    """
    Policy model - represents a governance or compliance policy
    """
    __tablename__ = "policies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    type = Column(SQLEnum(PolicyType), nullable=False)
    status = Column(SQLEnum(PolicyStatus), default=PolicyStatus.ACTIVE, nullable=False)
    
    # Policy configuration
    config = Column(JSONB, default=dict, nullable=False)
    rules = Column(JSONB, default=list, nullable=False)
    
    # Metadata
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="policies")