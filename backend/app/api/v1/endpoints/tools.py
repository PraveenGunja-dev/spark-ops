"""
Tool API Endpoints
RESTful API for tool management
"""
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.project import Project
from app.services.tool_service import ToolService
from app.services.project_service import ProjectService
from app.schemas.tool import (
    ToolCreate,
    ToolUpdate,
    ToolResponse,
    ToolListResponse,
    ToolTestResponse
)

router = APIRouter(prefix="/tools", tags=["Tools"])


@router.post("/", response_model=ToolResponse, status_code=status.HTTP_201_CREATED)
async def create_tool(
    tool_data: ToolCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ToolResponse:
    """
    Create a new tool
    
    Requires the user to own the project specified in project_id
    """
    # Verify project ownership
    project = await ProjectService.get_by_id(db, UUID(tool_data.project_id))
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to create tools in this project"
        )
    
    tool = await ToolService.create(db, tool_data, current_user.id)
    return ToolResponse.model_validate(tool)


@router.get("/", response_model=ToolListResponse)
async def list_tools(
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
    kind: Optional[str] = Query(None, description="Filter by tool kind"),
    env: Optional[str] = Query(None, description="Filter by environment"),
    auth_type: Optional[str] = Query(None, description="Filter by auth type"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ToolListResponse:
    """
    List all tools for a project
    
    Supports filtering by kind, environment, and auth type
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
            detail="You don't have permission to view tools in this project"
        )
    
    skip = (page - 1) * page_size
    tools, total = await ToolService.get_by_project(
        db,
        UUID(project_id),
        skip=skip,
        limit=page_size,
        kind=kind,
        env=env,
        auth_type=auth_type
    )
    
    total_pages = (total + page_size - 1) // page_size
    
    return ToolListResponse(
        items=[ToolResponse.model_validate(t) for t in tools],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{tool_id}", response_model=ToolResponse)
async def get_tool(
    tool_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ToolResponse:
    """
    Get a specific tool by ID
    """
    try:
        tool_uuid = UUID(tool_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tool ID format"
        )
    
    tool = await ToolService.get_by_id(db, tool_uuid)
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, tool.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this tool"
        )
    
    return ToolResponse.model_validate(tool)


@router.put("/{tool_id}", response_model=ToolResponse)
async def update_tool(
    tool_id: str,
    tool_data: ToolUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ToolResponse:
    """
    Update an existing tool
    """
    try:
        tool_uuid = UUID(tool_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tool ID format"
        )
    
    # Get existing tool
    existing_tool = await ToolService.get_by_id(db, tool_uuid)
    if not existing_tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, existing_tool.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this tool"
        )
    
    tool = await ToolService.update(db, tool_uuid, tool_data)
    return ToolResponse.model_validate(tool)


@router.delete("/{tool_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tool(
    tool_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete a tool
    """
    try:
        tool_uuid = UUID(tool_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tool ID format"
        )
    
    # Get existing tool
    existing_tool = await ToolService.get_by_id(db, tool_uuid)
    if not existing_tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, existing_tool.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this tool"
        )
    
    await ToolService.delete(db, tool_uuid)


@router.post("/{tool_id}/test", response_model=ToolTestResponse)
async def test_tool_connection(
    tool_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ToolTestResponse:
    """
    Test tool connection/configuration
    
    This is a placeholder - actual implementation would test the specific tool type
    """
    try:
        tool_uuid = UUID(tool_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tool ID format"
        )
    
    tool = await ToolService.get_by_id(db, tool_uuid)
    if not tool:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tool not found"
        )
    
    # Verify project ownership
    project = await ProjectService.get_by_id(db, tool.project_id)
    if not project or project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to test this tool"
        )
    
    # TODO: Implement actual tool testing logic based on kind
    # For now, return a success placeholder
    return ToolTestResponse(
        success=True,
        message=f"Tool '{tool.name}' configuration is valid",
        details={
            "kind": tool.kind.value,
            "auth_type": tool.auth_type.value,
            "provider": tool.provider
        }
    )
