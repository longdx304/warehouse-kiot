import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from sqlalchemy.ext.asyncio import AsyncSession

from api.modules.warehouse_inventory.service.warehouse_inventory_service import WarehouseInventoryService
from api.modules.warehouse_inventory.dto.input import WarehouseInventoryCreate, WarehouseInventoryUpdate
from api.modules.warehouse_inventory.entity.warehouse_inventory_entity import WarehouseInventory
from api.modules.warehouse.entity.warehouse_entity import Warehouse
from api.modules.item_unit.entity.item_unit_entity import ItemUnit

@pytest.fixture
def mock_db():
    """Create a mock database session"""
    return AsyncMock(spec=AsyncSession)

@pytest.fixture
def warehouse_inventory_service(mock_db):
    """Create a WarehouseInventoryService instance with a mock database"""
    service = WarehouseInventoryService(mock_db)
    # Set up repository methods as AsyncMocks
    service.repository.get_by_id = AsyncMock()
    service.repository.get_by_warehouse_and_sku = AsyncMock()
    service.repository.get_by_warehouse = AsyncMock()
    service.repository.create = AsyncMock()
    service.repository.update = AsyncMock()
    service.repository.delete = AsyncMock()
    service.repository.get_all = AsyncMock()
    
    # Set up dependencies
    service.warehouse_service.get_by_id = AsyncMock()
    service.item_unit_service.get_by_id = AsyncMock()
    
    return service

@pytest.fixture
def mock_warehouse():
    """Create a mock warehouse"""
    warehouse = MagicMock(spec=Warehouse)
    warehouse.id = "warehouse-123"
    warehouse.name = "Test Warehouse"
    warehouse.location = "Test Location"
    return warehouse

@pytest.fixture
def mock_item_unit():
    """Create a mock item unit"""
    item_unit = MagicMock(spec=ItemUnit)
    item_unit.id = "unit-123"
    item_unit.unit = "kg"
    return item_unit

@pytest.fixture
def mock_inventory_data():
    """Create mock inventory data"""
    return WarehouseInventoryCreate(
        warehouse_id="warehouse-123",
        sku="SKU001",
        quantity=10,
        unit_id="unit-123"
    )

@pytest.fixture
def mock_inventory():
    """Create a mock inventory item"""
    inventory = MagicMock(spec=WarehouseInventory)
    inventory.id = "inventory-123"
    inventory.warehouse_id = "warehouse-123"
    inventory.sku = "SKU001"
    inventory.quantity = 10
    inventory.unit_id = "unit-123"
    return inventory

@pytest.mark.asyncio
async def test_create_inventory_success(warehouse_inventory_service, mock_inventory_data, mock_warehouse, mock_item_unit, mock_inventory):
    """Test creating an inventory item successfully"""
    # Setup
    warehouse_inventory_service.warehouse_service.get_by_id.return_value = mock_warehouse
    warehouse_inventory_service.item_unit_service.get_by_id.return_value = mock_item_unit
    warehouse_inventory_service.repository.create.return_value = mock_inventory
    
    # Execute
    result = await warehouse_inventory_service.create_inventory(mock_inventory_data)
    
    # Assert
    assert result == mock_inventory
    warehouse_inventory_service.warehouse_service.get_by_id.assert_called_once_with(mock_inventory_data.warehouse_id)
    warehouse_inventory_service.item_unit_service.get_by_id.assert_called_once_with(mock_inventory_data.unit_id)
    assert warehouse_inventory_service.repository.create.call_count == 1

@pytest.mark.asyncio
async def test_create_inventory_warehouse_not_found(warehouse_inventory_service, mock_inventory_data):
    """Test creating an inventory item with non-existent warehouse"""
    # Setup
    warehouse_inventory_service.warehouse_service.get_by_id.return_value = None
    
    # Execute and Assert
    with pytest.raises(ValueError, match=f"Warehouse with ID {mock_inventory_data.warehouse_id} not found"):
        await warehouse_inventory_service.create_inventory(mock_inventory_data)
    
    warehouse_inventory_service.warehouse_service.get_by_id.assert_called_once_with(mock_inventory_data.warehouse_id)
    warehouse_inventory_service.item_unit_service.get_by_id.assert_not_called()
    warehouse_inventory_service.repository.create.assert_not_called()

