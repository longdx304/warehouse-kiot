from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import exists
from uuid import uuid4

from api.modules.order.entity.order_entity import Order
from api.modules.order.entity.line_item_entity import LineItem
from api.modules.warehouse_inventory.entity.warehouse_inventory_entity import WarehouseInventory
from api.utils.id_generator import generate_id, Prefix

class OrderRepository:
    """Repository for order operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def find_by_id(self, id: str) -> Optional[Order]:
        """Find an order by its id"""
        query = select(Order).where(Order.id == id)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def exists_by_id(self, id: str) -> bool:
        """Check if an order exists by its id"""
        query = select(exists().where(Order.id == id))
        result = await self.db.execute(query)
        return result.scalar()
    
    async def create_order(self, order_data: dict) -> Order:
        """Create a new order"""
        # Id from KiotViet - convert to string
        order_id = str(order_data["id"])
        order_code = order_data["code"]
        # Extract line items from order data
        order_details = order_data.pop("orderDetails", [])
        
        # Create order instance
        order = Order(
            id=order_id,
            code=order_code,
            customer_name=order_data.get("customerName"),
            status=order_data["status"],
            status_value=order_data.get("statusValue")
        )
        
        self.db.add(order)
        await self.db.flush()
        
        # Create line items
        for detail in order_details:
            line_item = await self._create_line_item(order.id, detail)
            self.db.add(line_item)
        
        return order
    
    async def _create_line_item(self, order_id: str, detail_data: dict) -> LineItem:
        """Create a line item and try to link with warehouse inventory"""
        line_item_id = generate_id(Prefix.LINE_ITEM)
        
        # Try to find matching warehouse inventory
        product_code = detail_data["productCode"]
        query = select(WarehouseInventory).where(WarehouseInventory.sku == product_code)
        result = await self.db.execute(query)
        warehouse_inventory = result.scalars().first()
        
        line_item = LineItem(
            id=line_item_id,
            order_id=order_id,
            product_code=product_code,
            product_name=detail_data["productName"],
            quantity=detail_data["quantity"],
            warehouse_inventory=warehouse_inventory.id if warehouse_inventory else None
        )
        
        return line_item
        
    async def update_order_handler(self, order_id: str, handler_id: str) -> Optional[Order]:
        """Update the handler for an order"""
        query = select(Order).where(Order.id == order_id)
        result = await self.db.execute(query)
        order = result.scalars().first()
        
        if order:
            order.handler_id = handler_id
            from datetime import datetime
            order.handler_at = datetime.utcnow()
            await self.db.flush()
            
        return order
        
    async def remove_order_handler(self, order_id: str) -> Optional[Order]:
        """Remove the handler from an order"""
        query = select(Order).where(Order.id == order_id)
        result = await self.db.execute(query)
        order = result.scalars().first()
        
        if order:
            order.handler_id = None
            order.handler_at = None
            await self.db.flush()
            
        return order 