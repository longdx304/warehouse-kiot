from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime
from api.modules.user.entity import user_entity

class UserCreate(BaseModel):
    """DTO for creating a new user"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None
    role: user_entity.UserRole = user_entity.UserRole.MEMBER
    permissions: List[str] = []

class UserUpdate(BaseModel):
    """DTO for updating a user"""
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    phone: Optional[str] = None
    role: Optional[user_entity.UserRole] = None
    permissions: Optional[List[str]] = None

class UserResponse(BaseModel):
    """DTO for user response"""
    id: str
    email: str
    username: str
    role: user_entity.UserRole
    phone: Optional[str] = None
    permissions: List[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    """DTO for user login"""
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    """DTO for token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class PaginatedUsersResponse(BaseModel):
    users: List[UserResponse]
    count: int
    offset: int
    limit: int
    