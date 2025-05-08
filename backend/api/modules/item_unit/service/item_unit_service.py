from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional

from api.modules.item_unit.repository.item_unit_repository import ItemUnitRepository
from api.modules.item_unit.entity.item_unit_entity import ItemUnit
from api.modules.item_unit.dto.input import ItemUnitCreate, ItemUnitUpdate
from core.error_handlers import add_error_handlers
from core.exceptions import NotFoundException, ValidationException

class ItemUnitService:
    """Service for item unit business logic"""
    
    def __init__(self, db: AsyncSession):
        self.repository = ItemUnitRepository(db)
    
    async def create_item_unit(self, item_unit_data: ItemUnitCreate) -> ItemUnit:
        """Create a new item unit"""
        # Check if unit already exists
        existing_unit = await self.repository.get_by_unit(item_unit_data.unit)
        if existing_unit:
            raise ValidationException(f"Unit '{item_unit_data.unit}' already exists")
        
        item_unit_dict = item_unit_data.model_dump()
        return await self.repository.create(item_unit_dict)
    
    async def get_by_id(self, item_unit_id: str) -> Optional[ItemUnit]:
        """Get item unit by ID"""
        return await self.repository.get_by_id(item_unit_id)
    
    async def get_all_item_units(self, skip: int = 0, limit: int = 100) -> List[ItemUnit]:
        """Get all item units"""
        return await self.repository.get_all(skip, limit)
    
    async def update_item_unit(self, item_unit_id: str, item_unit_data: ItemUnitUpdate) -> Optional[ItemUnit]:
        """Update an item unit"""
        # Get existing item unit
        existing_item_unit = await self.repository.get_by_id(item_unit_id)
        if not existing_item_unit:
            raise NotFoundException(f"Item unit with id {item_unit_id} not found")
        
        # Filter out None values
        update_data = {k: v for k, v in item_unit_data.model_dump().items() if v is not None}
        
        # Check unit uniqueness if unit is being updated
        if "unit" in update_data and update_data["unit"] != existing_item_unit.unit:
            unit_check = await self.repository.get_by_unit(update_data["unit"])
            if unit_check:
                raise ValidationException(f"Unit '{update_data['unit']}' already exists")
        
        # Perform update
        if update_data:
            return await self.repository.update(item_unit_id, update_data)
        
        return existing_item_unit
    
    async def delete_item_unit(self, item_unit_id: str) -> bool:
        """Delete an item unit"""
        return await self.repository.delete(item_unit_id)