@pytest.mark.asyncio
async def test_create_inventory_unit_not_found(warehouse_inventory_service, mock_inventory_data, mock_warehouse):
    """Test creating an inventory item with non-existent unit"""
    # Setup
    warehouse_inventory_service.warehouse_service.get_by_id.return_value = mock_warehouse
    warehouse_inventory_service.item_unit_service.get_by_id.return_value = None
    
    # Execute and Assert
    with pytest.raises(ValueError, match=f"Unit with ID {mock_inventory_data.unit_id} not found"):
        await warehouse_inventory_service.create_inventory(mock_inventory_data)
    
    warehouse_inventory_service.warehouse_service.get_by_id.assert_called_once_with(mock_inventory_data.warehouse_id)
    warehouse_inventory_service.item_unit_service.get_by_id.assert_called_once_with(mock_inventory_data.unit_id)
    warehouse_inventory_service.repository.create.assert_not_called()

@pytest.mark.asyncio
async def test_update_inventory_success(warehouse_inventory_service, mock_inventory):
    """Test updating an inventory item successfully"""
    # Setup
    warehouse_inventory_service.repository.get_by_id.return_value = mock_inventory
    warehouse_inventory_service.repository.update.return_value = mock_inventory
    update_data = WarehouseInventoryUpdate(quantity=20)
    
    # Execute
    result = await warehouse_inventory_service.update_inventory("inventory-123", update_data)
    
    # Assert
    assert result == mock_inventory
    warehouse_inventory_service.repository.get_by_id.assert_called_once_with("inventory-123")
    assert warehouse_inventory_service.repository.update.call_count == 1

@pytest.mark.asyncio
async def test_update_inventory_not_found(warehouse_inventory_service):
    """Test updating a non-existent inventory item"""
    # Setup
    warehouse_inventory_service.repository.get_by_id.return_value = None
    update_data = WarehouseInventoryUpdate(quantity=20)
    
    # Execute and Assert
    with pytest.raises(ValueError, match="Inventory with ID non-existent-id not found"):
        await warehouse_inventory_service.update_inventory("non-existent-id", update_data)
    
    warehouse_inventory_service.repository.get_by_id.assert_called_once_with("non-existent-id")
    warehouse_inventory_service.repository.update.assert_not_called()

@pytest.mark.asyncio
async def test_delete_inventory(warehouse_inventory_service):
    """Test deleting an inventory item"""
    # Setup
    warehouse_inventory_service.repository.delete.return_value = True
    
    # Execute
    result = await warehouse_inventory_service.delete_inventory("inventory-123")
    
    # Assert
    assert result is True
    warehouse_inventory_service.repository.delete.assert_called_once_with("inventory-123")

@pytest.mark.asyncio
async def test_get_inventory_by_id(warehouse_inventory_service, mock_inventory):
    """Test getting an inventory item by ID"""
    # Setup
    warehouse_inventory_service.repository.get_by_id.return_value = mock_inventory
    
    # Execute
    result = await warehouse_inventory_service.get_inventory_by_id("inventory-123")
    
    # Assert
    assert result == mock_inventory
    warehouse_inventory_service.repository.get_by_id.assert_called_once_with("inventory-123")

@pytest.mark.asyncio
async def test_get_inventory_by_warehouse_and_sku(warehouse_inventory_service, mock_inventory):
    """Test getting an inventory item by warehouse ID and SKU"""
    # Setup
    warehouse_inventory_service.repository.get_by_warehouse_and_sku.return_value = mock_inventory
    
    # Execute
    result = await warehouse_inventory_service.get_inventory_by_warehouse_and_sku("warehouse-123", "SKU001")
    
    # Assert
    assert result == mock_inventory
    warehouse_inventory_service.repository.get_by_warehouse_and_sku.assert_called_once_with("warehouse-123", "SKU001")

@pytest.mark.asyncio
async def test_get_inventory_by_warehouse(warehouse_inventory_service, mock_inventory):
    """Test getting all inventory items for a warehouse"""
    # Setup
    inventories = [mock_inventory, mock_inventory]
    warehouse_inventory_service.repository.get_by_warehouse.return_value = inventories
    
    # Execute
    result = await warehouse_inventory_service.get_inventory_by_warehouse("warehouse-123")
    
    # Assert
    assert result == inventories
    assert len(result) == 2
    warehouse_inventory_service.repository.get_by_warehouse.assert_called_once_with("warehouse-123")

@pytest.mark.asyncio
async def test_get_all_inventory(warehouse_inventory_service, mock_inventory):
    """Test getting all inventory items with pagination"""
    # Setup
    inventories = [mock_inventory, mock_inventory, mock_inventory]
    warehouse_inventory_service.repository.get_all.return_value = inventories
    
    # Execute
    result = await warehouse_inventory_service.get_all_inventory(0, 10)
    
    # Assert
    assert result == inventories
    assert len(result) == 3
    warehouse_inventory_service.repository.get_all.assert_called_once_with(0, 10)
