from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class WarehouseInventoryCreate(BaseModel):
    """DTO for creating a new warehouse inventory item"""
    warehouse_id: str
    sku: str = Field(..., min_length=1, max_length=100)
    quantity: int = Field(0, ge=0)
    unit_id: str

class WarehouseInventoryUpdate(BaseModel):
    """DTO for updating a warehouse inventory item"""
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    quantity: Optional[int] = Field(None, ge=0)
    unit_id: Optional[str] = None

class WarehouseInventoryResponse(BaseModel):
    """DTO for warehouse inventory response"""
    id: str
    warehouse_id: str
    sku: str
    quantity: int
    unit_id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AdjustInventoryQuantity(BaseModel):
    """DTO for adjusting inventory quantity"""
    quantity: int
    