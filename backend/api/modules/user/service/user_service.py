from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional, Dict, Any
from datetime import timedelta, datetime
import uuid

from api.modules.user.repository.user_repository import UserRepository
from api.modules.user.entity import user_entity
from api.modules.user.dto.input import UserCreate, UserUpdate
from api.utils.password import hash_password, verify_password
from api.middlewares.auth.jwt_token_handler import create_access_token
from api.config import settings
from core.cache import redis
from core.error_handlers import add_error_handlers
from core.exceptions import NotFoundException, ValidationException, AuthenticationException

class UserService:
    """Service for user business logic"""
    
    def __init__(self, db: AsyncSession):
        self.repository = UserRepository(db)
    
    async def create_user(self, user_data: UserCreate) -> user_entity.User:
        """Create a new user"""
        # Check if email already exists
        existing_email = await self.repository.get_by_email(user_data.email)
        if existing_email:
            raise ValidationException("User with this email already exists")
        
        # Check if username already exists
        existing_username = await self.repository.get_by_username(user_data.username)
        if existing_username:
            raise ValidationException("Username already taken")
        
        # Hash password
        user_dict = user_data.model_dump()
        user_dict["password_hash"] = hash_password(user_dict.pop("password"))
        
        # Create user
        return await self.repository.create(user_dict)
    
    async def get_by_id(self, user_id: str) -> Optional[user_entity.User]:
        """Get user by ID"""
        user = await self.repository.get_by_id(user_id)
        if not user:
            raise NotFoundException(f"User with id {user_id} not found")
        return user
    
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
            raise NotFoundException(f"User with id {user_id} not found")
        
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
            raise AuthenticationException("Invalid email or password")
        
        # Verify password
        if not verify_password(password, user.password_hash):
            raise AuthenticationException("Invalid email or password")
        
        # Generate tokens
        access_token_expires = timedelta(minutes=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES))
        refresh_token_expires = timedelta(days=int(settings.REFRESH_TOKEN_EXPIRE_DAYS))
        
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
        
        # Create refresh token with UUID
        refresh_token = str(uuid.uuid4())
        
        # Store refresh token in Redis with expiration
        refresh_token_key = f"refresh_token:{refresh_token}"
        refresh_token_data = {
            "user_id": user.id,
            "email": user.email,
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Store refresh token in Redis
        await redis.setex(
            refresh_token_key, 
            int(refresh_token_expires.total_seconds()), 
            str(refresh_token_data)
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user
        }
        
    async def refresh_token(self, refresh_token: str) -> Optional[Dict[str, Any]]:
        """Generate a new access token using a valid refresh token"""
        # Check if refresh token exists in Redis
        refresh_token_key = f"refresh_token:{refresh_token}"
        token_data_str = await redis.get(refresh_token_key)
        
        if not token_data_str:
            return None
            
        # Get user information from refresh token
        import ast
        token_data = ast.literal_eval(token_data_str)
        user_id = token_data["user_id"]
        
        # Get user from database
        user = await self.repository.get_by_id(user_id)
        if not user:
            return None
            
        # Generate new access token
        access_token_expires = timedelta(minutes=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES))
        
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
        
        # Ensure user is fully loaded and attached to session
        await self.repository.db.refresh(user)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,  # Return the same refresh token
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user
        }
        
    async def logout(self, refresh_token: str) -> bool:
        """Logout user by invalidating refresh token"""
        # Delete refresh token from Redis
        refresh_token_key = f"refresh_token:{refresh_token}"
        result = await redis.delete(refresh_token_key)
        
        return result > 0
        
    async def logout_all(self, user_id: str) -> bool:
        """Logout from all devices by invalidating all refresh tokens for a user"""
        # Find all refresh tokens for this user
        # This is a simplistic approach using key scanning - might need optimization for production
        refresh_token_pattern = "refresh_token:*"
        cursor = 0
        deleted_count = 0
        
        while True:
            cursor, keys = await redis.scan(cursor, match=refresh_token_pattern, count=100)
            
            for key in keys:
                token_data_str = await redis.get(key)
                if token_data_str:
                    import ast
                    token_data = ast.literal_eval(token_data_str)
                    if token_data.get("user_id") == user_id:
                        await redis.delete(key)
                        deleted_count += 1
            
            if cursor == 0:
                break
                
        return deleted_count > 0
        
        