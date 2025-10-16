"""
User model for authentication and authorization
"""
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
import uuid
import enum

from app.db.base import Base, TimestampMixin


class UserRole(str, enum.Enum):
    """User role enumeration"""
    OWNER = "owner"
    ADMIN = "admin"
    DEVELOPER = "developer"
    VIEWER = "viewer"


class User(Base, TimestampMixin):
    """User model for authentication and authorization"""
    
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.VIEWER)
    
    # API Key for programmatic access
    api_key = Column(String(255), unique=True, nullable=True, index=True)
    api_key_hash = Column(String(255), nullable=True)
    
    # User status
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    # Tracking
    last_login_at = Column(DateTime, nullable=True)
    
    # User preferences and settings
    settings = Column(JSONB, default=dict, nullable=False)
    
    def __repr__(self) -> str:
        return f"<User(email={self.email}, role={self.role})>"
    
    @property
    def is_admin_or_owner(self) -> bool:
        """Check if user is admin or owner"""
        return self.role in [UserRole.ADMIN, UserRole.OWNER]
