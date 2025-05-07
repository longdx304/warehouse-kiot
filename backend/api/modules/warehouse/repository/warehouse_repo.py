from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from typing import List, Optional

from api.modules.warehouse.entity.warehouse_entity import Warehouse
from api.utils.id_generator import generate_id, Prefix

class WarehouseRepository:
    """Repository for warehouse data access"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_by_location(self, location: str) -> Optional[Warehouse]:
        """Get warehouse by location"""
        query = select(Warehouse).where(Warehouse.location == location)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def create(self, warehouse_data: dict) -> Warehouse:
        """Create a new warehouse"""
        # Generate ID with proper prefix
        warehouse_data["id"] = generate_id(Prefix.WAREHOUSE)
        
        # Create warehouse instance
        warehouse = Warehouse(**warehouse_data)
        
        # Add to database
        self.db.add(warehouse)
        await self.db.flush()
        
        return warehouse
    
    async def get_by_id(self, warehouse_id: str) -> Optional[Warehouse]:
        """Get warehouse by ID"""
        query = select(Warehouse).where(Warehouse.id == warehouse_id)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[Warehouse]:
        """Get all warehouses with pagination"""
        query = select(Warehouse).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()

    async def count_all(self) -> int:
        """Count all warehouses"""
        query = select(func.count()).select_from(Warehouse)
        result = await self.db.execute(query)
        return result.scalar()
    
    async def update(self, warehouse_id: str, warehouse_data: dict) -> Optional[Warehouse]:
        """Update a warehouse"""
        query = update(Warehouse).where(Warehouse.id == warehouse_id).values(**warehouse_data).returning(Warehouse)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def delete(self, warehouse_id: str) -> bool:
        """Delete a warehouse"""
        query = delete(Warehouse).where(Warehouse.id == warehouse_id)
        result = await self.db.execute(query)
        return result.rowcount > 0
