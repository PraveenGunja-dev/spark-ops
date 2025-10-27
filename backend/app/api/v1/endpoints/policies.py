"""
Policy API Endpoints
RESTful API for policy management
"""
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.policy import Policy, PolicyType, PolicyStatus
from app.services.project_service import ProjectService
from app.schemas.policy import (
    PolicyCreate,
    PolicyUpdate,
    PolicyResponse,
    PolicyListResponse
)

router = APIRouter(prefix="/policies", tags=["Policies"])


@router.post("/", response_model=PolicyResponse, status_code=status.HTTP_201_CREATED)
async def create_policy(
    policy_data: PolicyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PolicyResponse:
    """
    Create a new policy
    
    Requires the user to own the project specified in project_id
    """
    # Verify project ownership
    project = await ProjectService.get_by_id(db, UUID(policy_data.project_id))
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to create policies in this project"
        )
    
    # Create policy
    policy = Policy(
        name=policy_data.name,
        project_id=UUID(policy_data.project_id),
        description=policy_data.description,
        type=policy_data.type,
        status=policy_data.status,
        config=policy_data.config,
        rules=policy_data.rules,
        metadata_=policy_data.metadata
    )
    
    db.add(policy)
    await db.commit()
    await db.refresh(policy)
    
    return PolicyResponse.model_validate(policy)


@router.get("/", response_model=PolicyListResponse)
async def list_policies(
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    policy_type: Optional[PolicyType] = Query(None, description="Filter by policy type"),
    status: Optional[PolicyStatus] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PolicyListResponse:
    """
    List all policies for a project
    
    Supports filtering by policy type and status
    Returns paginated results
    """
    if not project_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="project_id query parameter is required"
        )
    
    # Verify project access
    project = await ProjectService.get_by_id(db, UUID(project_id))
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view policies in this project"
        )
    
    skip = (page - 1) * page_size
    
    # Build query
    query = select(Policy).where(Policy.project_id == UUID(project_id))
    
    if policy_type:
        query = query.where(Policy.type == policy_type)
    
    if status:
        query = query.where(Policy.status == status)
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    # Apply pagination
    query = query.offset(skip).limit(page_size)
    result = await db.execute(query)
    policies = result.scalars().all()
    
    total_pages = (total + page_size - 1) // page_size
    
    policy_responses = [PolicyResponse.model_validate(p) for p in policies]
    
    return PolicyListResponse(
        items=policy_responses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{policy_id}", response_model=PolicyResponse)
async def get_policy(
    policy_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PolicyResponse:
    """
    Get a specific policy by ID
    """
    try:
        policy_uuid = UUID(policy_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid policy ID format"
        )
    
    result = await db.execute(select(Policy).where(Policy.id == policy_uuid))
    policy = result.scalar_one_or_none()
    
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Policy not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, policy.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this policy"
        )
    
    return PolicyResponse.model_validate(policy)


@router.put("/{policy_id}", response_model=PolicyResponse)
async def update_policy(
    policy_id: str,
    policy_data: PolicyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PolicyResponse:
    """
    Update an existing policy
    """
    try:
        policy_uuid = UUID(policy_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid policy ID format"
        )
    
    # Get existing policy
    result = await db.execute(select(Policy).where(Policy.id == policy_uuid))
    policy = result.scalar_one_or_none()
    
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Policy not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, policy.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this policy"
        )
    
    # Update fields
    update_data = policy_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "metadata":
            setattr(policy, "metadata_", value)
        else:
            setattr(policy, field, value)
    
    await db.commit()
    await db.refresh(policy)
    
    return PolicyResponse.model_validate(policy)


@router.delete("/{policy_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_policy(
    policy_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete a policy
    """
    try:
        policy_uuid = UUID(policy_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid policy ID format"
        )
    
    # Get existing policy
    result = await db.execute(select(Policy).where(Policy.id == policy_uuid))
    policy = result.scalar_one_or_none()
    
    if not policy:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Policy not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, policy.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this policy"
        )
    
    await db.delete(policy)
    await db.commit()