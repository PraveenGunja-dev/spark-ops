"""
Agent API Endpoints
RESTful API for agent management
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.project import Project
from app.services.agent_service import AgentService
from app.services.project_service import ProjectService
from app.schemas.agent import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
    AgentListResponse,
    AgentHealthResponse
)

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.post("/", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent_data: AgentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AgentResponse:
    """
    Create a new agent
    
    Requires the user to own the project specified in project_id
    """
    # Verify project ownership
    project = await ProjectService.get_by_id(db, UUID(agent_data.project_id))
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to create agents in this project"
        )
    
    agent = await AgentService.create(db, agent_data, current_user.id)
    return AgentResponse.model_validate(agent)


@router.get("/", response_model=AgentListResponse)
async def list_agents(
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    env: Optional[str] = Query(None, description="Filter by environment (dev, staging, prod)"),
    health: Optional[str] = Query(None, description="Filter by health (healthy, degraded, unhealthy)"),
    status: Optional[str] = Query(None, description="Filter by status (testing, production, archived)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AgentListResponse:
    """
    List all agents for a project
    
    Supports filtering by environment, health, and status
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
            detail="You don't have permission to view agents in this project"
        )
    
    skip = (page - 1) * page_size
    agents, total = await AgentService.get_by_project(
        db, 
        UUID(project_id),
        skip=skip,
        limit=page_size,
        env=env,
        health=health,
        status=status
    )
    
    total_pages = (total + page_size - 1) // page_size
    
    return AgentListResponse(
        items=[AgentResponse.model_validate(a) for a in agents],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AgentResponse:
    """
    Get a specific agent by ID
    """
    try:
        agent_uuid = UUID(agent_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid agent ID format"
        )
    
    agent = await AgentService.get_by_id(db, agent_uuid)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, agent.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this agent"
        )
    
    return AgentResponse.model_validate(agent)


@router.put("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: str,
    agent_data: AgentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AgentResponse:
    """
    Update an existing agent
    """
    try:
        agent_uuid = UUID(agent_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid agent ID format"
        )
    
    # Get existing agent
    existing_agent = await AgentService.get_by_id(db, agent_uuid)
    if not existing_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, existing_agent.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this agent"
        )
    
    agent = await AgentService.update(db, agent_uuid, agent_data)
    return AgentResponse.model_validate(agent)


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete an agent
    """
    try:
        agent_uuid = UUID(agent_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid agent ID format"
        )
    
    # Get existing agent
    existing_agent = await AgentService.get_by_id(db, agent_uuid)
    if not existing_agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, existing_agent.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this agent"
        )
    
    await AgentService.delete(db, agent_uuid)


@router.get("/{agent_id}/health", response_model=AgentHealthResponse)
async def get_agent_health(
    agent_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AgentHealthResponse:
    """
    Get agent health metrics
    
    Returns health status, last heartbeat, and performance metrics
    """
    try:
        agent_uuid = UUID(agent_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid agent ID format"
        )
    
    agent = await AgentService.get_by_id(db, agent_uuid)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, agent.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this agent's health"
        )
    
    # TODO: Calculate real metrics from run history
    # For now, return basic health info
    from datetime import datetime, timezone
    uptime_seconds = None
    if agent.last_heartbeat:
        uptime_seconds = int((datetime.now(timezone.utc) - agent.last_heartbeat).total_seconds())
    
    return AgentHealthResponse(
        health=agent.health,
        last_heartbeat=agent.last_heartbeat,
        metrics={
            "concurrency": agent.concurrency,
            "autoscale": {
                "min": agent.autoscale_min,
                "max": agent.autoscale_max,
                "targetCpu": agent.autoscale_target_cpu
            }
        },
        uptime_seconds=uptime_seconds,
        error_count=0,  # TODO: Calculate from run history
        last_error=None
    )


@router.post("/{agent_id}/heartbeat", response_model=AgentResponse)
async def update_agent_heartbeat(
    agent_id: str,
    health_status: str = Query("healthy", pattern="^(healthy|degraded|unhealthy)$"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AgentResponse:
    """
    Update agent heartbeat timestamp and health status
    
    Used by agent runtime to report its health
    """
    try:
        agent_uuid = UUID(agent_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid agent ID format"
        )
    
    agent = await AgentService.update_heartbeat(db, agent_uuid, health_status)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found"
        )
    
    return AgentResponse.model_validate(agent)
