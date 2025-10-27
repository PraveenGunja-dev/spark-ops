"""
Template Database Model

Templates represent pre-built workflow templates that users can browse and use
to accelerate their automation development.
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
from app.db.base import Base


class Template(Base):
    """
    Template Model - Workflow templates for quick-start automation
    """
    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False, index=True)
    downloads = Column(Integer, default=0, nullable=False)
    rating = Column(Float, default=0.0, nullable=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Template(id={self.id}, name='{self.name}', category='{self.category}')>"
