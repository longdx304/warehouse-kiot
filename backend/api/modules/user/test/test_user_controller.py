import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from fastapi.testclient import TestClient
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import AsyncSession

from api.modules.user.controller.user_controller import router
from api.modules.user.service.user_service import UserService
from api.modules.user.dto.input import UserCreate, UserUpdate, UserLogin
from api.modules.user.entity.user_entity import User

# Test app
app = FastAPI()
app.include_router(router, prefix="/users")

@pytest.fixture
def test_client():
    """Create a test client"""
    return TestClient(app)

@pytest.fixture
def mock_db():
    """Create a mock database session"""
    return AsyncMock(spec=AsyncSession)

@pytest.fixture
def mock_user():
    """Create a mock user"""
    user = MagicMock(spec=User)
    user.id = "user-123"
    user.username = "testuser"
    user.email = "test@example.com"
    user.role = "user"
    user.permissions = ["read"]
    return user

@pytest.fixture
def mock_token_response():
    """Create a mock token response"""
    return {
        "access_token": "token123",
        "token_type": "bearer",
        "expires_in": 3600,
        "user": MagicMock(spec=User)
    }

@pytest.mark.asyncio
async def test_register_user_success(mock_db, mock_user):
    """Test registering a user successfully"""
    # Setup
    user_data = UserCreate(
        username="testuser",
        email="test@example.com",
        password="password123",
        full_name="Test User"
    )
    
    # Mock service
    with patch('api.modules.user.controller.user_controller.UserService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.create_user = AsyncMock(return_value=mock_user)
        
        # Test
        with patch('api.modules.user.controller.user_controller.get_db', return_value=mock_db):
            from api.modules.user.controller.user_controller import register_user
            result = await register_user(user_data, mock_db)
        
        # Assert
        assert result == mock_user
        mock_service.create_user.assert_called_once_with(user_data)

@pytest.mark.asyncio
async def test_register_user_validation_error(mock_db):
    """Test registering a user with validation error"""
    # Setup
    user_data = UserCreate(
        username="testuser",
        email="test@example.com",
        password="password123",
        full_name="Test User"
    )
    
    # Mock service
    with patch('api.modules.user.controller.user_controller.UserService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.create_user = AsyncMock(side_effect=ValueError("Email already registered"))
        
        # Test
        with patch('api.modules.user.controller.user_controller.get_db', return_value=mock_db):
            from api.modules.user.controller.user_controller import register_user
            
            with pytest.raises(HTTPException) as exc_info:
                await register_user(user_data, mock_db)
            
            # Assert
            assert exc_info.value.status_code == 400
            assert exc_info.value.detail == "Email already registered"
            mock_service.create_user.assert_called_once_with(user_data)

@pytest.mark.asyncio
async def test_login_success(mock_db, mock_token_response):
    """Test login successfully"""
    # Setup
    login_data = UserLogin(
        email="test@example.com",
        password="password123"
    )
    
    # Mock service
    with patch('api.modules.user.controller.user_controller.UserService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.authenticate_user = AsyncMock(return_value=mock_token_response)
        
        # Test
        with patch('api.modules.user.controller.user_controller.get_db', return_value=mock_db):
            from api.modules.user.controller.user_controller import login
            result = await login(login_data, mock_db)
        
        # Assert
        assert result == mock_token_response
        mock_service.authenticate_user.assert_called_once_with(
            login_data.email, login_data.password
        )

@pytest.mark.asyncio
async def test_login_invalid_credentials(mock_db):
    """Test login with invalid credentials"""
    # Setup
    login_data = UserLogin(
        email="test@example.com",
        password="wrong_password"
    )
    
    # Mock service
    with patch('api.modules.user.controller.user_controller.UserService') as mock_service_class:
        mock_service = mock_service_class.return_value
        mock_service.authenticate_user = AsyncMock(return_value=None)
        
        # Test
        with patch('api.modules.user.controller.user_controller.get_db', return_value=mock_db):
            from api.modules.user.controller.user_controller import login
            
            with pytest.raises(HTTPException) as exc_info:
                await login(login_data, mock_db)
            
            # Assert
            assert exc_info.value.status_code == 401
            assert exc_info.value.detail == "Incorrect email or password"
            mock_service.authenticate_user.assert_called_once_with(
                login_data.email, login_data.password
            ) 