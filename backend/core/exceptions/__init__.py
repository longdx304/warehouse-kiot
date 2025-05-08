from fastapi import HTTPException, status
from typing import Any, Dict, Optional

class AppException(HTTPException):
    """Base exception class for application errors"""
    def __init__(
        self,
        status_code: int,
        detail: Any = None,
        headers: Optional[Dict[str, str]] = None
    ) -> None:
        super().__init__(status_code=status_code, detail=detail, headers=headers)

class NotFoundException(AppException):
    """Exception raised when a resource is not found"""
    def __init__(self, detail: str = "Resource not found") -> None:
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class ValidationException(AppException):
    """Exception raised for validation errors"""
    def __init__(self, detail: str = "Validation error") -> None:
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class AuthenticationException(AppException):
    """Exception raised for authentication errors"""
    def __init__(self, detail: str = "Authentication failed") -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )

class AuthorizationException(AppException):
    """Exception raised for authorization errors"""
    def __init__(self, detail: str = "Not authorized") -> None:
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)

class ConflictException(AppException):
    """Exception raised for conflict errors"""
    def __init__(self, detail: str = "Resource conflict") -> None:
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail) 