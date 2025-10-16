"""
Workflow Service Layer
Business logic for workflow CRUD operations
"""
from typing import List, Tuple, Optional
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.workflow import Workflow, WorkflowStatus
from app.schemas.workflow import WorkflowCreate, WorkflowUpdate


class WorkflowService:
    """Service class for Workflow business logic"""
    
    @staticmethod
    async def create(
        db: AsyncSession,
        workflow_data: WorkflowCreate,
        user_id: UUID
    ) -> Workflow:
        """
        Create a new workflow
        
        Args:
            db: Database session
            workflow_data: Workflow creation data
            user_id: ID of the user creating the workflow
            
        Returns:
            Created workflow instance
        """
        # Store tags in metadata
        metadata = workflow_data.metadata.copy() if workflow_data.metadata else {}
        metadata['tags'] = workflow_data.tags
        metadata['author_user_id'] = str(user_id)
        
        # Create version history
        metadata['version_history'] = [{
            'version': 1,
            'status': 'draft',
            'updated_at': None,  # Will be set to created_at
            'author_user_id': str(user_id),
            'note': 'Initial version'
        }]
        
        workflow = Workflow(
            name=workflow_data.name,
            project_id=UUID(workflow_data.project_id),
            description=workflow_data.description,
            status=WorkflowStatus.DRAFT,
            definition=workflow_data.definition,
            trigger_type=workflow_data.trigger_type,
            schedule_cron=workflow_data.schedule_cron,
            timeout_seconds=workflow_data.timeout_seconds,
            max_retries=workflow_data.max_retries,
            enable_approval=workflow_data.enable_approval,
            enable_notifications=workflow_data.enable_notifications,
            version="1.0.0",
            config=workflow_data.config,
            metadata_=metadata,
        )
        
        db.add(workflow)
        await db.commit()
        await db.refresh(workflow)
        
        # Update version history with actual created_at
        workflow.metadata_['version_history'][0]['updated_at'] = workflow.created_at.isoformat()
        await db.commit()
        await db.refresh(workflow)
        
        return workflow
    
    @staticmethod
    async def get_by_id(db: AsyncSession, workflow_id: UUID) -> Optional[Workflow]:
        """Get workflow by ID"""
        result = await db.execute(
            select(Workflow).where(Workflow.id == workflow_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_by_project(
        db: AsyncSession,
        project_id: UUID,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> Tuple[List[Workflow], int]:
        """
        Get workflows by project with optional filters
        
        Args:
            db: Database session
            project_id: Project ID to filter by
            skip: Number of records to skip
            limit: Maximum records to return
            status: Filter by workflow status
            tags: Filter by tags (any match)
            
        Returns:
            Tuple of (workflows list, total count)
        """
        query = select(Workflow).where(Workflow.project_id == project_id)
        
        # Apply filters
        if status:
            try:
                status_enum = WorkflowStatus(status)
                query = query.where(Workflow.status == status_enum)
            except ValueError:
                pass  # Invalid status, ignore filter
        
        if tags:
            # Filter by tags in metadata
            # PostgreSQL JSONB contains operator
            from sqlalchemy import cast, String
            for tag in tags:
                query = query.where(
                    func.jsonb_path_exists(
                        Workflow.metadata_,
                        f'$.tags[*] ? (@ == "{tag}")'
                    )
                )
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar_one()
        
        # Get paginated results
        query = query.offset(skip).limit(limit).order_by(Workflow.created_at.desc())
        result = await db.execute(query)
        workflows = list(result.scalars().all())
        
        return workflows, total
    
    @staticmethod
    async def update(
        db: AsyncSession,
        workflow_id: UUID,
        workflow_data: WorkflowUpdate,
        user_id: UUID
    ) -> Optional[Workflow]:
        """
        Update an existing workflow
        
        Args:
            db: Database session
            workflow_id: ID of workflow to update
            workflow_data: Update data
            user_id: ID of user making the update
            
        Returns:
            Updated workflow or None if not found
        """
        workflow = await WorkflowService.get_by_id(db, workflow_id)
        if not workflow:
            return None
        
        # Update only provided fields
        update_data = workflow_data.model_dump(exclude_unset=True)
        
        # Handle tags separately (stored in metadata)
        if 'tags' in update_data:
            if not workflow.metadata_:
                workflow.metadata_ = {}
            workflow.metadata_['tags'] = update_data.pop('tags')
        
        # Handle metadata merge
        if 'metadata' in update_data:
            if not workflow.metadata_:
                workflow.metadata_ = {}
            workflow.metadata_.update(update_data.pop('metadata'))
        
        for field, value in update_data.items():
            if field == 'metadata':
                continue  # Already handled
            setattr(workflow, field, value)
        
        await db.commit()
        await db.refresh(workflow)
        return workflow
    
    @staticmethod
    async def delete(db: AsyncSession, workflow_id: UUID) -> bool:
        """
        Delete a workflow
        
        Args:
            db: Database session
            workflow_id: ID of workflow to delete
            
        Returns:
            True if deleted, False if not found
        """
        workflow = await WorkflowService.get_by_id(db, workflow_id)
        if not workflow:
            return False
        
        await db.delete(workflow)
        await db.commit()
        return True
    
    @staticmethod
    async def create_version(
        db: AsyncSession,
        workflow_id: UUID,
        user_id: UUID,
        note: Optional[str] = None
    ) -> Optional[Workflow]:
        """
        Create a new version of the workflow
        
        Args:
            db: Database session
            workflow_id: Workflow ID
            user_id: User creating the version
            note: Version note
            
        Returns:
            Updated workflow with new version
        """
        workflow = await WorkflowService.get_by_id(db, workflow_id)
        if not workflow:
            return None
        
        # Get version history
        version_history = workflow.metadata_.get('version_history', [])
        next_version = len(version_history) + 1
        
        # Add new version
        from datetime import datetime, timezone
        version_history.append({
            'version': next_version,
            'status': 'draft',
            'updated_at': datetime.now(timezone.utc).isoformat(),
            'author_user_id': str(user_id),
            'note': note
        })
        
        workflow.metadata_['version_history'] = version_history
        workflow.version = f"{next_version}.0.0"
        
        await db.commit()
        await db.refresh(workflow)
        return workflow
    
    @staticmethod
    async def release_version(
        db: AsyncSession,
        workflow_id: UUID,
        version_number: int
    ) -> Optional[Workflow]:
        """
        Mark a workflow version as released
        
        Args:
            db: Database session
            workflow_id: Workflow ID
            version_number: Version number to release
            
        Returns:
            Updated workflow
        """
        workflow = await WorkflowService.get_by_id(db, workflow_id)
        if not workflow:
            return None
        
        version_history = workflow.metadata_.get('version_history', [])
        for version in version_history:
            if version['version'] == version_number:
                version['status'] = 'released'
                from datetime import datetime, timezone
                version['updated_at'] = datetime.now(timezone.utc).isoformat()
                break
        
        workflow.metadata_['version_history'] = version_history
        workflow.status = WorkflowStatus.ACTIVE
        
        await db.commit()
        await db.refresh(workflow)
        return workflow
