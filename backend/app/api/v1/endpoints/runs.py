"""
Runs API Endpoints - Workflow execution tracking
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.run_service import RunService
from app.schemas.run import RunCreate, RunResponse, RunListResponse, RunStepResponse

router = APIRouter(prefix="/runs", tags=["Runs"])


@router.post("/", response_model=RunResponse, status_code=status.HTTP_201_CREATED)
async def create_run(
    run_data: RunCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RunResponse:
    """Trigger new workflow execution"""
    run = await RunService.create(db, run_data, current_user.id)
    return RunResponse.model_validate(run)


@router.get("/", response_model=RunListResponse)
async def list_runs(
    status: Optional[str] = Query(None),
    agent_id: Optional[str] = Query(None, alias="agentId"),
    workflow_id: Optional[str] = Query(None, alias="workflowId"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RunListResponse:
    """List runs with filters"""
    skip = (page - 1) * limit
    runs, total = await RunService.list_runs(db, skip, limit, status, agent_id, workflow_id)
    total_pages = (total + limit - 1) // limit
    
    return RunListResponse(
        runs=[RunResponse.model_validate(r) for r in runs],
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )


@router.get("/{run_id}", response_model=RunResponse)
async def get_run(
    run_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RunResponse:
    """Get run details"""
    run = await RunService.get_by_id(db, UUID(run_id))
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return RunResponse.model_validate(run)


@router.patch("/{run_id}/cancel", response_model=RunResponse)
async def cancel_run(
    run_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RunResponse:
    """Cancel running execution"""
    run = await RunService.cancel(db, UUID(run_id))
    if not run:
        raise HTTPException(status_code=404, detail="Run not found or not running")
    return RunResponse.model_validate(run)


@router.get("/{run_id}/steps", response_model=list[RunStepResponse])
async def get_run_steps(
    run_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[RunStepResponse]:
    """Get all steps for a run"""
    steps = await RunService.get_steps(db, UUID(run_id))
    return [RunStepResponse.model_validate(s) for s in steps]
