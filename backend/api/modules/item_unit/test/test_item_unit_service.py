import pytest
from unittest.mock import AsyncMock, MagicMock
from sqlalchemy.ext.asyncio import AsyncSession

from api.modules.item_unit.service.item_unit_service import ItemUnitService
from api.modules.item_unit.dto.input import ItemUnitCreate, ItemUnitUpdate
from api.modules.item_unit.entity.item_unit_entity import ItemUnit

@pytest.fixture
def mock_db():
    """Create a mock database session"""
    return AsyncMock(spec=AsyncSession)

@pytest.fixture
def item_unit_service(mock_db):
    """Create an ItemUnitService instance with a mock database"""
    service = ItemUnitService(mock_db)
    # Set up repository methods as AsyncMocks
    service.repository.get_by_id = AsyncMock()
    service.repository.get_by_unit = AsyncMock()
    service.repository.create = AsyncMock()
    service.repository.update = AsyncMock()
    service.repository.delete = AsyncMock()
    service.repository.get_all = AsyncMock()
    return service

@pytest.fixture
def mock_item_unit_data():
    """Create mock item unit data"""
    return ItemUnitCreate(
        unit="kg",
        quantity=1
    )

@pytest.fixture
def mock_item_unit():
    """Create a mock item unit"""
    item_unit = MagicMock(spec=ItemUnit)
    item_unit.id = "unit-123"
    item_unit.unit = "kg"
    item_unit.quantity = 1
    return item_unit

@pytest.mark.asyncio
async def test_create_item_unit_success(item_unit_service, mock_item_unit_data, mock_item_unit):
    """Test creating an item unit successfully"""
    # Setup
    item_unit_service.repository.get_by_unit.return_value = None
    item_unit_service.repository.create.return_value = mock_item_unit
    
    # Execute
    result = await item_unit_service.create_item_unit(mock_item_unit_data)
    
    # Assert
    assert result == mock_item_unit
    item_unit_service.repository.get_by_unit.assert_called_once_with(mock_item_unit_data.unit)
    assert item_unit_service.repository.create.call_count == 1

@pytest.mark.asyncio
async def test_create_item_unit_exists(item_unit_service, mock_item_unit_data, mock_item_unit):
    """Test creating an item unit that already exists"""
    # Setup
    item_unit_service.repository.get_by_unit.return_value = mock_item_unit
    
    # Execute and Assert
    with pytest.raises(ValueError, match=f"Unit '{mock_item_unit_data.unit}' already exists"):
        await item_unit_service.create_item_unit(mock_item_unit_data)
    
    item_unit_service.repository.get_by_unit.assert_called_once_with(mock_item_unit_data.unit)
    item_unit_service.repository.create.assert_not_called()

@pytest.mark.asyncio
async def test_get_by_id(item_unit_service, mock_item_unit):
    """Test getting an item unit by ID"""
    # Setup
    item_unit_service.repository.get_by_id.return_value = mock_item_unit
    
    # Execute
    result = await item_unit_service.get_by_id("unit-123")
    
    # Assert
    assert result == mock_item_unit
    item_unit_service.repository.get_by_id.assert_called_once_with("unit-123")

@pytest.mark.asyncio
async def test_get_all_item_units(item_unit_service, mock_item_unit):
    """Test getting all item units"""
    # Setup
    item_units = [mock_item_unit, mock_item_unit]
    item_unit_service.repository.get_all.return_value = item_units
    
    # Execute
    result = await item_unit_service.get_all_item_units(0, 10)
    
    # Assert
    assert result == item_units
    assert len(result) == 2
    item_unit_service.repository.get_all.assert_called_once_with(0, 10)

@pytest.mark.asyncio
async def test_update_item_unit_success(item_unit_service, mock_item_unit):
    """Test updating an item unit successfully"""
    # Setup
    item_unit_service.repository.get_by_id.return_value = mock_item_unit
    item_unit_service.repository.update.return_value = mock_item_unit
    update_data = ItemUnitUpdate(quantity=2)
    
    # Execute
    result = await item_unit_service.update_item_unit("unit-123", update_data)
    
    # Assert
    assert result == mock_item_unit
    item_unit_service.repository.get_by_id.assert_called_once_with("unit-123")

@pytest.mark.asyncio
async def test_update_item_unit_not_found(item_unit_service):
    """Test updating an item unit that doesn't exist"""
    # Setup
    item_unit_service.repository.get_by_id.return_value = None
    update_data = ItemUnitUpdate(quantity=2)
    
    # Execute
    result = await item_unit_service.update_item_unit("non-existent-id", update_data)
    
    # Assert
    assert result is None
    item_unit_service.repository.get_by_id.assert_called_once_with("non-existent-id")
    item_unit_service.repository.update.assert_not_called()

@pytest.mark.asyncio
async def test_update_item_unit_duplicate_unit(item_unit_service, mock_item_unit):
    """Test updating an item unit with a unit that already exists"""
    # Setup
    existing_unit = MagicMock(spec=ItemUnit)
    existing_unit.id = "unit-456"
    existing_unit.unit = "g"
    
    mock_item_unit.unit = "kg"
    
    item_unit_service.repository.get_by_id.return_value = mock_item_unit
    item_unit_service.repository.get_by_unit.return_value = existing_unit
    
    update_data = ItemUnitUpdate(unit="g")
    
    # Execute and Assert
    with pytest.raises(ValueError, match="Unit 'g' already exists"):
        await item_unit_service.update_item_unit("unit-123", update_data)
    
    item_unit_service.repository.get_by_id.assert_called_once_with("unit-123")
    item_unit_service.repository.get_by_unit.assert_called_once_with("g")
    item_unit_service.repository.update.assert_not_called()

@pytest.mark.asyncio
async def test_delete_item_unit(item_unit_service):
    """Test deleting an item unit"""
    # Setup
    item_unit_service.repository.delete.return_value = True
    
    # Execute
    result = await item_unit_service.delete_item_unit("unit-123")
    
    # Assert
    assert result is True
    item_unit_service.repository.delete.assert_called_once_with("unit-123")
