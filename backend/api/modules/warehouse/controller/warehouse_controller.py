from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from api.database import get_db
from api.modules.warehouse.service.warehouse_service import WarehouseService
from api.modules.warehouse.dto.input import WarehouseCreate, WarehouseUpdate, WarehouseResponse, PaginationWarehouseResponse
from api.middlewares.auth.auth_bearer import get_current_user, check_permission

router = APIRouter()

@router.post("/", response_model=WarehouseResponse, status_code=status.HTTP_201_CREATED)
async def create_warehouse(
    warehouse_data: WarehouseCreate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(check_permission("warehouse"))
):
    """Create a new warehouse"""
    warehouse_service = WarehouseService(db)
    warehouse = await warehouse_service.create_warehouse(warehouse_data)
    return warehouse

@router.get("/{warehouse_id}", response_model=WarehouseResponse)
async def get_warehouse(
    warehouse_id: str,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user)
):
    """Get warehouse by ID"""
    warehouse_service = WarehouseService(db)
    warehouse = await warehouse_service.get_by_id(warehouse_id)
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    return warehouse

@router.get("/", response_model=PaginationWarehouseResponse)
async def get_all_warehouses(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(get_current_user)
):
    """Get all warehouses"""
    warehouse_service = WarehouseService(db)
    warehouses = await warehouse_service.get_all_warehouses(skip, limit)
    count = await warehouse_service.count_all_warehouses()
    return PaginationWarehouseResponse(
        warehouses=warehouses,
        count=count,
        offset=skip,
        limit=limit
    )

@router.put("/{warehouse_id}", response_model=WarehouseResponse)
async def update_warehouse(
    warehouse_id: str,
    warehouse_data: WarehouseUpdate,
    db: AsyncSession = Depends(get_db),
    _: dict = Depends(check_permission("warehouse"))
):
    """Update warehouse"""
    warehouse_service = WarehouseService(db)
    warehouse = await warehouse_service.update_warehouse(warehouse_id, warehouse_data)
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
    warehouse_service = WarehouseService(db)
    success = await warehouse_service.delete_warehouse(warehouse_id)
    
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    # Return message
    return {"message": "Đã xóa kho thành công"}
