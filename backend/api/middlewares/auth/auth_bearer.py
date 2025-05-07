from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict, Any

from api.middlewares.auth.jwt_token_handler import decode_token
from api.modules.user.service.user_service import UserService
from api.modules.user.entity.user_entity import UserRole
from api.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

class JWTBearer(HTTPBearer):
    """
    JWT Bearer token authentication dependency
    """
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)
    
    async def __call__(self, request: Request, db: AsyncSession = Depends(get_db)):
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(status_code=403, detail="Invalid authentication scheme")
            
            payload = self.verify_jwt(credentials.credentials)
            if not payload:
                raise HTTPException(status_code=403, detail="Invalid token or expired token")
            
            # Verify user exists in database
            user_service = UserService(db)
            user = await user_service.get_by_id(payload.get("user_id"))
            if not user:
                raise HTTPException(status_code=403, detail="User not found")
                
            return payload
        else:
            raise HTTPException(status_code=403, detail="Invalid authorization code")
    
    def verify_jwt(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token and return payload if valid"""
        return decode_token(token)

# Create specific permission requirements
def get_current_user(payload: Dict[str, Any] = Depends(JWTBearer())):
    """Get current authenticated user from token payload"""
    return payload

def admin_required(payload: Dict[str, Any] = Depends(JWTBearer())):
    """Check if user has admin role"""
    role = payload.get("role")
    if role != UserRole.ADMIN.value:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return payload

def check_permission(required_permission: str):
    """
    Factory for permission-specific dependencies
    
    Args:
        required_permission: Permission string to check for
    """
    def permission_checker(payload: Dict[str, Any] = Depends(JWTBearer())):
        permissions = payload.get("permissions", [])
        if required_permission not in permissions:
            raise HTTPException(status_code=403, detail=f"Missing required permission: {required_permission}")
        return payload
    
    return permission_checker

