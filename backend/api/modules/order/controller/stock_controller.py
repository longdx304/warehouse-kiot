from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, List

from api.database import get_db
from api.modules.order.service.stock_out_service import StockOutService
from api.modules.order.dto.input import (
    StockOutRequest, 
    StockOutResponse, 
    AssignOrderRequest, 
    UnassignOrderRequest,
    OrderActionResponse
)

stock_out_router = APIRouter()

@stock_out_router.get("/", response_model=None)
async def get_stock_out(
    db: AsyncSession = Depends(get_db)
):
    """Get stock out orders from KiotViet"""
    stock_out_service = StockOutService()
    try:
        stock_out = await stock_out_service.get_stock_out()
        return stock_out
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@stock_out_router.post("/assign", response_model=OrderActionResponse)
async def assign_order(
    request: AssignOrderRequest,
    db: AsyncSession = Depends(get_db)
):
    """Assign an order to a user"""
    stock_out_service = StockOutService(db)
    try:
        result = await stock_out_service.assign_order(
            order_id=request.order_id,
            user_id=request.user_id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@stock_out_router.post("/unassign", response_model=OrderActionResponse)
async def unassign_order(
    request: UnassignOrderRequest,
    db: AsyncSession = Depends(get_db)
):
    """Unassign an order from a user"""
    stock_out_service = StockOutService(db)
    try:
        result = await stock_out_service.unassign_order(
            order_id=request.order_id
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
