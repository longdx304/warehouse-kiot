from typing import Any, Optional
import json
from redis import asyncio as aioredis
from api.config import settings

# Create Redis connection pool
redis = aioredis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)

class Cache:
    """Redis cache utility"""
    
    @staticmethod
    async def set(key: str, value: Any, expire: int = 3600) -> None:
        """
        Set a cache value
        
        Args:
            key: Cache key
            value: Value to cache
            expire: Expiration time in seconds (default: 1 hour)
        """
        await redis.set(key, json.dumps(value), ex=expire)
    
    @staticmethod
    async def get(key: str) -> Optional[Any]:
        """
        Get a cached value
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found
        """
        value = await redis.get(key)
        return json.loads(value) if value else None
    
    @staticmethod
    async def delete(key: str) -> None:
        """
        Delete a cached value
        
        Args:
            key: Cache key
        """
        await redis.delete(key)
    
    @staticmethod
    async def clear_pattern(pattern: str) -> None:
        """
        Clear all keys matching a pattern
        
        Args:
            pattern: Redis key pattern
        """
        keys = await redis.keys(pattern)
        if keys:
            await redis.delete(*keys) 