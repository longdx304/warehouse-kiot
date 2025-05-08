from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class WarehouseCreate(BaseModel):
    """DTO for creating a new warehouse"""
    location: str = Field(..., min_length=1, max_length=255)

class WarehouseUpdate(BaseModel):
    """DTO for updating a warehouse"""
    location: Optional[str] = Field(None, min_length=1, max_length=255)

class WarehouseResponse(BaseModel):
    """DTO for warehouse response"""
    id: str
    location: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
        
class PaginationWarehouseResponse(BaseModel):
    """DTO for pagination response"""
    warehouses: List[WarehouseResponse]
    count: int
    offset: int
    limit: int
    