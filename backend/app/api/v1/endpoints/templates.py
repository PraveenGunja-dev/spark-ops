"""
Template API Endpoints

CRUD operations for workflow templates
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from uuid import UUID
import math

from app.db.session import get_db
from app.models.template import Template
from app.models.user import User
from app.schemas.template import (
    TemplateCreate,
    TemplateUpdate,
    TemplateResponse,
    TemplateListResponse,
)
from app.api.deps import get_current_user


router = APIRouter()


@router.get("/templates", response_model=TemplateListResponse)
async def list_templates(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    category: str | None = Query(None, description="Filter by category"),
    search: str | None = Query(None, description="Search templates by name or description"),
    db: Session = Depends(get_db),
):
    """
    List all templates with pagination and optional filtering
    """
    # Build query
    query = db.query(Template)
    
    # Apply filters
    if category:
        query = query.filter(Template.category == category)
    
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Template.name.ilike(search_pattern)) |
            (Template.description.ilike(search_pattern))
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * page_size
    templates = query.order_by(Template.downloads.desc()).offset(offset).limit(page_size).all()
    
    # Calculate total pages
    total_pages = math.ceil(total / page_size) if total > 0 else 0
    
    return TemplateListResponse(
        items=templates,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/templates/{template_id}", response_model=TemplateResponse)
async def get_template(
    template_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Get a specific template by ID
    """
    template = db.query(Template).filter(Template.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return template


@router.post("/templates", response_model=TemplateResponse, status_code=201)
async def create_template(
    template_data: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new template (admin/developer only)
    """
    # Only admins and developers can create templates
    if current_user.role not in ["admin", "owner", "developer"]:
        raise HTTPException(
            status_code=403,
            detail="Only admins and developers can create templates"
        )
    
    template = Template(**template_data.model_dump())
    db.add(template)
    db.commit()
    db.refresh(template)
    
    return template


@router.put("/templates/{template_id}", response_model=TemplateResponse)
async def update_template(
    template_id: UUID,
    template_data: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Update an existing template (admin/developer only)
    """
    # Only admins and developers can update templates
    if current_user.role not in ["admin", "owner", "developer"]:
        raise HTTPException(
            status_code=403,
            detail="Only admins and developers can update templates"
        )
    
    template = db.query(Template).filter(Template.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Update fields
    update_data = template_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(template, field, value)
    
    db.commit()
    db.refresh(template)
    
    return template


@router.delete("/templates/{template_id}", status_code=204)
async def delete_template(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a template (admin only)
    """
    # Only admins can delete templates
    if current_user.role not in ["admin", "owner"]:
        raise HTTPException(
            status_code=403,
            detail="Only admins can delete templates"
        )
    
    template = db.query(Template).filter(Template.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    db.delete(template)
    db.commit()
    
    return None


@router.post("/templates/{template_id}/increment-downloads", response_model=TemplateResponse)
async def increment_downloads(
    template_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Increment download count for a template
    """
    template = db.query(Template).filter(Template.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template.downloads += 1
    db.commit()
    db.refresh(template)
    
    return template


@router.get("/templates/categories/list", response_model=List[str])
async def list_categories(
    db: Session = Depends(get_db),
):
    """
    Get list of all unique template categories
    """
    categories = db.query(Template.category).distinct().order_by(Template.category).all()
    return [cat[0] for cat in categories]
