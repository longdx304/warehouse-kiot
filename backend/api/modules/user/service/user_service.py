from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from datetime import timedelta

from api.modules.user.repository.user_repo import UserRepository
from api.modules.user.entity import user_entity
from api.modules.user.dto.input import UserCreate, UserUpdate
from api.utils.password import hash_password, verify_password
from api.middlewares.auth.jwt_token_handler import create_access_token
from api.config import settings

class UserService:
    """Service for user business logic"""
    
    def __init__(self, db: AsyncSession):
        self.repository = UserRepository(db)
    
    async def create_user(self, user_data: UserCreate) -> user_entity.User:
        """Create a new user"""
        # Check if email already exists
        existing_email = await self.repository.get_by_email(user_data.email)
        if existing_email:
            raise ValueError("Email already registered")
        
        # Check if username already exists
        existing_username = await self.repository.get_by_username(user_data.username)
        if existing_username:
            raise ValueError("Username already taken")
        
        # Hash password
        user_dict = user_data.model_dump()
        user_dict["password_hash"] = hash_password(user_dict.pop("password"))
        
        # Create user
        return await self.repository.create(user_dict)
    
    async def get_by_id(self, user_id: str) -> Optional[user_entity.User]:
        """Get user by ID"""
        return await self.repository.get_by_id(user_id)
    
    async def get_by_email(self, email: str) -> Optional[user_entity.User]:
        """Get user by email"""
        return await self.repository.get_by_email(email)
    
    async def get_all_users(self, skip: int = 0, limit: int = 100) -> List[user_entity.User]:
        """Get all users"""
        return await self.repository.get_all(skip, limit)
    
    async def count_all_users(self) -> int:
        """Count all users"""
        return await self.repository.count_all()
    
    async def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[user_entity.User]:
        """Update a user"""
        # Get existing user
        existing_user = await self.repository.get_by_id(user_id)
        if not existing_user:
            return None
        
        # Filter out None values
        update_data = {k: v for k, v in user_data.model_dump().items() if v is not None}
        
        # Perform update
        if update_data:
            return await self.repository.update(user_id, update_data)
        
        return existing_user
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete a user"""
        return await self.repository.delete(user_id)
    
    async def authenticate_user(self, email: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate a user and return JWT token if valid"""
        # Get user by email
        user = await self.repository.get_by_email(email)
        if not user:
            return None
        
        # Verify password
        if not verify_password(password, user.password_hash):
            return None
        
        # Generate token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        token_data = {
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "permissions": user.permissions
        }
        
        access_token = create_access_token(
            data=token_data, 
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user
        }
        
        