"""
Agent Service Layer
Business logic for agent CRUD operations
"""
from typing import List, Tuple, Optional
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.agent import Agent, AgentStatus
from app.schemas.agent import AgentCreate, AgentUpdate


class AgentService:
    """Service class for Agent business logic"""
    
    @staticmethod
    async def create(
        db: AsyncSession,
        agent_data: AgentCreate,
        user_id: UUID
    ) -> Agent:
        """
        Create a new agent
        
        Args:
            db: Database session
            agent_data: Agent creation data
            user_id: ID of the user creating the agent
            
        Returns:
            Created agent instance
        """
        agent = Agent(
            name=agent_data.name,
            project_id=UUID(agent_data.project_id),
            type=agent_data.type,
            status=AgentStatus.TESTING,  # New agents start in testing
            
            # AI Configuration
            model=agent_data.model,
            provider=agent_data.provider,
            temperature=agent_data.temperature,
            
            # Runtime
            runtime=agent_data.runtime,
            env=agent_data.env,
            concurrency=agent_data.concurrency,
            
            # Instructions
            system_prompt=agent_data.system_prompt,
            instructions=agent_data.instructions,
            prompt_summary=agent_data.prompt_summary,
            
            # Capabilities
            tools=agent_data.tools,
            capabilities=agent_data.capabilities,
            
            # Autoscaling
            autoscale_min=agent_data.autoscale_min,
            autoscale_max=agent_data.autoscale_max,
            autoscale_target_cpu=agent_data.autoscale_target_cpu,
            
            # Configuration
            config=agent_data.config,
            metadata_=agent_data.metadata,
        )
        
        db.add(agent)
        await db.commit()
        await db.refresh(agent)
        return agent
    
    @staticmethod
    async def get_by_id(db: AsyncSession, agent_id: UUID) -> Optional[Agent]:
        """Get agent by ID"""
        result = await db.execute(
            select(Agent).where(Agent.id == agent_id)
        )
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_by_project(
        db: AsyncSession,
        project_id: UUID,
        skip: int = 0,
        limit: int = 20,
        env: Optional[str] = None,
        health: Optional[str] = None,
        status: Optional[str] = None
    ) -> Tuple[List[Agent], int]:
        """
        Get agents by project with optional filters
        
        Args:
            db: Database session
            project_id: Project ID to filter by
            skip: Number of records to skip
            limit: Maximum records to return
            env: Filter by environment
            health: Filter by health status
            status: Filter by agent status
            
        Returns:
            Tuple of (agents list, total count)
        """
        query = select(Agent).where(Agent.project_id == project_id)
        
        # Apply filters
        if env:
            query = query.where(Agent.env == env)
        if health:
            query = query.where(Agent.health == health)
        if status:
            try:
                status_enum = AgentStatus(status)
                query = query.where(Agent.status == status_enum)
            except ValueError:
                pass  # Invalid status, ignore filter
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar_one()
        
        # Get paginated results
        query = query.offset(skip).limit(limit).order_by(Agent.created_at.desc())
        result = await db.execute(query)
        agents = list(result.scalars().all())
        
        return agents, total
    
    @staticmethod
    async def update(
        db: AsyncSession,
        agent_id: UUID,
        agent_data: AgentUpdate
    ) -> Optional[Agent]:
        """
        Update an existing agent
        
        Args:
            db: Database session
            agent_id: ID of agent to update
            agent_data: Update data
            
        Returns:
            Updated agent or None if not found
        """
        agent = await AgentService.get_by_id(db, agent_id)
        if not agent:
            return None
        
        # Update only provided fields
        update_data = agent_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == 'metadata':
                field = 'metadata_'  # Handle SQLAlchemy naming
            setattr(agent, field, value)
        
        await db.commit()
        await db.refresh(agent)
        return agent
    
    @staticmethod
    async def delete(db: AsyncSession, agent_id: UUID) -> bool:
        """
        Delete an agent
        
        Args:
            db: Database session
            agent_id: ID of agent to delete
            
        Returns:
            True if deleted, False if not found
        """
        agent = await AgentService.get_by_id(db, agent_id)
        if not agent:
            return False
        
        await db.delete(agent)
        await db.commit()
        return True
    
    @staticmethod
    async def update_heartbeat(
        db: AsyncSession,
        agent_id: UUID,
        health_status: str = "healthy"
    ) -> Optional[Agent]:
        """
        Update agent heartbeat and health status
        
        Args:
            db: Database session
            agent_id: Agent ID
            health_status: Health status (healthy, degraded, unhealthy)
            
        Returns:
            Updated agent or None if not found
        """
        agent = await AgentService.get_by_id(db, agent_id)
        if not agent:
            return None
        
        from datetime import datetime, timezone
        agent.last_heartbeat = datetime.now(timezone.utc)
        agent.health = health_status
        
        await db.commit()
        await db.refresh(agent)
        return agent
