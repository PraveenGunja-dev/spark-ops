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
            agent_id=UUID(run_data.agent_id),
            project_id=UUID("00000000-0000-0000-0000-000000000000"),  # Will be set from workflow
            status=ExecutionStatus.PENDING,
            env=run_data.env,
            started_at=datetime.now(timezone.utc),
            input_data=run_data.input_data,
            config=run_data.config,
            metadata_={"triggered_by": str(user_id), "trigger": run_data.trigger}
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
            query = query.where(WorkflowExecution.agent_id == UUID(agent_id))
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
        run.ended_at = datetime.now(timezone.utc)
        if run.started_at:
            run.duration_ms = int((run.ended_at - run.started_at).total_seconds() * 1000)
        
        await db.commit()
        await db.refresh(run)
        return run
    
    @staticmethod
    async def get_steps(db: AsyncSession, run_id: UUID) -> List[WorkflowStep]:
        """Get all steps for a run"""
        result = await db.execute(
            select(WorkflowStep)
            .where(WorkflowStep.execution_id == run_id)
            .order_by(WorkflowStep.step_index)
        )
        return list(result.scalars().all())
