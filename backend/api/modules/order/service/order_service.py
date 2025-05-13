import json
from datetime import datetime
from typing import Dict, Any, List, Optional, Union
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import asyncio

from api.modules.order.repository.order_repository import OrderRepository
from api.modules.order.entity.order_entity import Order
from api.modules.order.entity.line_item_entity import LineItem
from api.modules.warehouse_inventory.service.warehouse_inventory_service import WarehouseInventoryService
from api.modules.warehouse_inventory.dto.input import WarehouseInventoryCreate, WarehouseInventoryUpdate
from api.modules.item_unit.service.item_unit_service import ItemUnitService
from fastapi import HTTPException
from core.exceptions import NotFoundException
from api.utils.id_generator import generate_id, Prefix

class OrderService:
    """Service for order operations with inventory management"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repository = OrderRepository(db)
        self.warehouse_inventory_service = WarehouseInventoryService(db)
        self.item_unit_service = ItemUnitService(db)
    
    async def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create order and handle inventory allocation
        
        1. Retrieve unit by ID to get conversion rate
        2. Calculate inventory quantity needed
        3. Retrieve warehouse inventory
        4. Update or create inventory entry based on unit match
        5. Update line item with warehouse quantity
        """
        # Initialize services for transaction
        warehouse_inventory_service_tx = self.warehouse_inventory_service
        
        # Use self for LineItemService (it's defined in this file at the bottom)
        line_item_service_tx = LineItemService(self.db)
        
        # Retrieve unit by ID to get conversion rate
        retrieved_unit = await self.item_unit_service.retrieve(data.get("unit_id"))
        print(f"retrieved_unit: {retrieved_unit}")
        if not retrieved_unit:
            raise NotFoundException(f"Unit with ID {data.get('unit_id')} not found")
        
        # Calculate inventory quantity needed based on unit conversion
        inventory_quantity = data.get("quantity", 0) * retrieved_unit.quantity
        
        # Retrieve warehouse inventory
        warehouse_inventory = await warehouse_inventory_service_tx.retrieve_by_sku(
            data.get("warehouse_id"), 
            data.get("sku")
        )
        
        if not warehouse_inventory:
            # Create new inventory entry if doesn't exist
            await warehouse_inventory_service_tx.create({
                "id": generate_id(Prefix.WAREHOUSE_INVENTORY),
                "warehouse_id": data.get("warehouse_id"),
                "unit_id": data.get("unit_id"),
                "sku": data.get("sku"),
                "quantity": inventory_quantity
            })
        else:
            # Update existing inventory entry based on unit match
            if warehouse_inventory.unit.id != data.get("unit_id"):
                # If units don't match, create a new variant with the different unit
                await warehouse_inventory_service_tx.create_unit_with_variant({
                    "warehouse_id": warehouse_inventory.warehouse_id,
                    "unit_id": data.get("unit_id"),
                    "sku": data.get("sku"),
                    "quantity": inventory_quantity
                })
            else:
                # Same unit, just update quantity
                await warehouse_inventory_service_tx.update(warehouse_inventory.id, {
                    "quantity": warehouse_inventory.quantity + inventory_quantity
                })
        
        # Update line item with warehouse quantity
        line_item = await line_item_service_tx.retrieve(data.get("line_item_id"))
        if not line_item:
            raise NotFoundException(f"Line item with ID {data.get('line_item_id')} not found")
        
        # Update warehouse quantity based on operation type (inbound/outbound)
        # Check if warehouse_inventory is None or being reset
        if line_item.warehouse_inventory is None or data.get("reset_inventory", False):
            # Reset mode - just set to the current inventory_quantity
            if data.get("type") == "INBOUND":
                updated_warehouse_inventory = inventory_quantity
            else:
                updated_warehouse_inventory = -inventory_quantity
        else:
            # Normal update mode
            updated_warehouse_inventory = (
                line_item.warehouse_inventory + inventory_quantity 
                if data.get("type") == "INBOUND" 
                else line_item.warehouse_inventory - inventory_quantity
            )
        
        await line_item_service_tx.update(data.get("line_item_id"), {
            "warehouse_inventory": updated_warehouse_inventory
        })
        
        return {
            "success": True,
            "message": f"Order created and inventory updated successfully",
            "inventory_quantity": inventory_quantity,
            "warehouse_inventory": updated_warehouse_inventory
        }
    
    async def remove(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Remove inventory allocation for an order
        
        1. Retrieve unit by ID to get conversion rate
        2. Calculate inventory quantity to remove
        3. Retrieve warehouse inventory
        4. Update inventory quantity or delete if zero
        """
        # Initialize services for transaction
        warehouse_inventory_service = self.warehouse_inventory_service
        
        # Retrieve unit by ID
        retrieved_unit = await self.item_unit_service.retrieve(data.get("unit_id"))
        if not retrieved_unit:
            raise NotFoundException(f"Unit with ID {data.get('unit_id')} not found")
        
        # Calculate inventory quantity to remove
        inventory_quantity = data.get("quantity", 0) * retrieved_unit.quantity
        
        # Retrieve warehouse inventory
        warehouse_inventory = await warehouse_inventory_service.retrieve_by_sku(
            data.get("warehouse_id"), 
            data.get("sku")
        )
        if not warehouse_inventory:
            raise NotFoundException(f"Warehouse inventory not found for SKU {data.get('sku')}")
        
        # Update or delete inventory based on remaining quantity
        if warehouse_inventory.quantity - inventory_quantity > 0:
            # If there's remaining inventory, update the quantity
            await warehouse_inventory_service.update(warehouse_inventory.id, {
                "quantity": warehouse_inventory.quantity - inventory_quantity
            })
        else:
            # If no inventory remains, delete the entry
            await warehouse_inventory_service.delete(warehouse_inventory.id)
        return {
            "success": True,
            "message": f"Inventory allocation removed successfully",
            "inventory_quantity": inventory_quantity
        }

    async def list_orders(
        self,
        skip: int = 0,
        limit: int = 20,
        status: Optional[int] = None,
        code: Optional[str] = None,
        customer_name: Optional[str] = None,
        handler_id: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        List orders with pagination and optional filtering
        
        Args:
            skip: Number of records to skip
            limit: Maximum number of records to return
            status: Filter by order status
            code: Filter by order code (partial match)
            customer_name: Filter by customer name (partial match)
            handler_id: Filter by handler ID
            date_from: Filter by created date (from)
            date_to: Filter by created date (to)
            
        Returns:
            Dict with total count, skip, limit, and list of orders
        """
        # Prepare filter parameters
        filter_params = {}
        if status is not None:
            filter_params["status"] = status
        if code:
            filter_params["code"] = code
        if customer_name:
            filter_params["customer_name"] = customer_name
        if handler_id:
            filter_params["handler_id"] = handler_id
        if date_from:
            filter_params["date_from"] = date_from
        if date_to:
            filter_params["date_to"] = date_to
        
        try:
            # Get orders with pagination
            orders = await self.repository.list_orders(skip, limit, filter_params)
            
            # Get total count
            total = await self.repository.count_orders(filter_params)
            
            # Manually fetch line items for each order to avoid async context issues
            order_list = []
            for order in orders:
                # Convert order to dict first
                order_dict = {
                    "id": str(order.id),
                    "code": order.code,
                    "customer_name": order.customer_name,
                    "status": order.status,
                    "status_value": order.status_value,
                    "handler_id": order.handler_id,
                    "handler_at": order.handler_at,
                    "created_at": order.created_at,
                    "updated_at": order.updated_at,
                    "items": []  
                }
                
                # Fetch line items separately using direct query
                line_items_query = select(LineItem).where(LineItem.order_id == order.id)
                line_items_result = await self.db.execute(line_items_query)
                line_items = line_items_result.scalars().all()
                
                # Add line items to order dict
                for item in line_items:
                    # Debug print to see what's coming from the database
                    import logging
                    # Detailed debugging for warehouse_inventory field
                    logging.info(f"LineItem {item.id}: product_code={item.product_code}")
                    logging.info(f"LineItem {item.id}: warehouse_inventory={repr(item.warehouse_inventory)}, type={type(item.warehouse_inventory)}")
                    
                    # Process warehouse_inventory value - make sure it's properly retained
                    warehouse_inventory_value = item.warehouse_inventory
                    
                    # Create item dict with all fields
                    item_dict = {
                        "id": str(item.id),
                        "order_id": str(order.id),
                        "product_code": item.product_code,
                        "product_name": item.product_name,
                        "quantity": item.quantity,
                        "warehouse_inventory": warehouse_inventory_value,
                        "created_at": item.created_at,
                        "updated_at": item.updated_at
                    }
                    
                    logging.info(f"Item dict warehouse_inventory={repr(item_dict['warehouse_inventory'])}")
                    order_dict["items"].append(item_dict)
                
                order_list.append(order_dict)
            
            # Prepare result
            result = {
                "total": total,
                "skip": skip,
                "limit": limit,
                "data": order_list
            }
            
            return result
        except Exception as e:
            # Log the error for debugging
            import logging
            logging.error(f"Error in list_orders: {str(e)}")
            raise e
        
    async def get_order_by_id(self, order_id: str) -> Optional[Dict[str, Any]]:
        """
        Get an order by ID with its line items
        
        Args:
            order_id: Order ID
            
        Returns:
            Order with line items or None if not found
        """
        # Convert order_id to int if it's numeric
        try:
            if order_id.isdigit():
                order_id = int(order_id)
        except (ValueError, AttributeError):
            # If conversion fails, leave it as is (might be a UUID string)
            pass
        
        import logging
        logging.info(f"Getting order by ID: {order_id}, type: {type(order_id)}")
        
        order = await self.repository.find_by_id(order_id)
        
        if not order:
            return None
        
        # Convert line items to dicts
        line_items = []
        for item in order.items:
            # Debug logging for warehouse_inventory
            logging.info(f"Get order - LineItem {item.id}: product_code={item.product_code}")
            logging.info(f"Get order - LineItem {item.id}: warehouse_inventory={repr(item.warehouse_inventory)}, type={type(item.warehouse_inventory)}")
            
            # Process warehouse_inventory value
            warehouse_inventory_value = item.warehouse_inventory
            
            item_dict = {
                "id": str(item.id),
                "order_id": str(order.id),
                "product_code": item.product_code,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "warehouse_inventory": warehouse_inventory_value,
                "created_at": item.created_at,
                "updated_at": item.updated_at
            }
            
            logging.info(f"Get order - Item dict warehouse_inventory={repr(item_dict['warehouse_inventory'])}")
            line_items.append(item_dict)
        
        # Convert order to dict
        return {
            "id": str(order.id),
            "code": order.code,
            "customer_name": order.customer_name,
            "status": order.status,
            "status_value": order.status_value,
            "handler_id": order.handler_id,
            "handler_at": order.handler_at,
            "created_at": order.created_at,
            "updated_at": order.updated_at,
            "items": line_items
        }

    async def update_line_item_warehouse_inventory(self, line_item_id: str, warehouse_inventory: int) -> Dict[str, Any]:
        """
        Update the warehouse inventory value for a line item
        
        Args:
            line_item_id: Line item ID
            warehouse_inventory: New warehouse inventory value
            
        Returns:
            Updated line item data or error message
        """
        try:
            # Initialize line item service
            line_item_service = LineItemService(self.db)
            
            # Retrieve the line item
            line_item = await line_item_service.retrieve(line_item_id)
            if not line_item:
                return {
                    "success": False,
                    "message": f"Line item with ID {line_item_id} not found"
                }
            
            # Log the update operation
            import logging
            logging.info(f"Updating warehouse_inventory for line item {line_item_id} from {line_item.warehouse_inventory} to {warehouse_inventory}")
            
            # Update the line item
            updated_line_item = await line_item_service.update(line_item_id, {
                "warehouse_inventory": warehouse_inventory
            })
            
            if not updated_line_item:
                return {
                    "success": False,
                    "message": "Failed to update line item"
                }
            
            # Convert line item to dict for response
            item_dict = {
                "id": str(updated_line_item.id),
                "order_id": str(updated_line_item.order_id),
                "product_code": updated_line_item.product_code,
                "product_name": updated_line_item.product_name,
                "quantity": updated_line_item.quantity,
                "warehouse_inventory": updated_line_item.warehouse_inventory,
                "created_at": updated_line_item.created_at,
                "updated_at": updated_line_item.updated_at
            }
            
            return {
                "success": True,
                "message": "Line item warehouse inventory updated successfully",
                "data": item_dict
            }
        except Exception as e:
            import logging
            logging.error(f"Error updating line item warehouse inventory: {str(e)}")
            return {
                "success": False,
                "message": f"Error updating warehouse inventory: {str(e)}"
            }


class LineItemService:
    """Service for line item operations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def retrieve(self, line_item_id: Union[str, int]) -> Optional[LineItem]:
        """Retrieve a line item by ID"""
        try:
            import logging
            logging.info(f"Retrieving line item by ID: {line_item_id}, type: {type(line_item_id)}")
            
            query = select(LineItem).where(LineItem.id == line_item_id)
            result = await self.db.execute(query)
            return result.scalars().first()
        except Exception as e:
            import logging
            logging.error(f"Error retrieving line item {line_item_id}: {str(e)}")
            raise e
    
    async def update(self, line_item_id: Union[str, int], data: Dict[str, Any]) -> Optional[LineItem]:
        """Update a line item"""
        try:
            import logging
            logging.info(f"Updating line item: {line_item_id}, data: {data}")
            
            line_item = await self.retrieve(line_item_id)
            if not line_item:
                return None
            
            # Update fields
            for key, value in data.items():
                if hasattr(line_item, key):
                    setattr(line_item, key, value)
            
            await self.db.flush()
            return line_item
        except Exception as e:
            import logging
            logging.error(f"Error updating line item {line_item_id}: {str(e)}")
            raise e 