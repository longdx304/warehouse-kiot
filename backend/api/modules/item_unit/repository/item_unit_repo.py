from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from typing import List, Optional

from api.modules.item_unit.entity.item_unit_entity import ItemUnit
from api.utils.id_generator import generate_id, Prefix

class ItemUnitRepository:
    """Repository for item unit data access"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create(self, item_unit_data: dict) -> ItemUnit:
        """Create a new item unit"""
        # Generate ID with proper prefix
        item_unit_data["id"] = generate_id(Prefix.ITEM_UNIT)
        
        # Create item unit instance
        item_unit = ItemUnit(**item_unit_data)
        
        # Add to database
        self.db.add(item_unit)
        await self.db.flush()
        
        return item_unit
    
    async def get_by_id(self, item_unit_id: str) -> Optional[ItemUnit]:
        """Get item unit by ID"""
        query = select(ItemUnit).where(ItemUnit.id == item_unit_id)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def get_by_unit(self, unit: str) -> Optional[ItemUnit]:
        """Get item unit by unit name"""
        query = select(ItemUnit).where(ItemUnit.unit == unit)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def get_all(self, skip: int = 0, limit: int = 100) -> List[ItemUnit]:
        """Get all item units with pagination"""
        query = select(ItemUnit).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return result.scalars().all()
    
    async def update(self, item_unit_id: str, item_unit_data: dict) -> Optional[ItemUnit]:
        """Update an item unit"""
        query = update(ItemUnit).where(ItemUnit.id == item_unit_id).values(**item_unit_data).returning(ItemUnit)
        result = await self.db.execute(query)
        return result.scalars().first()
    
    async def delete(self, item_unit_id: str) -> bool:
        """Delete an item unit"""
        query = delete(ItemUnit).where(ItemUnit.id == item_unit_id)
        result = await self.db.execute(query)
        return result.rowcount > 0
      