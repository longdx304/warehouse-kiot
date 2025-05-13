from typing import List, Optional, Union
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import exists
from uuid import uuid4
from sqlalchemy.orm import selectinload

from api.modules.order.entity.order_entity import Order
from api.modules.order.entity.line_item_entity import LineItem
from api.modules.warehouse_inventory.entity.warehouse_inventory_entity import WarehouseInventory
from api.utils.id_generator import generate_id, Prefix

class OrderRepository:
    """Repository for order operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def find_by_id(self, id: Union[int, str]) -> Optional[Order]:
        """Find an order by its id"""
        from sqlalchemy.orm import selectinload
        import logging
        
        # Ensure the id is the correct type for the database column
        # If it's a string and looks like a number, convert it to int
        if isinstance(id, str) and id.isdigit():
            id = int(id)
            
        logging.info(f"Finding order by ID: {id}, type: {type(id)}")
        
        query = select(Order).options(selectinload(Order.items)).where(Order.id == id)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def exists_by_id(self, id: Union[int, str]) -> bool:
        """Check if an order exists by its id"""
        # Ensure the id is the correct type for the database column
        if isinstance(id, str) and id.isdigit():
            id = int(id)
            
        query = select(exists().where(Order.id == id))
        result = await self.db.execute(query)
        return result.scalar()
    
    async def create_order(self, order_data: dict) -> Order:
        """Create a new order"""
        # Id from KiotViet - convert to integer
        order_id = int(order_data["id"])
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
    
    async def _create_line_item(self, order_id: int, detail_data: dict) -> LineItem:
        """Create a line item and try to link with warehouse inventory"""
        line_item_id = generate_id(Prefix.LINE_ITEM)
        
        # Try to find matching warehouse inventory
        product_code = detail_data["productCode"]
        query = select(WarehouseInventory).where(WarehouseInventory.sku == product_code)
        result = await self.db.execute(query)
        warehouse_inventory = result.scalars().first()
        
        # Determine the warehouse_inventory value
        warehouse_inventory_value = None
        if warehouse_inventory:
            # Store the inventory quantity value, not the ID
            warehouse_inventory_value = warehouse_inventory.quantity
            
            # Log the value for debugging
            import logging
            logging.info(f"Setting warehouse_inventory for {product_code} to {warehouse_inventory_value}")
        
        line_item = LineItem(
            id=line_item_id,
            order_id=order_id,
            product_code=product_code,
            product_name=detail_data["productName"],
            quantity=detail_data["quantity"],
            warehouse_inventory=warehouse_inventory_value
        )
        
        return line_item
        
    async def update_order_handler(self, order_id: Union[int, str], handler_id: str) -> Optional[Order]:
        """Update the handler for an order"""
        # Ensure the order_id is the correct type for the database column
        if isinstance(order_id, str) and order_id.isdigit():
            order_id = int(order_id)
            
        query = select(Order).where(Order.id == order_id)
        result = await self.db.execute(query)
        order = result.scalars().first()
        
        if order:
            order.handler_id = handler_id
            from datetime import datetime
            order.handler_at = datetime.utcnow()
            await self.db.flush()
            
        return order
        
    async def remove_order_handler(self, order_id: Union[int, str]) -> Optional[Order]:
        """Remove the handler from an order"""
        # Ensure the order_id is the correct type for the database column
        if isinstance(order_id, str) and order_id.isdigit():
            order_id = int(order_id)
            
        query = select(Order).where(Order.id == order_id)
        result = await self.db.execute(query)
        order = result.scalars().first()
        
        if order:
            order.handler_id = None
            order.handler_at = None
            await self.db.flush()
            
        return order
    
    async def list_orders(self, skip: int = 0, limit: int = 20, filter_params: dict = None) -> List[Order]:
        """List orders with pagination and optional filtering"""
        from sqlalchemy.orm import selectinload
        
        # Use selectinload to eagerly load relationships
        query = select(Order).options(selectinload(Order.items)).order_by(Order.created_at.desc())
        
        if filter_params:
            # Apply filters
            if filter_params.get("status") is not None:
                query = query.filter(Order.status == filter_params["status"])
            
            if filter_params.get("code"):
                query = query.filter(Order.code.ilike(f"%{filter_params['code']}%"))
            
            if filter_params.get("customer_name"):
                query = query.filter(Order.customer_name.ilike(f"%{filter_params['customer_name']}%"))
            
            if filter_params.get("handler_id"):
                query = query.filter(Order.handler_id == filter_params["handler_id"])
            
            # Date range filtering
            if filter_params.get("date_from"):
                query = query.filter(Order.created_at >= filter_params["date_from"])
            
            if filter_params.get("date_to"):
                query = query.filter(Order.created_at <= filter_params["date_to"])
        
        # Apply pagination
        query = query.offset(skip).limit(limit)
        
        # Execute the query
        result = await self.db.execute(query)
        return list(result.scalars().all())  
        
    async def count_orders(self, filter_params: dict = None) -> int:
        """Count orders with optional filtering"""
        from sqlalchemy import func
        
        query = select(func.count(Order.id))
        
        if filter_params:
            # Apply filters
            if filter_params.get("status") is not None:
                query = query.filter(Order.status == filter_params["status"])
            
            if filter_params.get("code"):
                query = query.filter(Order.code.ilike(f"%{filter_params['code']}%"))
            
            if filter_params.get("customer_name"):
                query = query.filter(Order.customer_name.ilike(f"%{filter_params['customer_name']}%"))
            
            if filter_params.get("handler_id"):
                query = query.filter(Order.handler_id == filter_params["handler_id"])
            
            # Date range filtering
            if filter_params.get("date_from"):
                query = query.filter(Order.created_at >= filter_params["date_from"])
            
            if filter_params.get("date_to"):
                query = query.filter(Order.created_at <= filter_params["date_to"])
        
        # Execute the query and extract the scalar result immediately
        result = await self.db.execute(query)
        count = result.scalar()
        return count if count is not None else 0

    