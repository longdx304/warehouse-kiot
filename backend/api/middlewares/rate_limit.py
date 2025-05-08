from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import time
from core.cache import redis

class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Rate limiting middleware using Redis
    
    Args:
        app: FastAPI application
        requests_per_minute: Maximum requests per minute per IP
    """
    
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host
        
        # Create Redis key
        key = f"rate_limit:{client_ip}"
        
        # Get current timestamp
        now = int(time.time())
        
        # Create pipeline
        pipe = redis.pipeline()
        
        try:
            # Add current timestamp to sorted set
            pipe.zadd(key, {str(now): now})
            
            # Remove timestamps older than 1 minute
            pipe.zremrangebyscore(key, 0, now - 60)
            
            # Count requests in last minute
            pipe.zcard(key)
            
            # Set key expiration
            pipe.expire(key, 60)
            
            # Execute pipeline
            results = await pipe.execute()
            request_count = results[2]
            
            # Check rate limit
            if request_count > self.requests_per_minute:
                raise HTTPException(
                    status_code=429,
                    detail="Too many requests"
                )
            
            # Process request
            response = await call_next(request)
            return response
            
        except Exception as e:
            # Log error and allow request in case of Redis failure
            from api.logger import logger
            logger.error(f"Rate limit error: {str(e)}")
            return await call_next(request) 
            