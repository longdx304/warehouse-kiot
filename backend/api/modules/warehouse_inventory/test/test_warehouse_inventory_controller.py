import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from fastapi.testclient import TestClient
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession

from api.modules.warehouse_inventory.controller.warehouse_inventory_controller import router
from api.modules.warehouse_inventory.service.warehouse_inventory_service import WarehouseInventoryService
from api.modules.warehouse_inventory.dto.input import WarehouseInventoryCreate, WarehouseInventoryUpdate
from api.modules.warehouse_inventory.entity.warehouse_inventory_entity import WarehouseInventory

# Test app
app = FastAPI()
app.include_router(router, prefix="/warehouse-inventory")

@pytest.fixture
def test_client():
    """Create a test client"""
    return TestClient(app)

@pytest.fixture
def mock_db():
    """Create a mock database session"""
    return AsyncMock(spec=AsyncSession)

@pytest.fixture
def mock_inventory():
    """Create a mock inventory item"""
    inventory = MagicMock(spec=WarehouseInventory)
    inventory.id = "inventory-123"
    inventory.warehouse_id = "warehouse-123"
    inventory.sku = "SKU001"
    inventory.quantity = 10
    inventory.unit_id = "unit-123"
    
    # For serialization in responses
    inventory.model_dump = MagicMock(return_value={
        "id": "inventory-123",
        "warehouse_id": "warehouse-123",
        "sku": "SKU001",
        "quantity": 10,
        "unit_id": "unit-123",
        "created_at": "2023-01-01T00:00:00",
        "updated_at": "2023-01-01T00:00:00"
    })
    
    return inventory

@pytest.fixture
def mock_current_user():
    """Create a mock authenticated user with warehouse permission"""
    return {
        "user_id": "user-123",
        "email": "test@example.com",
        "role": "admin",
        "permissions": ["warehouse"]
    }

@pytest.mark.asyncio
async def test_create_warehouse_inventory_success(mock_db, mock_inventory, mock_current_user):
    """Test creating a warehouse inventory successfully"""
    # Setup
    inventory_data = WarehouseInventoryCreate(
        warehouse_id="warehouse-123",
        sku="SKU001",
        quantity=10,
        unit_id="unit-123"
    )
    
    # Mock service
    with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.WarehouseInventoryService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.create_inventory = AsyncMock(return_value=mock_inventory)
        
        # Test
        with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.get_db', return_value=mock_db), \
             patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.check_permission', return_value=lambda _: mock_current_user):
            from api.modules.warehouse_inventory.controller.warehouse_inventory_controller import create_warehouse
            result = await create_warehouse(inventory_data, mock_db, mock_current_user)
        
        # Assert
        assert result == mock_inventory
        mock_service.create_inventory.assert_called_once_with(inventory_data)

@pytest.mark.asyncio
async def test_get_warehouse_inventory_success(mock_db, mock_inventory, mock_current_user):
    """Test getting a warehouse inventory by ID successfully"""
    # Mock service
    with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.WarehouseInventoryService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.get_by_id = AsyncMock(return_value=mock_inventory)
        
        # Test
        with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.get_db', return_value=mock_db), \
             patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.get_current_user', return_value=mock_current_user):
            from api.modules.warehouse_inventory.controller.warehouse_inventory_controller import get_warehouse
            result = await get_warehouse("inventory-123", mock_db, mock_current_user)
        
        # Assert
        assert result == mock_inventory
        mock_service.get_by_id.assert_called_once_with("inventory-123")

@pytest.mark.asyncio
async def test_get_warehouse_inventory_not_found(mock_db, mock_current_user):
    """Test getting a warehouse inventory by ID that doesn't exist"""
    # Mock service
    with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.WarehouseInventoryService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.get_by_id = AsyncMock(return_value=None)
        
        # Test
        with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.get_db', return_value=mock_db), \
             patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.get_current_user', return_value=mock_current_user):
            from api.modules.warehouse_inventory.controller.warehouse_inventory_controller import get_warehouse
            
            with pytest.raises(HTTPException) as exc_info:
                await get_warehouse("non-existent-id", mock_db, mock_current_user)
            
            # Assert
            assert exc_info.value.status_code == 404
            assert exc_info.value.detail == "Warehouse not found"
            mock_service.get_by_id.assert_called_once_with("non-existent-id")

