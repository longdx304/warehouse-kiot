from fastapi import Request
import time
from starlette.middleware.base import BaseHTTPMiddleware
from api.logger import logger

class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware for logging HTTP requests and responses
    """
    
    async def dispatch(self, request: Request, call_next):
        # Record request start time
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url.path}")
        
        # Process request
        response = await call_next(request)
        
        # Calculate processing time
        process_time = time.time() - start_time
        
        # Log response
        logger.info(f"Response: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s")
        
        return response
      