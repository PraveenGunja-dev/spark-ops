"""
Project Model - Top-level organization unit
"""
import uuid
import enum
from sqlalchemy import Column, String, Text, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base, TimestampMixin


class ProjectStatus(str, enum.Enum):
    """Project status enumeration"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    DRAFT = "draft"


class Project(Base, TimestampMixin):
    """
    Project model - top-level container for agents, workflows, and tools
    """
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    status = Column(SQLEnum(ProjectStatus), default=ProjectStatus.ACTIVE, nullable=False)
    
    # Configuration and settings
    settings = Column(JSONB, default=dict, nullable=False)
    metadata_ = Column("metadata", JSONB, default=dict, nullable=False)
    
    # Feature flags
    is_public = Column(Boolean, default=False, nullable=False)
    is_template = Column(Boolean, default=False, nullable=False)
    
    # Relationships
    owner = relationship("User", backref="projects")
    agents = relationship("Agent", back_populates="project", cascade="all, delete-orphan")
    workflows = relationship("Workflow", back_populates="project", cascade="all, delete-orphan")
    tools = relationship("Tool", back_populates="project", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Project {self.name}>"
