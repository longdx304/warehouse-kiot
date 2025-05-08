import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from fastapi.testclient import TestClient
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession

from api.modules.item_unit.controller.item_unit_controller import router
from api.modules.item_unit.service.item_unit_service import ItemUnitService
from api.modules.item_unit.dto.input import ItemUnitCreate, ItemUnitUpdate
from api.modules.item_unit.entity.item_unit_entity import ItemUnit

# Test app
app = FastAPI()
app.include_router(router, prefix="/item-units")

@pytest.fixture
def test_client():
    """Create a test client"""
    return TestClient(app)

@pytest.fixture
def mock_db():
    """Create a mock database session"""
    return AsyncMock(spec=AsyncSession)

@pytest.fixture
def mock_item_unit():
    """Create a mock item unit"""
    item_unit = MagicMock(spec=ItemUnit)
    item_unit.id = "unit-123"
    item_unit.unit = "kg"
    item_unit.quantity = 1
    
    # For serialization in responses
    item_unit.model_dump = MagicMock(return_value={
        "id": "unit-123",
        "unit": "kg",
        "quantity": 1,
        "created_at": "2023-01-01T00:00:00",
        "updated_at": "2023-01-01T00:00:00"
    })
    
    return item_unit

@pytest.fixture
def mock_current_user():
    """Create a mock authenticated user"""
    return {
        "user_id": "user-123",
        "email": "test@example.com",
        "role": "admin",
        "permissions": ["item_unit"]
    }

