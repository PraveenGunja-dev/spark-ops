"""
User schemas for request/response validation
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from uuid import UUID

from app.models.user import UserRole


# Shared properties
class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    name: str = Field(..., min_length=2, max_length=255)
    role: UserRole = UserRole.VIEWER


# Properties for user creation
class UserCreate(UserBase):
    """Schema for user registration"""
    password: str = Field(..., min_length=8, max_length=72)
    
    @field_validator('password')
    @classmethod
    def validate_password_length(cls, v: str) -> str:
        """Validate password length for bcrypt compatibility"""
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password must be no longer than 72 bytes when encoded in UTF-8')
        return v


# Properties for user update
class UserUpdate(BaseModel):
    """Schema for user update"""
    name: Optional[str] = Field(None, min_length=2, max_length=255)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8, max_length=72)
    
    @field_validator('password')
    @classmethod
    def validate_password_length(cls, v: str) -> str:
        """Validate password length for bcrypt compatibility"""
        if v is not None and len(v.encode('utf-8')) > 72:
            raise ValueError('Password must be no longer than 72 bytes when encoded in UTF-8')
        return v


# Properties for password change
class PasswordChange(BaseModel):
    """Schema for password change"""
    current_password: str = Field(..., min_length=8, max_length=72)
    new_password: str = Field(..., min_length=8, max_length=72)
    
    @field_validator('current_password', 'new_password')
    @classmethod
    def validate_password_length(cls, v: str) -> str:
        """Validate password length for bcrypt compatibility"""
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password must be no longer than 72 bytes when encoded in UTF-8')
        return v


# Properties to return via API
class UserResponse(UserBase):
    """Schema for user response"""
    id: UUID
    is_active: bool
    is_superuser: bool
    is_verified: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)


# Properties for user in DB
class UserInDB(UserResponse):
    """User in database (includes password hash)"""
    password_hash: str
    api_key_hash: Optional[str] = None


# API Key schemas
class APIKeyCreate(BaseModel):
    """Schema for API key creation"""
    name: str = Field(..., min_length=3, max_length=100, description="Name for the API key")


class APIKeyResponse(BaseModel):
    """Schema for API key response"""
    api_key: str = Field(..., description="API key (only shown once)")
    name: str
    created_at: datetime