"""
Template Pydantic Schemas

Schemas for request/response validation and serialization
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from uuid import UUID
from typing import Optional


class TemplateBase(BaseModel):
    """Base template schema with common fields"""
    name: str = Field(..., min_length=1, max_length=255, description="Template name")
    description: str = Field(..., min_length=1, description="Template description")
    category: str = Field(..., min_length=1, max_length=100, description="Template category")
    downloads: int = Field(default=0, ge=0, description="Number of downloads")
    rating: float = Field(default=0.0, ge=0.0, le=5.0, description="Template rating (0-5)")


class TemplateCreate(TemplateBase):
    """Schema for creating a new template"""
    pass


class TemplateUpdate(BaseModel):
    """Schema for updating an existing template"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    downloads: Optional[int] = Field(None, ge=0)
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)


class TemplateResponse(TemplateBase):
    """Schema for template responses"""
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TemplateListResponse(BaseModel):
    """Schema for paginated template list"""
    items: list[TemplateResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
