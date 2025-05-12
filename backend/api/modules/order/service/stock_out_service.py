from typing import Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from core import kiotviet_client
from api.modules.order.dto.input import StockOutRequest, StockOutResponse
from api.modules.order.repository.order_repository import OrderRepository

class StockOutService:
    """Service for stock out business logic"""
    def __init__(self, db: AsyncSession = None):
        self.db = db
        if db:
            self.repository = OrderRepository(db)
    
    async def get_stock_out(self) -> StockOutResponse:
        """Get stock out"""
        orders = await kiotviet_client.get_orders()
        return StockOutResponse(**orders)
    
    async def assign_order(self, order_id: str, user_id: str) -> dict:
        """
        Assign an order to a user
        
        1. Fetch order details from KiotViet
        2. Check if order exists in the database
        3. Create order and line items if not exists
        4. Assign the order to the user
        """
        # Ensure order_id is a string
        order_id = str(order_id)
        
        # Get order details from KiotViet
        order_details = await kiotviet_client.get_order_by_id(order_id)
        
        if not order_details:
            raise ValueError(f"Order with id {order_id} not found in KiotViet")
        
        # Check if order exists in database
        order = await self.repository.find_by_id(order_id)
        
        if not order:
            # Create order in database
            order = await self.repository.create_order(order_details)
        
        # Assign order to user
        order = await self.repository.update_order_handler(order.id, user_id)
        
        return {
            "success": True,
            "message": f"Order {order_id} assigned successfully",
            "order_id": order.id
        }
    
    async def unassign_order(self, order_id: str) -> dict:
        """
        Unassign an order from a user
        
        1. Find order in database
        2. Remove handler information
        """
        # Ensure order_id is a string
        order_id = str(order_id)
        
        # Find order in database
        order = await self.repository.find_by_id(order_id)
        
        if not order:
            raise ValueError(f"Order with id {order_id} not found in database")
        
        # Remove handler
        order = await self.repository.remove_order_handler(order.id)
        
        return {
            "success": True,
            "message": f"Order {order_id} unassigned successfully",
            "order_id": order.id
        }