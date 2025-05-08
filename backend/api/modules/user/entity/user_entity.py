from sqlalchemy import Column, String, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
import enum
from typing import List, Optional

from api.database import Base
from api.models.base import TimestampModel

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MEMBER = "member"
    MODERATOR = "moderator"

class User(Base, TimestampModel):
    """User entity model"""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    api_token = Column(String, nullable=True)
    role = Column(SQLEnum(UserRole), nullable=False, default=UserRole.MEMBER)
    phone = Column(String, nullable=True)
    permissions = Column(JSON, nullable=False, default=lambda: [])
    # metadata = Column(JSON, nullable=True)    
    def __repr__(self):
        return f"<User {self.username}>"
    
    def has_permission(self, permission: str) -> bool:
        """Check if user has a specific permission"""
        if self.role == UserRole.ADMIN:
            return True
        return permission in self.permissions
