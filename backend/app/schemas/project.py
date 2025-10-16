"""
Project Schemas - Pydantic models for validation
"""
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, ConfigDict

from app.models.project import ProjectStatus


class ProjectBase(BaseModel):
    """Base project schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.ACTIVE
    settings: dict = Field(default_factory=dict)
    metadata_: dict = Field(default_factory=dict, alias="metadata")
    is_public: bool = False
    is_template: bool = False


class ProjectCreate(ProjectBase):
    """Schema for creating a project"""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating a project"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    settings: Optional[dict] = None
    metadata_: Optional[dict] = Field(None, alias="metadata")
    is_public: Optional[bool] = None
    is_template: Optional[bool] = None


class ProjectResponse(ProjectBase):
    """Schema for project response"""
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


class ProjectListResponse(BaseModel):
    """Schema for project list response"""
    items: list[ProjectResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
