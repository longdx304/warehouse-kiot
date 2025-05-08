from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from typing import List, Optional

from api.modules.user.entity import user_entity
from api.utils.id_generator import generate_id, Prefix

class UserRepository:
    """Repository for user data access"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, user_data: dict) -> user_entity.User:
        """Create a new user"""
        # Generate ID with proper prefix
        user_data["id"] = generate_id(Prefix.USER)
        
        # Create user instance
        user = user_entity.User(**user_data)
        
        # Add to database
        self.db.add(user)
        await self.db.flush()
        
        return user
    
    async def get_by_id(self, user_id: str) -> Optional[user_entity.User]:
        """Get user by ID"""
        query = select(user_entity.User).where(user_entity.User.id == user_id)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def get_by_email(self, email: str) -> Optional[user_entity.User]:
        """Get user by email"""
        query = select(user_entity.User).where(user_entity.User.email == email)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def get_by_username(self, username: str) -> Optional[user_entity.User]:
        """Get user by username"""
        query = select(user_entity.User).where(user_entity.User.username == username)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[user_entity.User]:
        """Get all users with pagination"""
        query = select(user_entity.User).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def count_all(self) -> int:
        """Count all users"""
        query = select(func.count()).select_from(user_entity.User)
        result = await self.db.execute(query)
        return result.scalar()
    
    async def update(self, user_id: str, user_data: dict) -> Optional[user_entity.User]:
        """Update a user"""
        query = update(user_entity.User).where(user_entity.User.id == user_id).values(**user_data).returning(user_entity.User)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def delete(self, user_id: str) -> bool:
        """Delete a user"""
        query = delete(user_entity.User).where(user_entity.User.id == user_id)
        result = await self.db.execute(query)
        return result.rowcount > 0
