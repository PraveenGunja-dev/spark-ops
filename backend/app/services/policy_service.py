"""
Policy Service Layer
Business logic for policy CRUD operations
"""
from typing import List, Tuple, Optional
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.policy import Policy, PolicyType, PolicyStatus
from app.schemas.policy import PolicyCreate, PolicyUpdate


class PolicyService:
    """Service class for Policy business logic"""
    
    @staticmethod
    async def create(
        db: AsyncSession,
        policy_data: PolicyCreate,
        user_id: UUID
    ) -> Policy:
        """
        Create a new policy
        
        Args:
            db: Database session
            policy_data: Policy creation data
            user_id: ID of the user creating the policy
            
        Returns:
            Created Policy object
        """
        policy = Policy(
            name=policy_data.name,
            project_id=UUID(policy_data.project_id),
            description=policy_data.description,
            type=policy_data.type,
            status=policy_data.status,
            config=policy_data.config,
            rules=policy_data.rules,
            metadata_=policy_data.metadata
        )
        
        db.add(policy)
        await db.commit()
        await db.refresh(policy)
        
        return policy
    
    @staticmethod
    async def get_by_id(db: AsyncSession, policy_id: UUID) -> Optional[Policy]:
        """
        Get a policy by ID
        
        Args:
            db: Database session
            policy_id: Policy ID
            
        Returns:
            Policy object or None if not found
        """
        result = await db.execute(select(Policy).where(Policy.id == policy_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_by_project(
        db: AsyncSession,
        project_id: UUID,
        skip: int = 0,
        limit: int = 100,
        policy_type: Optional[PolicyType] = None,
        status: Optional[PolicyStatus] = None
    ) -> Tuple[List[Policy], int]:
        """
        Get policies by project with pagination
        
        Args:
            db: Database session
            project_id: Project ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            policy_type: Optional policy type filter
            status: Optional status filter
            
        Returns:
            Tuple of (policies, total_count)
        """
        # Build query
        query = select(Policy).where(Policy.project_id == project_id)
        
        if policy_type:
            query = query.where(Policy.type == policy_type)
        
        if status:
            query = query.where(Policy.status == status)
        
        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar_one()
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        policies = list(result.scalars().all())
        
        return policies, total
    
    @staticmethod
    async def update(
        db: AsyncSession,
        policy_id: UUID,
        policy_data: PolicyUpdate,
        user_id: UUID
    ) -> Optional[Policy]:
        """
        Update an existing policy
        
        Args:
            db: Database session
            policy_id: Policy ID
            policy_data: Policy update data
            user_id: ID of the user updating the policy
            
        Returns:
            Updated Policy object or None if not found
        """
        policy = await PolicyService.get_by_id(db, policy_id)
        if not policy:
            return None
        
        # Update fields
        update_data = policy_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "metadata":
                setattr(policy, "metadata_", value)
            else:
                setattr(policy, field, value)
        
        await db.commit()
        await db.refresh(policy)
        
        return policy
    
    @staticmethod
    async def delete(db: AsyncSession, policy_id: UUID) -> bool:
        """
        Delete a policy
        
        Args:
            db: Database session
            policy_id: Policy ID
            
        Returns:
            True if deleted, False if not found
        """
        policy = await PolicyService.get_by_id(db, policy_id)
        if not policy:
            return False
        
        await db.delete(policy)
        await db.commit()
        
        return True