from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from api.modules.warehouse.repository.warehouse_repository import WarehouseRepository
from api.modules.warehouse.entity.warehouse_entity import Warehouse
from api.modules.warehouse.dto.input import WarehouseCreate, WarehouseUpdate
from fastapi import HTTPException

class WarehouseService:
    """Service for warehouse business logic"""
    
    def __init__(self, db: AsyncSession):
        self.repository = WarehouseRepository(db)
    
    async def create_warehouse(self, warehouse_data: WarehouseCreate) -> Warehouse:
        """Create a new warehouse"""
        # Check if warehouse with same location exists
        existing_warehouse = await self.repository.get_by_location(warehouse_data.location)
        if existing_warehouse:
            raise HTTPException(status_code=400, detail="Đã tồn tại kho với vị trí này")
        
        warehouse_dict = warehouse_data.model_dump()
        return await self.repository.create(warehouse_dict)
    
    async def get_by_id(self, warehouse_id: str) -> Optional[Warehouse]:
        """Get warehouse by ID"""
        return await self.repository.get_by_id(warehouse_id)
    
    async def get_all_warehouses(self, skip: int = 0, limit: int = 100) -> List[Warehouse]:
        """Get all warehouses"""
        return await self.repository.get_all(skip, limit)
    
    async def count_all_warehouses(self) -> int:
        """Count all warehouses"""
        return await self.repository.count_all()
    
    async def update_warehouse(self, warehouse_id: str, warehouse_data: WarehouseUpdate) -> Optional[Warehouse]:
        """Update a warehouse"""
        # Get existing warehouse
        existing_warehouse = await self.repository.get_by_id(warehouse_id)
        if not existing_warehouse:
            return None
        
        # Filter out None values
        update_data = {k: v for k, v in warehouse_data.model_dump().items() if v is not None}
        
        # Perform update
        if update_data:
            return await self.repository.update(warehouse_id, update_data)
        
        return existing_warehouse
    
    async def delete_warehouse(self, warehouse_id: str) -> bool:
        """Delete a warehouse"""
        return await self.repository.delete(warehouse_id)
