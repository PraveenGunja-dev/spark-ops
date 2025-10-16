"""
Tool Service Layer
Business logic for tool CRUD operations
"""
from typing import List, Tuple, Optional
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tool import Tool, ToolType, ToolStatus
from app.schemas.tool import ToolCreate, ToolUpdate


class ToolService:
    """Service class for Tool business logic"""
    
    @staticmethod
    async def create(
        db: AsyncSession,
        tool_data: ToolCreate,
        user_id: UUID
    ) -> Tool:
        """
        Create a new tool
        
        Args:
            db: Database session
            tool_data: Tool creation data
            user_id: ID of the user creating the tool
            
        Returns:
            Created tool instance
        """
        tool = Tool(
            name=tool_data.name,
            project_id=UUID(tool_data.project_id),
            type=ToolType(tool_data.kind) if hasattr(ToolType, tool_data.kind.upper()) else ToolType.CUSTOM,
            status=ToolStatus.TESTING,
            description=tool_data.description,
            env=tool_data.env,
            function_schema=tool_data.function_schema,
            config=tool_data.config,
            metadata_={"auth_type": tool_data.auth_type, "scopes": tool_data.scopes, "provider": tool_data.provider, "rate_limit_per_min": tool_data.rate_limit_per_min},
            is_global=tool_data.is_global,
            is_enabled=tool_data.is_enabled,
        )
        
        db.add(tool)
        await db.commit()
        await db.refresh(tool)
        return tool
    
    @staticmethod
    async def get_by_id(db: AsyncSession, tool_id: UUID) -> Optional[Tool]:
        """Get tool by ID"""
        result = await db.execute(
            select(Tool).where(Tool.id == tool_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_by_project(
        db: AsyncSession,
        project_id: UUID,
        skip: int = 0,
        limit: int = 20,
        kind: Optional[str] = None,
        env: Optional[str] = None,
        auth_type: Optional[str] = None
    ) -> Tuple[List[Tool], int]:
        """
        Get tools by project with optional filters
        
        Args:
            db: Database session
            project_id: Project ID to filter by
            skip: Number of records to skip
            limit: Maximum records to return
            kind: Filter by tool kind
            env: Filter by environment
            auth_type: Filter by authentication type
            
        Returns:
            Tuple of (tools list, total count)
        """
        query = select(Tool).where(Tool.project_id == project_id)
        
        # Apply filters
        if kind:
            query = query.where(Tool.type == ToolType(kind))
        
        if env:
            query = query.where(Tool.env == env)
        
        if auth_type:
            # Filter by auth_type in metadata
            query = query.where(Tool.metadata_['auth_type'].astext == auth_type)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar_one()
        
        # Get paginated results
        query = query.offset(skip).limit(limit).order_by(Tool.created_at.desc())
        result = await db.execute(query)
        tools = list(result.scalars().all())
        
        return tools, total
    
    @staticmethod
    async def update(
        db: AsyncSession,
        tool_id: UUID,
        tool_data: ToolUpdate
    ) -> Optional[Tool]:
        """
        Update an existing tool
        
        Args:
            db: Database session
            tool_id: ID of tool to update
            tool_data: Update data
            
        Returns:
            Updated tool or None if not found
        """
        tool = await ToolService.get_by_id(db, tool_id)
        if not tool:
            return None
        
        # Update only provided fields
        update_data = tool_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == 'metadata':
                field = 'metadata_'  # Handle SQLAlchemy naming
            setattr(tool, field, value)
        
        await db.commit()
        await db.refresh(tool)
        return tool
    
    @staticmethod
    async def delete(db: AsyncSession, tool_id: UUID) -> bool:
        """
        Delete a tool
        
        Args:
            db: Database session
            tool_id: ID of tool to delete
            
        Returns:
            True if deleted, False if not found
        """
        tool = await ToolService.get_by_id(db, tool_id)
        if not tool:
            return False
        
        await db.delete(tool)
        await db.commit()
        return True
    
    @staticmethod
    async def record_error(
        db: AsyncSession,
        tool_id: UUID,
        error_message: str
    ) -> Optional[Tool]:
        """
        Record an error for a tool
        
        Args:
            db: Database session
            tool_id: Tool ID
            error_message: Error message to record
            
        Returns:
            Updated tool or None if not found
        """
        tool = await ToolService.get_by_id(db, tool_id)
        if not tool:
            return None
        
        from datetime import datetime, timezone
        tool.last_error_at = datetime.now(timezone.utc)
        
        # Store error in metadata
        if not tool.metadata_:
            tool.metadata_ = {}
        tool.metadata_['last_error'] = error_message
        
        await db.commit()
        await db.refresh(tool)
        return tool
