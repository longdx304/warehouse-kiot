from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from api.modules.warehouse_inventory.repository.warehouse_inventory_repo import WarehouseInventoryRepository
from api.modules.warehouse_inventory.entity.warehouse_inventory_entity import WarehouseInventory
from api.modules.warehouse_inventory.dto.input import WarehouseInventoryCreate, WarehouseInventoryUpdate
from api.modules.warehouse.service.warehouse_service import WarehouseService
from api.modules.item_unit.service.item_unit_service import ItemUnitService

class WarehouseInventoryService:
    """Service for warehouse inventory business logic"""
    
    def __init__(self, db: AsyncSession):
        self.repository = WarehouseInventoryRepository(db)
        self.warehouse_service = WarehouseService(db)
        self.item_unit_service = ItemUnitService(db)
    
    async def create_inventory(self, inventory_data: WarehouseInventoryCreate) -> WarehouseInventory:
        """Create a new inventory item"""
        # Check if warehouse exists
        warehouse = await self.warehouse_service.get_by_id(inventory_data.warehouse_id)
        if not warehouse:
            raise ValueError(f"Warehouse with ID {inventory_data.warehouse_id} not found")
        
        # Check if unit exists
        unit = await self.item_unit_service.get_by_id(inventory_data.unit_id)
        if not unit:
            raise ValueError(f"Unit with ID {inventory_data.unit_id} not found")
        
        # Create inventory item
        inventory_dict = inventory_data.model_dump()
        return await self.repository.create(inventory_dict)
      
    async def update_inventory(self, inventory_id: str, inventory_data: WarehouseInventoryUpdate) -> Optional[WarehouseInventory]:
        """Update an inventory item"""
        # Check if inventory exists
        inventory = await self.repository.get_by_id(inventory_id)
        if not inventory:
            raise ValueError(f"Inventory with ID {inventory_id} not found")
        
        # Update inventory item
        inventory_dict = inventory_data.model_dump()
        return await self.repository.update(inventory_id, inventory_dict)
        
    async def delete_inventory(self, inventory_id: str) -> bool:
        """Delete an inventory item"""
        return await self.repository.delete(inventory_id)
      
    async def get_inventory_by_id(self, inventory_id: str) -> Optional[WarehouseInventory]:
        """Get inventory item by ID"""
        return await self.repository.get_by_id(inventory_id)
        
    async def get_inventory_by_warehouse_and_sku(self, warehouse_id: str, sku: str) -> Optional[WarehouseInventory]:
        """Get inventory item by warehouse ID and SKU"""
        return await self.repository.get_by_warehouse_and_sku(warehouse_id, sku)
        
    async def get_inventory_by_warehouse(self, warehouse_id: str) -> List[WarehouseInventory]:
        """Get all inventory items for a warehouse"""
        return await self.repository.get_by_warehouse(warehouse_id)
        
    async def get_all_inventory(self, skip: int = 0, limit: int = 100) -> List[WarehouseInventory]:
        """Get all inventory items with pagination"""
        return await self.repository.get_all(skip, limit)
        