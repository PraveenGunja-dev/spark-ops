"""WebSocket security utilities"""

from typing import Optional
from jose import jwt, JWTError
from app.core.config import settings
from app.schemas.user import UserResponse
import logging

logger = logging.getLogger(__name__)

class UserWithProjects:
    """Minimal user class for WebSocket authentication with projects attribute"""
    def __init__(self, id, email, is_active, is_superuser, projects=None):
        self.id = id
        self.email = email
        self.is_active = is_active
        self.is_superuser = is_superuser
        self.projects = projects or []

async def get_current_user_ws(token: str) -> Optional[UserWithProjects]:
    """
    Validate JWT token from WebSocket connection and return user
    
    Args:
        token: JWT token from WebSocket auth
        
    Returns:
        User object if token is valid, None otherwise
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            logger.warning("Invalid token: missing sub claim")
            return None
            
        # Create a minimal user object with just the ID
        # In a real implementation, you might want to fetch the user from the database
        user = UserWithProjects(
            id=user_id,
            email=payload.get("email", ""),
            is_active=True,
            is_superuser=payload.get("is_superuser", False),
            projects=[]  # This would be populated from the database in a real implementation
        )
        return user
    except JWTError as e:
        logger.warning(f"JWT validation error: {str(e)}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error in token validation: {str(e)}")
        return None