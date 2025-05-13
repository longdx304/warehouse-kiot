from typing import Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from core import kiotviet_client
from api.modules.order.dto.input import StockOutRequest, StockOutResponse
from api.modules.order.repository.order_repository import OrderRepository
from sqlalchemy.future import select
from api.modules.order.entity.order_entity import Order
import logging

logger = logging.getLogger(__name__)

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
    
    async def assign_order(self, order_id: int, user_id: str) -> dict:
        """
        Assign an order to a user
        
        1. Fetch order details from KiotViet
        2. Check if order exists in the database
        3. Create order and line items if not exists
        4. Assign the order to the user
        """
        # Ensure order_id is an integer
        order_id = int(order_id)
        
        # Get order details from KiotViet
        logger.info(f"Fetching order {order_id} from KiotViet")
        order_details = await kiotviet_client.get_order_by_id(order_id)
        
        if not order_details:
            logger.error(f"Order with id {order_id} not found in KiotViet")
            raise ValueError(f"Order with id {order_id} not found in KiotViet")
            
        logger.info(f"Order details retrieved: Code={order_details.get('code')}")
        
        # Check if order exists in database by internal ID
        order = None
        try:
            order = await self.repository.find_by_id(order_id)
        except Exception:
            logger.info(f"Order with id {order_id} not found in database")
            # Continue with code-based lookup
        
        if not order:
            # Check if order exists by code to avoid unique constraint violation
            order_code = order_details.get("code")
            logger.info(f"Looking up order by code: {order_code}")
            
            query = select(Order).where(Order.code == order_code)
            result = await self.db.execute(query)
            existing_order = result.scalars().first()
            
            if existing_order:
                # If order exists with same code but different ID, use the existing one
                logger.info(f"Found existing order with code {order_code} (ID: {existing_order.id})")
                order = existing_order
            else:
                # Create new order in database
                logger.info(f"Creating new order with code {order_code}")
                order = await self.repository.create_order(order_details)
                logger.info(f"Created order with ID: {order.id}")
        
        # Assign order to user
        logger.info(f"Assigning order {order.id} to user {user_id}")
        order = await self.repository.update_order_handler(order.id, user_id)
        
        return {
            "success": True,
            "message": f"Order {order_id} assigned successfully",
            "order_id": order.id,
            "kiotviet_id": order_id,
            "code": order.code
        }
    
    async def unassign_order(self, order_id: int) -> dict:
        """
        Unassign an order from a user
        
        1. Find order in database
        2. Remove handler information
        """
        # Ensure order_id is an integer
        order_id = int(order_id)
        
        # First try to find in database directly by ID
        order = None
        try:
            order = await self.repository.find_by_id(order_id)
        except Exception:
            logger.info(f"Order with id {order_id} not found in database")
        
        # If not found, try to get details from KiotViet and look up by code
        if not order:
            logger.info(f"Fetching order {order_id} from KiotViet for unassign")
            order_details = await kiotviet_client.get_order_by_id(order_id)
            
            if not order_details:
                logger.error(f"Order with id {order_id} not found in KiotViet")
                raise ValueError(f"Order with id {order_id} not found in KiotViet")
            
            # Try to find by code
            order_code = order_details.get("code")
            logger.info(f"Looking up order by code: {order_code}")
            
            query = select(Order).where(Order.code == order_code)
            result = await self.db.execute(query)
            order = result.scalars().first()
        
        if not order:
            logger.error(f"Order with id {order_id} not found in database")
            raise ValueError(f"Order with id {order_id} not found in database")
        
        # Remove handler
        logger.info(f"Removing handler from order {order.id}")
        order = await self.repository.remove_order_handler(order.id)
        
        return {
            "success": True,
            "message": f"Order {order_id} unassigned successfully",
            "order_id": order.id,
            "kiotviet_id": order_id,
            "code": order.code
        }
    
    