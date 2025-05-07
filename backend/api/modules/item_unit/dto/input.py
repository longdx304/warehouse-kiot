from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ItemUnitCreate(BaseModel):
    """DTO for creating a new item unit"""
    unit: str = Field(..., min_length=1, max_length=50)
    quantity: int = Field(1, gt=0)

class ItemUnitUpdate(BaseModel):
    """DTO for updating an item unit"""
    unit: Optional[str] = Field(None, min_length=1, max_length=50)
    quantity: Optional[int] = Field(None, gt=0)

class ItemUnitResponse(BaseModel):
    """DTO for item unit response"""
    id: str
    unit: str
    quantity: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        