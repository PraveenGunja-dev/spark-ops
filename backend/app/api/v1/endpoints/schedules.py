"""
Schedule API Endpoints
RESTful API for schedule management
"""
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.schedule import Schedule, ScheduleStatus
from app.services.project_service import ProjectService
from app.schemas.schedule import (
    ScheduleCreate,
    ScheduleUpdate,
    ScheduleResponse,
    ScheduleListResponse
)

router = APIRouter(prefix="/schedules", tags=["Schedules"])


@router.post("/", response_model=ScheduleResponse, status_code=status.HTTP_201_CREATED)
async def create_schedule(
    request: Request,
    schedule_data: ScheduleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ScheduleResponse:
    """
    Create a new schedule
    
    Requires the user to own the project specified in project_id
    """
    # Verify project ownership
    project = await ProjectService.get_by_id(db, UUID(schedule_data.project_id))
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to create schedules in this project"
        )
    
    # Create schedule
    schedule = Schedule(
        name=schedule_data.name,
        project_id=UUID(schedule_data.project_id),
        workflow_id=UUID(schedule_data.workflow_id),
        description=schedule_data.description,
        cron_expression=schedule_data.cron_expression,
        timezone=schedule_data.timezone,
        config=schedule_data.config,
        metadata_=schedule_data.metadata
    )
    
    db.add(schedule)
    await db.commit()
    await db.refresh(schedule)
    
    # Add to scheduler if active
    if schedule.status == ScheduleStatus.ACTIVE:
        try:
            from app.main import scheduler_service
            if scheduler_service:
                await scheduler_service.add_schedule(schedule)
        except Exception as e:
            # Log error but don't fail the request
            import logging
            logging.error(f"Error adding schedule to scheduler: {e}")
    
    return ScheduleResponse.model_validate(schedule)


@router.get("/", response_model=ScheduleListResponse)
async def list_schedules(
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    workflow_id: Optional[str] = Query(None, description="Filter by workflow ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ScheduleListResponse:
    """
    List all schedules for a project
    
    Supports filtering by workflow and status
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
            detail="You don't have permission to view schedules in this project"
        )
    
    skip = (page - 1) * page_size
    
    # Build query
    query = select(Schedule).where(Schedule.project_id == UUID(project_id))
    
    if workflow_id:
        query = query.where(Schedule.workflow_id == UUID(workflow_id))
    
    if status:
        query = query.where(Schedule.status == status)
    
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()
    
    # Apply pagination
    query = query.offset(skip).limit(page_size)
    result = await db.execute(query)
    schedules = result.scalars().all()
    
    total_pages = (total + page_size - 1) // page_size
    
    schedule_responses = [ScheduleResponse.model_validate(s) for s in schedules]
    
    return ScheduleListResponse(
        items=schedule_responses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{schedule_id}", response_model=ScheduleResponse)
async def get_schedule(
    schedule_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ScheduleResponse:
    """
    Get a specific schedule by ID
    """
    try:
        schedule_uuid = UUID(schedule_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid schedule ID format"
        )
    
    result = await db.execute(select(Schedule).where(Schedule.id == schedule_uuid))
    schedule = result.scalar_one_or_none()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, schedule.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this schedule"
        )
    
    return ScheduleResponse.model_validate(schedule)


@router.put("/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(
    request: Request,
    schedule_id: str,
    schedule_data: ScheduleUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ScheduleResponse:
    """
    Update an existing schedule
    """
    try:
        schedule_uuid = UUID(schedule_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid schedule ID format"
        )
    
    # Get existing schedule
    result = await db.execute(select(Schedule).where(Schedule.id == schedule_uuid))
    schedule = result.scalar_one_or_none()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, schedule.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this schedule"
        )
    
    # Store old status for comparison
    old_status = schedule.status
    
    # Update fields
    update_data = schedule_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "metadata":
            setattr(schedule, "metadata_", value)
        else:
            setattr(schedule, field, value)
    
    await db.commit()
    await db.refresh(schedule)
    
    # Update scheduler if status changed
    try:
        from app.main import scheduler_service
        if scheduler_service:
            if old_status != schedule.status:
                # Status changed, update scheduler
                if schedule.status == ScheduleStatus.ACTIVE:
                    await scheduler_service.add_schedule(schedule)
                else:
                    await scheduler_service.remove_schedule(str(schedule.id))
            elif schedule.status == ScheduleStatus.ACTIVE:
                # Status unchanged but active, update the job
                await scheduler_service.update_schedule(schedule)
    except Exception as e:
        # Log error but don't fail the request
        import logging
        logging.error(f"Error updating schedule in scheduler: {e}")
    
    return ScheduleResponse.model_validate(schedule)


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_schedule(
    request: Request,
    schedule_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete a schedule
    """
    try:
        schedule_uuid = UUID(schedule_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid schedule ID format"
        )
    
    # Get existing schedule
    result = await db.execute(select(Schedule).where(Schedule.id == schedule_uuid))
    schedule = result.scalar_one_or_none()
    
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, schedule.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this schedule"
        )
    
    # Remove from scheduler
    try:
        from app.main import scheduler_service
        if scheduler_service:
            await scheduler_service.remove_schedule(str(schedule.id))
    except Exception as e:
        # Log error but don't fail the request
        import logging
        logging.error(f"Error removing schedule from scheduler: {e}")
    
    await db.delete(schedule)
    await db.commit()