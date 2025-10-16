"""
User service for user-related business logic
"""
from typing import Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password, generate_api_key, hash_api_key


class UserService:
    """Service for user operations"""
    
    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: UUID) -> Optional[User]:
        """Get user by ID"""
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[User]:
        """Get user by email"""
        result = await db.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def get_by_api_key(db: AsyncSession, api_key: str) -> Optional[User]:
        """Get user by API key"""
        # Hash the provided API key and compare with stored hash
        result = await db.execute(select(User).where(User.api_key == api_key))
        return result.scalar_one_or_none()
    
    @staticmethod
    async def create(db: AsyncSession, user_data: UserCreate) -> User:
        """Create a new user"""
        # Hash password
        password_hash = get_password_hash(user_data.password)
        
        # Create user
        user = User(
            email=user_data.email,
            name=user_data.name,
            password_hash=password_hash,
            role=user_data.role,
            is_active=True,
            is_verified=False,
        )
        
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user
    
    @staticmethod
    async def update(
        db: AsyncSession,
        user: User,
        user_data: UserUpdate,
    ) -> User:
        """Update user"""
        update_data = user_data.model_dump(exclude_unset=True)
        
        # Hash password if being updated
        if "password" in update_data:
            update_data["password_hash"] = get_password_hash(update_data.pop("password"))
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        await db.commit()
        await db.refresh(user)
        return user
    
    @staticmethod
    async def authenticate(
        db: AsyncSession,
        email: str,
        password: str,
    ) -> Optional[User]:
        """Authenticate user with email and password"""
        user = await UserService.get_by_email(db, email)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        if not user.is_active:
            return None
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        await db.commit()
        
        return user
    
    @staticmethod
    async def create_api_key(db: AsyncSession, user: User) -> tuple[str, User]:
        """Generate API key for user"""
        # Generate new API key
        api_key = generate_api_key()
        
        # Store API key and its hash
        user.api_key = api_key
        user.api_key_hash = hash_api_key(api_key)
        
        await db.commit()
        await db.refresh(user)
        
        return api_key, user
    
    @staticmethod
    async def revoke_api_key(db: AsyncSession, user: User) -> User:
        """Revoke user's API key"""
        user.api_key = None
        user.api_key_hash = None
        
        await db.commit()
        await db.refresh(user)
        
        return user
