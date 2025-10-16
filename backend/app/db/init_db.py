"""
Database initialization utilities
"""
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User, UserRole
from app.services.user_service import UserService
from app.schemas.user import UserCreate
from app.core.config import settings

logger = structlog.get_logger()


async def init_db(db: AsyncSession) -> None:
    """
    Initialize database with default data
    
    Creates a default superuser if none exists
    """
    from sqlalchemy import select
    
    # Check if any users exist
    result = await db.execute(select(User))
    existing_users = result.scalars().all()
    
    if not existing_users:
        logger.info("Creating default superuser")
        
        # Create default superuser
        superuser_data = UserCreate(
            email="admin@sparkops.ai",
            name="Admin User",
            password="changeme123",  # Should be changed immediately
            role=UserRole.OWNER,
        )
        
        user = await UserService.create(db, superuser_data)
        user.is_superuser = True
        user.is_verified = True
        
        await db.commit()
        
        logger.info(
            "superuser_created",
            email=user.email,
            message="⚠️  Default password is 'changeme123' - CHANGE IT IMMEDIATELY!"
        )
    else:
        logger.info("database_initialized", user_count=len(existing_users))
