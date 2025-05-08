from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Any, List

from api.database import get_db
from api.modules.order.service.stock_out_service import StockOutService
from api.modules.order.dto.input import StockOutRequest, StockOutResponse

stock_out_router = APIRouter()

@stock_out_router.get("/", response_model= None)
async def get_stock_out(
    db: AsyncSession = Depends(get_db)
):
    """Get stock out"""
    stock_out_service = StockOutService()
    try:
        stock_out = await stock_out_service.get_stock_out()
        return stock_out
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
