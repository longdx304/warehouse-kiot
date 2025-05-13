from fastapi import APIRouter, Depends, HTTPException, status as http_status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, Dict, Optional, List
from datetime import datetime, date
import logging

from api.database import get_db
from api.modules.order.service.order_service import OrderService
from pydantic import BaseModel
from api.modules.order.dto.output import OrderListResponse, OrderResponse

class OrderInventoryRequest(BaseModel):
    """DTO for order inventory management requests"""
    warehouse_id: str
    line_item_id: str
    sku: str
    unit_id: str
    quantity: float
    type: str = "INBOUND"  # INBOUND or OUTBOUND
    reset_inventory: bool = False  # Flag to reset inventory rather than adding/subtracting

class OrderInventoryResponse(BaseModel):
    """DTO for order inventory management responses"""
    success: bool
    message: str
    inventory_quantity: float
    warehouse_quantity: float = 0

class OrderInventoryRemoveRequest(BaseModel):
    """DTO for removing order inventory"""
    warehouse_id: str
    sku: str
    unit_id: str
    quantity: float

class OrderInventoryRemoveResponse(BaseModel):
    """DTO for order inventory removal responses"""
    success: bool
    message: str
    inventory_quantity: float

class UpdateLineItemWarehouseInventoryRequest(BaseModel):
    """DTO for updating line item warehouse inventory"""
    warehouse_inventory: int

class UpdateLineItemWarehouseInventoryResponse(BaseModel):
    """DTO for line item warehouse inventory update response"""
    success: bool
    message: str
    data: Optional[Dict[str, Any]] = None

class SyncOrderWarehouseInventoryResponse(BaseModel):
    """DTO for order warehouse inventory synchronization response"""
    success: bool
    message: str
    order_id: Optional[str] = None
    updated_count: Optional[int] = None
    updated_items: Optional[List[Dict[str, Any]]] = None

order_router = APIRouter()

@order_router.post("/inventory", response_model=OrderInventoryResponse)
async def create_order_inventory(
    request: OrderInventoryRequest,
    db: AsyncSession = Depends(get_db)
):
    """Create or update order inventory allocation"""
    order_service = OrderService(db)
    try:
        result = await order_service.create(request.dict())
        return result
    except ValueError as e:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@order_router.post("/inventory/remove", response_model=OrderInventoryRemoveResponse)
async def remove_order_inventory(
    request: OrderInventoryRemoveRequest,
    db: AsyncSession = Depends(get_db)
):
    """Remove order inventory allocation"""
    order_service = OrderService(db)
    try:
        result = await order_service.remove(request.dict())
        return result
    except ValueError as e:
        raise HTTPException(status_code=http_status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@order_router.get("/", response_model=OrderListResponse)
async def list_orders(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of records to return"),
    order_status: Optional[int] = Query(None, description="Filter by order status"),
    code: Optional[str] = Query(None, description="Filter by order code (partial match)"),
    customer_name: Optional[str] = Query(None, description="Filter by customer name (partial match)"),
    handler_id: Optional[str] = Query(None, description="Filter by handler ID"),
    date_from: Optional[date] = Query(None, description="Filter by created date (from)"),
    date_to: Optional[date] = Query(None, description="Filter by created date (to)"),
    db: AsyncSession = Depends(get_db)
):
    """List orders with pagination and optional filtering"""
    order_service = OrderService(db)
    
    # Convert date objects to datetime if provided
    from_date = datetime.combine(date_from, datetime.min.time()) if date_from else None
    to_date = datetime.combine(date_to, datetime.max.time()) if date_to else None
    
    try:
        result = await order_service.list_orders(
            skip=skip,
            limit=limit,
            status=order_status,
            code=code,
            customer_name=customer_name,
            handler_id=handler_id,
            date_from=from_date,
            date_to=to_date
        )
        
        # Debug log the warehouse_inventory values
        if result.get("data"):
            for order in result["data"]:
                if order.get("items"):
                    for item in order["items"]:
                        logging.info(f"Controller - Item {item['id']}: warehouse_inventory={repr(item.get('warehouse_inventory'))}")
        
        return result
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@order_router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get order details by ID"""
    order_service = OrderService(db)
    try:
        order = await order_service.get_order_by_id(order_id)
        if not order:
            raise HTTPException(status_code=http_status.HTTP_404_NOT_FOUND, detail=f"Order with ID {order_id} not found")
        return order
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

@order_router.patch("/line-items/{line_item_id}/warehouse-inventory", response_model=UpdateLineItemWarehouseInventoryResponse)
async def update_line_item_warehouse_inventory(
    line_item_id: str,
    request: UpdateLineItemWarehouseInventoryRequest,
    db: AsyncSession = Depends(get_db)
):
    """Update warehouse inventory for a line item"""
    order_service = OrderService(db)
    try:
        result = await order_service.update_line_item_warehouse_inventory(
            line_item_id=line_item_id,
            warehouse_inventory=request.warehouse_inventory
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
