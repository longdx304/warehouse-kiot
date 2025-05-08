from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from api.database import get_db
from api.modules.item_unit.service.item_unit_service import ItemUnitService
from api.modules.item_unit.dto.input import ItemUnitCreate, ItemUnitUpdate, ItemUnitResponse
from api.middlewares.auth.auth_bearer import get_current_user

router = APIRouter()

@router.post("/", response_model=ItemUnitResponse, status_code=status.HTTP_201_CREATED)
async def create_item_unit(
    item_unit_data: ItemUnitCreate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user)
):
    """Create a new item unit"""
    item_unit_service = ItemUnitService(db)
    try:
        item_unit = await item_unit_service.create_item_unit(item_unit_data)
        return item_unit
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{item_unit_id}", response_model=ItemUnitResponse)
async def get_item_unit(
    item_unit_id: str,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user)
):
    """Get item unit by ID"""
    item_unit_service = ItemUnitService(db)
    item_unit = await item_unit_service.get_by_id(item_unit_id)
    if not item_unit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item unit not found")
    return item_unit

@router.get("/", response_model=List[ItemUnitResponse])
async def get_all_item_units(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user)
):
    """Get all item units"""
    item_unit_service = ItemUnitService(db)
    item_units = await item_unit_service.get_all_item_units(skip, limit)
    return item_units

@router.put("/{item_unit_id}", response_model=ItemUnitResponse)
async def update_item_unit(
    item_unit_id: str,
    item_unit_data: ItemUnitUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user)
):
    """Update item unit"""
    item_unit_service = ItemUnitService(db)
    try:
        item_unit = await item_unit_service.update_item_unit(item_unit_id, item_unit_data)
        if not item_unit:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item unit not found")
        return item_unit
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.delete("/{item_unit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item_unit(
    item_unit_id: str,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user)
):
    """Delete item unit"""
    item_unit_service = ItemUnitService(db)
    success = await item_unit_service.delete_item_unit(item_unit_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item unit not found")
    return None
