"""
Run Service Layer - Workflow execution management
"""
from typing import List, Tuple, Optional
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.workflow_execution import WorkflowExecution, WorkflowStep, ExecutionStatus
from app.schemas.run import RunCreate, RunUpdate, RunStepCreate, RunStepUpdate


class RunService:
    """Service for Run (WorkflowExecution) operations"""
    
    @staticmethod
    async def create(db: AsyncSession, run_data: RunCreate, user_id: UUID) -> WorkflowExecution:
        """Create new run"""
        run = WorkflowExecution(
            workflow_id=UUID(run_data.workflow_id),
            status=ExecutionStatus.PENDING,
            started_at=datetime.now(timezone.utc),
            input_data=run_data.input_data,
            metadata_={
                "triggered_by": str(user_id),
                "trigger": run_data.trigger,
                "agent_id": run_data.agent_id,
                "project_id": "00000000-0000-0000-0000-000000000000",  # Will be set from workflow
                "env": run_data.env,
                "config": run_data.config or {}
            }
        )
        
        db.add(run)
        await db.commit()
        await db.refresh(run)
        return run
    
    @staticmethod
    async def get_by_id(db: AsyncSession, run_id: UUID) -> Optional[WorkflowExecution]:
        """Get run by ID"""
        result = await db.execute(select(WorkflowExecution).where(WorkflowExecution.id == run_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def list_runs(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 20,
        status: Optional[str] = None,
        agent_id: Optional[str] = None,
        workflow_id: Optional[str] = None
    ) -> Tuple[List[WorkflowExecution], int]:
        """List runs with filters"""
        query = select(WorkflowExecution)
        
        if status:
            query = query.where(WorkflowExecution.status == ExecutionStatus(status))
        if agent_id:
            # Filter by agent_id in metadata
            query = query.where(WorkflowExecution.metadata_['agent_id'].astext == agent_id)
        if workflow_id:
            query = query.where(WorkflowExecution.workflow_id == UUID(workflow_id))
        
        count_query = select(func.count()).select_from(query.subquery())
        total = (await db.execute(count_query)).scalar_one()
        
        query = query.offset(skip).limit(limit).order_by(WorkflowExecution.started_at.desc())
        runs = list((await db.execute(query)).scalars().all())
        
        return runs, total
    
    @staticmethod
    async def update(db: AsyncSession, run_id: UUID, run_data: RunUpdate) -> Optional[WorkflowExecution]:
        """Update run"""
        run = await RunService.get_by_id(db, run_id)
        if not run:
            return None
        
        for field, value in run_data.model_dump(exclude_unset=True).items():
            setattr(run, field, value)
        
        await db.commit()
        await db.refresh(run)
        return run
    
    @staticmethod
    async def cancel(db: AsyncSession, run_id: UUID) -> Optional[WorkflowExecution]:
        """Cancel running run"""
        run = await RunService.get_by_id(db, run_id)
        if not run or run.status != ExecutionStatus.RUNNING:
            return None
        
        run.status = ExecutionStatus.CANCELLED
        run.completed_at = datetime.now(timezone.utc)
        if run.started_at:
            run.duration_seconds = int((run.completed_at - run.started_at).total_seconds())
        
        await db.commit()
        await db.refresh(run)
        return run
    
    @staticmethod
    async def get_steps(db: AsyncSession, run_id: UUID) -> List[WorkflowStep]:
        """Get all steps for a run"""
        result = await db.execute(
            select(WorkflowStep)
            .where(WorkflowStep.execution_id == run_id)
            .order_by(WorkflowStep.created_at)  # Use created_at instead of step_index
        )
        return list(result.scalars().all())
    
    @staticmethod
    async def retry(db: AsyncSession, run_id: UUID, user_id: UUID) -> Optional[WorkflowExecution]:
        """Retry a failed/cancelled run by creating a new run with same parameters"""
        original_run = await RunService.get_by_id(db, run_id)
        if not original_run or original_run.status not in [ExecutionStatus.FAILED, ExecutionStatus.CANCELLED]:
            return None
        
        # Create new run with same parameters
        new_run = WorkflowExecution(
            workflow_id=original_run.workflow_id,
            status=ExecutionStatus.PENDING,
            started_at=datetime.now(timezone.utc),
            input_data=original_run.input_data,
            metadata_={
                "triggered_by": str(user_id),
                "trigger": "retry",
                "retried_from": str(run_id),
                "agent_id": original_run.metadata_.get('agent_id'),
                "project_id": original_run.metadata_.get('project_id'),
                "env": original_run.metadata_.get('env', 'dev'),
                "config": original_run.metadata_.get('config', {})
            }
        )
        
        db.add(new_run)
        await db.commit()
        await db.refresh(new_run)
        return new_run
