from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from api.database import get_db
from api.modules.warehouse_inventory.service.warehouse_inventory_service import WarehouseInventoryService
from api.modules.warehouse_inventory.dto.input import WarehouseInventoryCreate, WarehouseInventoryUpdate, WarehouseInventoryResponse
from api.middlewares.auth.auth_bearer import get_current_user, check_permission

router = APIRouter()  

@router.post("/", response_model=WarehouseInventoryResponse, status_code=status.HTTP_201_CREATED)
async def create_warehouse(
    warehouse_data: WarehouseInventoryCreate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(check_permission("warehouse"))
):
    """Create a new warehouse"""
    warehouse_service = WarehouseInventoryService(db)
    warehouse = await warehouse_service.create_inventory(warehouse_data)
    return warehouse

@router.get("/{warehouse_id}", response_model=WarehouseInventoryResponse)
async def get_warehouse(
    warehouse_id: str,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user)
):
    """Get warehouse by ID"""
    warehouse_service = WarehouseInventoryService(db)
    warehouse = await warehouse_service.get_by_id(warehouse_id)
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    return warehouse

@router.get("/", response_model=List[WarehouseInventoryResponse])
async def get_all_warehouses(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user)
):
    """Get all warehouses"""
    warehouse_service = WarehouseInventoryService(db)
    warehouses = await warehouse_service.get_all_inventory(skip, limit)
    return warehouses

@router.put("/{warehouse_id}", response_model=WarehouseInventoryResponse)
async def update_warehouse(
    warehouse_id: str,
    warehouse_data: WarehouseInventoryUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(check_permission("warehouse"))
):
    """Update warehouse"""
    warehouse_service = WarehouseInventoryService(db)
    warehouse = await warehouse_service.update_inventory(warehouse_id, warehouse_data)
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    return warehouse

@router.delete("/{warehouse_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_warehouse(
    warehouse_id: str,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(check_permission("warehouse"))
):
    """Delete warehouse"""
    warehouse_service = WarehouseInventoryService(db)
    success = await warehouse_service.delete_inventory(warehouse_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    return None
  