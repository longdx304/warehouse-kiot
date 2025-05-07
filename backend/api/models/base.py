from sqlalchemy import Column, DateTime, func
from sqlalchemy.ext.declarative import declared_attr
from datetime import datetime
from api.database import Base
from pydantic import BaseModel

class TimestampModel:
    """Mixin that adds created_at and updated_at columns to a model"""
    
    @declared_attr
    def created_at(cls):
        return Column(DateTime, default=datetime.utcnow, nullable=False)
    
    @declared_attr
    def updated_at(cls):
        return Column(
            DateTime, 
            default=datetime.utcnow, 
            onupdate=datetime.utcnow, 
            nullable=False
        )
