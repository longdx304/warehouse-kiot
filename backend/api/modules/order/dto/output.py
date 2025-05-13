from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, ConfigDict, field_validator, model_validator

class LineItemResponse(BaseModel):
    """DTO for line item response"""
    id: str
    order_id: str
    product_code: str
    product_name: str
    quantity: float
    warehouse_inventory: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
    
    @field_validator('warehouse_inventory')
    @classmethod
    def validate_warehouse_inventory(cls, v: Any) -> Optional[int]:
        """Validate and convert warehouse_inventory field"""
        import logging
        logging.info(f"LineItemResponse validator - Original warehouse_inventory value: {repr(v)}, type: {type(v)}")
        
        # Return None if value is None
        if v is None:
            return None
            
        # Try to convert to integer
        try:
            result = int(v)
            logging.info(f"LineItemResponse validator - Converted to: {result}")
            return result
        except (TypeError, ValueError) as e:
            logging.error(f"LineItemResponse validator - Conversion error: {str(e)}")
            return None

class OrderResponse(BaseModel):
    """DTO for order response"""
    id: str
    code: str
    customer_name: Optional[str] = None
    status: int
    status_value: Optional[str] = None
    handler_id: Optional[str] = None
    handler_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    items: List[LineItemResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class OrderListResponse(BaseModel):
    """DTO for order list response"""
    total: int
    skip: int
    limit: int
    data: List[OrderResponse] 