from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List, Optional

from api.modules.warehouse_inventory.entity.warehouse_inventory_entity import WarehouseInventory
from api.utils.id_generator import generate_id, Prefix

class WarehouseInventoryRepository:
    """Repository for warehouse inventory data access"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, inventory_data: dict) -> WarehouseInventory:
        """Create a new inventory item"""
        # Generate ID with proper prefix
        inventory_data["id"] = generate_id(Prefix.WAREHOUSE_INVENTORY)
        
        # Create inventory instance
        inventory = WarehouseInventory(**inventory_data)
        
        # Add to database
        self.db.add(inventory)
        await self.db.flush()
        
        return inventory
    
    async def get_by_id(self, inventory_id: str) -> Optional[WarehouseInventory]:
        """Get inventory item by ID"""
        query = select(WarehouseInventory).where(WarehouseInventory.id == inventory_id)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def get_by_warehouse_and_sku(self, warehouse_id: str, sku: str) -> Optional[WarehouseInventory]:
        """Get inventory item by warehouse ID and SKU"""
        query = select(WarehouseInventory).where(
            WarehouseInventory.warehouse_id == warehouse_id,
            WarehouseInventory.sku == sku
        )
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def get_by_warehouse(self, warehouse_id: str) -> List[WarehouseInventory]:
        """Get all inventory items for a warehouse"""
        query = select(WarehouseInventory).where(WarehouseInventory.warehouse_id == warehouse_id)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[WarehouseInventory]:
        """Get all inventory items with pagination"""
        query = select(WarehouseInventory).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def update(self, inventory_id: str, inventory_data: dict) -> Optional[WarehouseInventory]:
        """Update an inventory item"""
        query = update(WarehouseInventory).where(WarehouseInventory.id == inventory_id).values(**inventory_data).returning(WarehouseInventory)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def delete(self, inventory_id: str) -> bool:
        """Delete an inventory item"""
        query = delete(WarehouseInventory).where(WarehouseInventory.id == inventory_id)
        result = await self.db.execute(query)
        return result.rowcount > 0