@pytest.mark.asyncio
async def test_create_item_unit_success(mock_db, mock_item_unit, mock_current_user):
    """Test creating an item unit successfully"""
    # Setup
    item_unit_data = ItemUnitCreate(
        unit="kg",
        quantity=1
    )
    
    # Mock service
    with patch('api.modules.item_unit.controller.item_unit_controller.ItemUnitService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.create_item_unit = AsyncMock(return_value=mock_item_unit)
        
        # Test
        with patch('api.modules.item_unit.controller.item_unit_controller.get_db', return_value=mock_db), \
             patch('api.modules.item_unit.controller.item_unit_controller.get_current_user', return_value=mock_current_user):
            from api.modules.item_unit.controller.item_unit_controller import create_item_unit
            result = await create_item_unit(item_unit_data, mock_db, mock_current_user)
        
        # Assert
        assert result == mock_item_unit
        mock_service.create_item_unit.assert_called_once_with(item_unit_data)

@pytest.mark.asyncio
async def test_create_item_unit_exists(mock_db, mock_current_user):
    """Test creating an item unit that already exists"""
    # Setup
    item_unit_data = ItemUnitCreate(
        unit="kg",
        quantity=1
    )
    
    # Mock service
    with patch('api.modules.item_unit.controller.item_unit_controller.ItemUnitService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.create_item_unit = AsyncMock(side_effect=ValueError("Unit 'kg' already exists"))
        
        # Test
        with patch('api.modules.item_unit.controller.item_unit_controller.get_db', return_value=mock_db), \
             patch('api.modules.item_unit.controller.item_unit_controller.get_current_user', return_value=mock_current_user):
            from api.modules.item_unit.controller.item_unit_controller import create_item_unit
            
            with pytest.raises(HTTPException) as exc_info:
                await create_item_unit(item_unit_data, mock_db, mock_current_user)
            
            # Assert
            assert exc_info.value.status_code == 400
            assert "Unit 'kg' already exists" in exc_info.value.detail
            mock_service.create_item_unit.assert_called_once_with(item_unit_data)

@pytest.mark.asyncio
async def test_get_item_unit_success(mock_db, mock_item_unit, mock_current_user):
    """Test getting an item unit by ID successfully"""
    # Mock service
    with patch('api.modules.item_unit.controller.item_unit_controller.ItemUnitService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.get_by_id = AsyncMock(return_value=mock_item_unit)
        
        # Test
        with patch('api.modules.item_unit.controller.item_unit_controller.get_db', return_value=mock_db), \
             patch('api.modules.item_unit.controller.item_unit_controller.get_current_user', return_value=mock_current_user):
            from api.modules.item_unit.controller.item_unit_controller import get_item_unit
            result = await get_item_unit("unit-123", mock_db, mock_current_user)
        
        # Assert
        assert result == mock_item_unit
        mock_service.get_by_id.assert_called_once_with("unit-123")

@pytest.mark.asyncio
async def test_get_item_unit_not_found(mock_db, mock_current_user):
    """Test getting an item unit by ID that doesn't exist"""
    # Mock service
    with patch('api.modules.item_unit.controller.item_unit_controller.ItemUnitService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.get_by_id = AsyncMock(return_value=None)
        
        # Test
        with patch('api.modules.item_unit.controller.item_unit_controller.get_db', return_value=mock_db), \
             patch('api.modules.item_unit.controller.item_unit_controller.get_current_user', return_value=mock_current_user):
            from api.modules.item_unit.controller.item_unit_controller import get_item_unit
            
            with pytest.raises(HTTPException) as exc_info:
                await get_item_unit("non-existent-id", mock_db, mock_current_user)
            
            # Assert
            assert exc_info.value.status_code == 404
            assert exc_info.value.detail == "Item unit not found"
            mock_service.get_by_id.assert_called_once_with("non-existent-id")

@pytest.mark.asyncio
async def test_get_all_item_units(mock_db, mock_item_unit, mock_current_user):
    """Test getting all item units"""
    # Setup
    item_units = [mock_item_unit, mock_item_unit]
    
    # Mock service
    with patch('api.modules.item_unit.controller.item_unit_controller.ItemUnitService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.get_all_item_units = AsyncMock(return_value=item_units)
        
        # Test
        with patch('api.modules.item_unit.controller.item_unit_controller.get_db', return_value=mock_db), \
             patch('api.modules.item_unit.controller.item_unit_controller.get_current_user', return_value=mock_current_user):
            from api.modules.item_unit.controller.item_unit_controller import get_all_item_units
            result = await get_all_item_units(0, 10, mock_db, mock_current_user)
        
        # Assert
        assert result == item_units
        mock_service.get_all_item_units.assert_called_once_with(0, 10)

@pytest.mark.asyncio
async def test_update_item_unit_success(mock_db, mock_item_unit, mock_current_user):
    """Test updating an item unit successfully"""
    # Setup
    update_data = ItemUnitUpdate(quantity=2)
    
    # Mock service
    with patch('api.modules.item_unit.controller.item_unit_controller.ItemUnitService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.update_item_unit = AsyncMock(return_value=mock_item_unit)
        
        # Test
        with patch('api.modules.item_unit.controller.item_unit_controller.get_db', return_value=mock_db), \
             patch('api.modules.item_unit.controller.item_unit_controller.get_current_user', return_value=mock_current_user):
            from api.modules.item_unit.controller.item_unit_controller import update_item_unit
            result = await update_item_unit("unit-123", update_data, mock_db, mock_current_user)
        
        # Assert
        assert result == mock_item_unit
        mock_service.update_item_unit.assert_called_once_with("unit-123", update_data)

@pytest.mark.asyncio
async def test_update_item_unit_not_found(mock_db, mock_current_user):
    """Test updating an item unit that doesn't exist"""
    # Setup
    update_data = ItemUnitUpdate(quantity=2)
    
    # Mock service
    with patch('api.modules.item_unit.controller.item_unit_controller.ItemUnitService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.update_item_unit = AsyncMock(return_value=None)
        
        # Test
        with patch('api.modules.item_unit.controller.item_unit_controller.get_db', return_value=mock_db), \
             patch('api.modules.item_unit.controller.item_unit_controller.get_current_user', return_value=mock_current_user):
            from api.modules.item_unit.controller.item_unit_controller import update_item_unit
            
            with pytest.raises(HTTPException) as exc_info:
                await update_item_unit("non-existent-id", update_data, mock_db, mock_current_user)
            
            # Assert
            assert exc_info.value.status_code == 404
            assert exc_info.value.detail == "Item unit not found"
            mock_service.update_item_unit.assert_called_once_with("non-existent-id", update_data)

@pytest.mark.asyncio
async def test_delete_item_unit_success(mock_db, mock_current_user):
    """Test deleting an item unit successfully"""
    # Mock service
    with patch('api.modules.item_unit.controller.item_unit_controller.ItemUnitService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.delete_item_unit = AsyncMock(return_value=True)
        
        # Test
        with patch('api.modules.item_unit.controller.item_unit_controller.get_db', return_value=mock_db), \
             patch('api.modules.item_unit.controller.item_unit_controller.get_current_user', return_value=mock_current_user):
            from api.modules.item_unit.controller.item_unit_controller import delete_item_unit
            result = await delete_item_unit("unit-123", mock_db, mock_current_user)
        
        # Assert
        assert result is None
        mock_service.delete_item_unit.assert_called_once_with("unit-123")

@pytest.mark.asyncio
async def test_delete_item_unit_not_found(mock_db, mock_current_user):
    """Test deleting an item unit that doesn't exist"""
    # Mock service
    with patch('api.modules.item_unit.controller.item_unit_controller.ItemUnitService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.delete_item_unit = AsyncMock(return_value=False)
        
        # Test
        with patch('api.modules.item_unit.controller.item_unit_controller.get_db', return_value=mock_db), \
             patch('api.modules.item_unit.controller.item_unit_controller.get_current_user', return_value=mock_current_user):
            from api.modules.item_unit.controller.item_unit_controller import delete_item_unit
            
            with pytest.raises(HTTPException) as exc_info:
                await delete_item_unit("non-existent-id", mock_db, mock_current_user)
            
            # Assert
            assert exc_info.value.status_code == 404
            assert exc_info.value.detail == "Item unit not found"
            mock_service.delete_item_unit.assert_called_once_with("non-existent-id") 