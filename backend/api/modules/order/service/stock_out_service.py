from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession
from core import kiotviet_client
from api.modules.order.dto.input import StockOutRequest, StockOutResponse
class StockOutService:
    """Service for stock out business logic"""
    def __init__(self):
        # self.repository = StockOutRepository(db)
        pass
    
    async def get_stock_out(self) -> StockOutResponse:
        """Get stock out"""
        orders = await kiotviet_client.get_orders()
        return StockOutResponse(**orders)