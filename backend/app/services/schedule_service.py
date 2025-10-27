"""
Schedule Service Layer
Business logic for schedule CRUD operations
"""
from typing import List, Tuple, Optional
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.schedule import Schedule, ScheduleStatus
from app.schemas.schedule import ScheduleCreate, ScheduleUpdate


class ScheduleService:
    """Service class for Schedule business logic"""
    
    @staticmethod
    async def create(
        db: AsyncSession,
        schedule_data: ScheduleCreate,
        user_id: UUID
    ) -> Schedule:
        """
        Create a new schedule
        
        Args:
            db: Database session
            schedule_data: Schedule creation data
            user_id: ID of the user creating the schedule
            
        Returns:
            Created Schedule object
        """
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
        
        return schedule
    
    @staticmethod
    async def get_by_id(db: AsyncSession, schedule_id: UUID) -> Optional[Schedule]:
        """
        Get a schedule by ID
        
        Args:
            db: Database session
            schedule_id: Schedule ID
            
        Returns:
            Schedule object or None if not found
        """
        result = await db.execute(select(Schedule).where(Schedule.id == schedule_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_by_project(
        db: AsyncSession,
        project_id: UUID,
        skip: int = 0,
        limit: int = 100,
        workflow_id: Optional[UUID] = None,
        status: Optional[str] = None
    ) -> Tuple[List[Schedule], int]:
        """
        Get schedules by project with pagination
        
        Args:
            db: Database session
            project_id: Project ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            workflow_id: Optional workflow ID filter
            status: Optional status filter
            
        Returns:
            Tuple of (schedules, total_count)
        """
        # Build query
        query = select(Schedule).where(Schedule.project_id == project_id)
        
        if workflow_id:
            query = query.where(Schedule.workflow_id == workflow_id)
        
        if status:
            query = query.where(Schedule.status == status)
        
        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar_one()
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        schedules = list(result.scalars().all())
        
        return schedules, total
    
    @staticmethod
    async def update(
        db: AsyncSession,
        schedule_id: UUID,
        schedule_data: ScheduleUpdate,
        user_id: UUID
    ) -> Optional[Schedule]:
        """
        Update an existing schedule
        
        Args:
            db: Database session
            schedule_id: Schedule ID
            schedule_data: Schedule update data
            user_id: ID of the user updating the schedule
            
        Returns:
            Updated Schedule object or None if not found
        """
        schedule = await ScheduleService.get_by_id(db, schedule_id)
        if not schedule:
            return None
        
        # Update fields
        update_data = schedule_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "metadata":
                setattr(schedule, "metadata_", value)
            else:
                setattr(schedule, field, value)
        
        await db.commit()
        await db.refresh(schedule)
        
        return schedule
    
    @staticmethod
    async def delete(db: AsyncSession, schedule_id: UUID) -> bool:
        """
        Delete a schedule
        
        Args:
            db: Database session
            schedule_id: Schedule ID
            
        Returns:
            True if deleted, False if not found
        """
        schedule = await ScheduleService.get_by_id(db, schedule_id)
        if not schedule:
            return False
        
        await db.delete(schedule)
        await db.commit()
        
        return True