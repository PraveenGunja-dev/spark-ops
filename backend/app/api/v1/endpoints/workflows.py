"""
Workflow API Endpoints
RESTful API for workflow management
"""
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.workflow_execution import WorkflowExecution, ExecutionStatus
from app.services.workflow_service import WorkflowService
from app.services.project_service import ProjectService
from app.schemas.workflow import (
    WorkflowCreate,
    WorkflowUpdate,
    WorkflowResponse,
    WorkflowListResponse,
    WorkflowAnalyticsResponse,
    WorkflowVersion
)

router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.post("/", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow_data: WorkflowCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkflowResponse:
    """
    Create a new workflow
    
    Requires the user to own the project specified in project_id
    """
    # Verify project ownership
    project = await ProjectService.get_by_id(db, UUID(workflow_data.project_id))
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to create workflows in this project"
        )
    
    workflow = await WorkflowService.create(db, workflow_data, current_user.id)
    
    # Build response with version info
    response_data = WorkflowResponse.model_validate(workflow)
    response_data.versions = _build_version_list(workflow)
    
    return response_data


@router.get("/", response_model=WorkflowListResponse)
async def list_workflows(
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    tags: Optional[str] = Query(None, description="Filter by tags (comma-separated)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkflowListResponse:
    """
    List all workflows for a project
    
    Supports filtering by status and tags
    Returns paginated results with version history
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
            detail="You don't have permission to view workflows in this project"
        )
    
    # Parse tags
    tag_list = tags.split(',') if tags else None
    
    skip = (page - 1) * page_size
    workflows, total = await WorkflowService.get_by_project(
        db,
        UUID(project_id),
        skip=skip,
        limit=page_size,
        status=status,
        tags=tag_list
    )
    
    total_pages = (total + page_size - 1) // page_size
    
    # Build responses with versions and analytics
    workflow_responses = []
    for wf in workflows:
        response = WorkflowResponse.model_validate(wf)
        response.versions = _build_version_list(wf)
        
        # Calculate analytics from executions
        analytics = await _calculate_workflow_analytics(db, wf.id)
        response.avg_duration_ms = analytics['avg_duration_ms']
        response.success_rate = analytics['success_rate']
        response.last_run_at = analytics['last_run_at']
        
        workflow_responses.append(response)
    
    return WorkflowListResponse(
        items=workflow_responses,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkflowResponse:
    """
    Get a specific workflow by ID
    """
    try:
        workflow_uuid = UUID(workflow_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid workflow ID format"
        )
    
    workflow = await WorkflowService.get_by_id(db, workflow_uuid)
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, workflow.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this workflow"
        )
    
    response = WorkflowResponse.model_validate(workflow)
    response.versions = _build_version_list(workflow)
    
    # Add analytics
    analytics = await _calculate_workflow_analytics(db, workflow.id)
    response.avg_duration_ms = analytics['avg_duration_ms']
    response.success_rate = analytics['success_rate']
    response.last_run_at = analytics['last_run_at']
    
    return response


@router.put("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: str,
    workflow_data: WorkflowUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkflowResponse:
    """
    Update an existing workflow
    """
    try:
        workflow_uuid = UUID(workflow_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid workflow ID format"
        )
    
    # Get existing workflow
    existing_workflow = await WorkflowService.get_by_id(db, workflow_uuid)
    if not existing_workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, existing_workflow.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this workflow"
        )
    
    workflow = await WorkflowService.update(db, workflow_uuid, workflow_data, current_user.id)
    
    response = WorkflowResponse.model_validate(workflow)
    response.versions = _build_version_list(workflow)
    
    return response


@router.delete("/{workflow_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete a workflow
    """
    try:
        workflow_uuid = UUID(workflow_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid workflow ID format"
        )
    
    # Get existing workflow
    existing_workflow = await WorkflowService.get_by_id(db, workflow_uuid)
    if not existing_workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, existing_workflow.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this workflow"
        )
    
    await WorkflowService.delete(db, workflow_uuid)


@router.post("/{workflow_id}/versions", response_model=WorkflowResponse)
async def create_workflow_version(
    workflow_id: str,
    note: Optional[str] = Body(None, embed=True),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkflowResponse:
    """
    Create a new version of the workflow
    """
    try:
        workflow_uuid = UUID(workflow_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid workflow ID format"
        )
    
    workflow = await WorkflowService.create_version(db, workflow_uuid, current_user.id, note)
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    response = WorkflowResponse.model_validate(workflow)
    response.versions = _build_version_list(workflow)
    
    return response


@router.get("/{workflow_id}/analytics", response_model=WorkflowAnalyticsResponse)
async def get_workflow_analytics(
    workflow_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> WorkflowAnalyticsResponse:
    """
    Get workflow analytics and statistics
    """
    try:
        workflow_uuid = UUID(workflow_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid workflow ID format"
        )
    
    workflow = await WorkflowService.get_by_id(db, workflow_uuid)
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, workflow.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this workflow's analytics"
        )
    
    analytics = await _calculate_workflow_analytics(db, workflow.id)
    
    return WorkflowAnalyticsResponse(
        avg_duration_ms=analytics['avg_duration_ms'],
        success_rate=analytics['success_rate'],
        total_runs=analytics['total_runs'],
        last_run_at=analytics['last_run_at'],
        failed_runs=analytics['failed_runs'],
        succeeded_runs=analytics['succeeded_runs']
    )


# Helper functions
def _build_version_list(workflow) -> List[WorkflowVersion]:
    """Build version list from workflow metadata"""
    version_history = workflow.metadata_.get('version_history', [])
    versions = []
    for v in version_history:
        from datetime import datetime
        versions.append(WorkflowVersion(
            version=v['version'],
            status=v['status'],
            updated_at=datetime.fromisoformat(v['updated_at']) if v.get('updated_at') else workflow.created_at,
            author_user_id=v['author_user_id'],
            note=v.get('note')
        ))
    return versions


async def _calculate_workflow_analytics(db: AsyncSession, workflow_id: UUID) -> dict:
    """Calculate workflow analytics from executions"""
    # Get all executions for this workflow
    executions_query = select(WorkflowExecution).where(
        WorkflowExecution.workflow_id == workflow_id
    )
    result = await db.execute(executions_query)
    executions = list(result.scalars().all())
    
    if not executions:
        return {
            'avg_duration_ms': None,
            'success_rate': None,
            'total_runs': 0,
            'last_run_at': None,
            'failed_runs': 0,
            'succeeded_runs': 0
        }
    
    total_runs = len(executions)
    succeeded = [e for e in executions if e.status == ExecutionStatus.COMPLETED]
    failed = [e for e in executions if e.status == ExecutionStatus.FAILED]
    
    # Calculate average duration (only completed runs)
    durations = [e.duration_ms for e in succeeded if e.duration_ms]
    avg_duration = int(sum(durations) / len(durations)) if durations else None
    
    # Calculate success rate
    success_rate = len(succeeded) / total_runs if total_runs > 0 else None
    
    # Get last run
    sorted_executions = sorted(executions, key=lambda e: e.started_at, reverse=True)
    last_run_at = sorted_executions[0].started_at if sorted_executions else None
    
    return {
        'avg_duration_ms': avg_duration,
        'success_rate': success_rate,
        'total_runs': total_runs,
        'last_run_at': last_run_at,
        'failed_runs': len(failed),
        'succeeded_runs': len(succeeded)
    }
