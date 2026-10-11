import time
import re
from typing import Dict, Tuple
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import settings

rate_limit_store: Dict[str, Tuple[int, float]] = {}

def get_max_requests_from_setting() -> int:
    """Parsea '100/minute' o '100' desde settings.DEFAULT_RATE_LIMIT."""
    raw = getattr(settings, "DEFAULT_RATE_LIMIT", "100/minute")
    match = re.search(r'\d+', str(raw))
    return int(match.group()) if match else 100

WINDOW_SECONDS = 60

class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Middleware de Rate Limiting Enterprise.
    Aplica límites dinámicos desde settings.DEFAULT_RATE_LIMIT por combinación de IP y Tenant Token/ID.
    """
    async def dispatch(self, request: Request, call_next):
        max_requests = get_max_requests_from_setting()
        client_ip = request.client.host if request.client else "127.0.0.1"
        tenant_id = request.headers.get("X-Tenant-ID", "global")
        key = f"{client_ip}:{tenant_id}"
        
        now = time.time()
        requests_count, start_time = rate_limit_store.get(key, (0, now))
        
        if now - start_time > WINDOW_SECONDS:
            requests_count = 1
            start_time = now
        else:
            requests_count += 1
            
        rate_limit_store[key] = (requests_count, start_time)
        
        if requests_count > max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Límite de peticiones excedido ({max_requests}/minuto). Por favor intenta de nuevo en un minuto."
            )
            
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(max_requests)
        response.headers["X-RateLimit-Remaining"] = str(max(0, max_requests - requests_count))
        return response
