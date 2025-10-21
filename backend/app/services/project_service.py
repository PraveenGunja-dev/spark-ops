"""
Project Service - Business logic for project operations
"""
from typing import Optional, List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


class ProjectService:
    """Service for project operations"""

    @staticmethod
    async def create(db: AsyncSession, project_data: ProjectCreate, owner_id: UUID) -> Project:
        """Create a new project"""
        project = Project(
            **project_data.model_dump(exclude_unset=True),
            owner_id=owner_id
        )
        db.add(project)
        await db.commit()
        await db.refresh(project)
        return project

    @staticmethod
    async def get_by_id(db: AsyncSession, project_id: UUID) -> Optional[Project]:
        """Get project by ID"""
        result = await db.execute(
            select(Project)
            .options(selectinload(Project.owner))
            .where(Project.id == project_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_user(
        db: AsyncSession, 
        user_id: UUID, 
        skip: int = 0, 
        limit: int = 20
    ) -> tuple[List[Project], int]:
        """Get projects owned by user with pagination"""
        # Get total count
        count_query = select(func.count()).select_from(Project).where(Project.owner_id == user_id)
        total_result = await db.execute(count_query)
        total = total_result.scalar()

        # Get paginated results
        query = (
            select(Project)
            .options(selectinload(Project.owner))
            .where(Project.owner_id == user_id)
            .order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        projects = result.scalars().all()
        
        return list(projects), total

    @staticmethod
    async def update(
        db: AsyncSession, 
        project_id: UUID, 
        project_data: ProjectUpdate
    ) -> Optional[Project]:
        """Update a project"""
        project = await ProjectService.get_by_id(db, project_id)
        if not project:
            return None

        update_data = project_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)

        await db.commit()
        await db.refresh(project)
        return project

    @staticmethod
    async def delete(db: AsyncSession, project_id: UUID) -> bool:
        """Delete a project"""
        project = await ProjectService.get_by_id(db, project_id)
        if not project:
            return False

        await db.delete(project)
        await db.commit()
        return True

    @staticmethod
    async def search(
        db: AsyncSession,
        user_id: UUID,
        query: str,
        skip: int = 0,
        limit: int = 20
    ) -> tuple[List[Project], int]:
        """Search projects by name or description"""
        # Get total count
        count_stmt = (
            select(func.count())
            .select_from(Project)
            .where(
                Project.owner_id == user_id,
                (Project.name.ilike(f"%{query}%")) | (Project.description.ilike(f"%{query}%"))
            )
        )
        total_result = await db.execute(count_stmt)
        total = total_result.scalar()

        # Get paginated results
        stmt = (
            select(Project)
            .options(selectinload(Project.owner))
            .where(
                Project.owner_id == user_id,
                (Project.name.ilike(f"%{query}%")) | (Project.description.ilike(f"%{query}%"))
            )
            .order_by(Project.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        projects = result.scalars().all()
        
        return list(projects), total