@pytest.mark.asyncio
async def test_get_all_warehouse_inventories(mock_db, mock_inventory, mock_current_user):
    """Test getting all warehouse inventories"""
    # Setup
    inventories = [mock_inventory, mock_inventory]
    
    # Mock service
    with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.WarehouseInventoryService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.get_all_inventory = AsyncMock(return_value=inventories)
        
        # Test
        with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.get_db', return_value=mock_db), \
             patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.get_current_user', return_value=mock_current_user):
            from api.modules.warehouse_inventory.controller.warehouse_inventory_controller import get_all_warehouses
            result = await get_all_warehouses(0, 10, mock_db, mock_current_user)
        
        # Assert
        assert result == inventories
        mock_service.get_all_inventory.assert_called_once_with(0, 10)

@pytest.mark.asyncio
async def test_update_warehouse_inventory_success(mock_db, mock_inventory, mock_current_user):
    """Test updating a warehouse inventory successfully"""
    # Setup
    update_data = WarehouseInventoryUpdate(quantity=20)
    
    # Mock service
    with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.WarehouseInventoryService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.update_inventory = AsyncMock(return_value=mock_inventory)
        
        # Test
        with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.get_db', return_value=mock_db), \
             patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.check_permission', return_value=lambda _: mock_current_user):
            from api.modules.warehouse_inventory.controller.warehouse_inventory_controller import update_warehouse
            result = await update_warehouse("inventory-123", update_data, mock_db, mock_current_user)
        
        # Assert
        assert result == mock_inventory
        mock_service.update_inventory.assert_called_once_with("inventory-123", update_data)

@pytest.mark.asyncio
async def test_update_warehouse_inventory_not_found(mock_db, mock_current_user):
    """Test updating a warehouse inventory that doesn't exist"""
    # Setup
    update_data = WarehouseInventoryUpdate(quantity=20)
    
    # Mock service
    with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.WarehouseInventoryService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.update_inventory = AsyncMock(return_value=None)
        
        # Test
        with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.get_db', return_value=mock_db), \
             patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.check_permission', return_value=lambda _: mock_current_user):
            from api.modules.warehouse_inventory.controller.warehouse_inventory_controller import update_warehouse
            
            with pytest.raises(HTTPException) as exc_info:
                await update_warehouse("non-existent-id", update_data, mock_db, mock_current_user)
            
            # Assert
            assert exc_info.value.status_code == 404
            assert exc_info.value.detail == "Warehouse not found"
            mock_service.update_inventory.assert_called_once_with("non-existent-id", update_data)

@pytest.mark.asyncio
async def test_delete_warehouse_inventory_success(mock_db, mock_current_user):
    """Test deleting a warehouse inventory successfully"""
    # Mock service
    with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.WarehouseInventoryService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.delete_inventory = AsyncMock(return_value=True)
        
        # Test
        with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.get_db', return_value=mock_db), \
             patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.check_permission', return_value=lambda _: mock_current_user):
            from api.modules.warehouse_inventory.controller.warehouse_inventory_controller import delete_warehouse
            result = await delete_warehouse("inventory-123", mock_db, mock_current_user)
        
        # Assert
        assert result is None
        mock_service.delete_inventory.assert_called_once_with("inventory-123")

@pytest.mark.asyncio
async def test_delete_warehouse_inventory_not_found(mock_db, mock_current_user):
    """Test deleting a warehouse inventory that doesn't exist"""
    # Mock service
    with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.WarehouseInventoryService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.delete_inventory = AsyncMock(return_value=False)
        
        # Test
        with patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.get_db', return_value=mock_db), \
             patch('api.modules.warehouse_inventory.controller.warehouse_inventory_controller.check_permission', return_value=lambda _: mock_current_user):
            from api.modules.warehouse_inventory.controller.warehouse_inventory_controller import delete_warehouse
            
            with pytest.raises(HTTPException) as exc_info:
                await delete_warehouse("non-existent-id", mock_db, mock_current_user)
            
            # Assert
            assert exc_info.value.status_code == 404
            assert exc_info.value.detail == "Warehouse not found"
            mock_service.delete_inventory.assert_called_once_with("non-existent-id") 