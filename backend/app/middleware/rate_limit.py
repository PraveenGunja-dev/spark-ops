"""
Rate limiting middleware using Redis
"""
from typing import Callable
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import redis.asyncio as redis
import time

from app.core.config import settings


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware"""
    
    def __init__(self, app):
        super().__init__(app)
        self.redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )
        self.rate_limit = settings.RATE_LIMIT_PER_MINUTE
        self.window = 60  # 1 minute in seconds
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request with rate limiting"""
        
        # Skip rate limiting for health checks and docs
        if request.url.path in ["/health", "/ready", "/docs", "/redoc", "/openapi.json"]:
            return await call_next(request)
        
        # Get client identifier (IP address or user ID from token)
        client_id = request.client.host if request.client else "unknown"
        
        # Create Redis key
        key = f"rate_limit:{client_id}"
        
        try:
            # Get current count
            current = await self.redis_client.get(key)
            
            if current is None:
                # First request in window
                await self.redis_client.setex(key, self.window, 1)
            else:
                current_count = int(current)
                
                if current_count >= self.rate_limit:
                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail="Rate limit exceeded. Please try again later.",
                        headers={"Retry-After": str(self.window)},
                    )
                
                # Increment counter
                await self.redis_client.incr(key)
            
            # Process request
            response = await call_next(request)
            
            # Add rate limit headers
            remaining = self.rate_limit - (int(await self.redis_client.get(key) or 0))
            response.headers["X-RateLimit-Limit"] = str(self.rate_limit)
            response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))
            response.headers["X-RateLimit-Reset"] = str(int(time.time()) + self.window)
            
            return response
            
        except HTTPException:
            raise
        except Exception as e:
            # Log error but don't block request
            print(f"Rate limit error: {e}")
            return await call_next(request)
