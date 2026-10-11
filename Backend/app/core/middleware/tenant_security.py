import contextvars
from typing import Optional
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.security import decode_access_token

# Context variable thread-safe / async-safe para almacenar el Tenant ID actual por petición
current_tenant_id_ctx: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar("current_tenant_id", default=None)
current_user_ctx: contextvars.ContextVar[Optional[dict]] = contextvars.ContextVar("current_user", default=None)

class TenantSecurityMiddleware(BaseHTTPMiddleware):
    """
    Middleware que intercepta peticiones HTTP para:
    1. Extraer 'X-Tenant-ID' de cabecera o del token JWT.
    2. Validar el token JWT si está presente en Authorization Header.
    3. Establecer el contexto multi-tenant global para aislamiento de datos.
    """
    async def dispatch(self, request: Request, call_next):
        tenant_id = request.headers.get("X-Tenant-ID")
        user_data = None
        
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = decode_access_token(token)
            if payload:
                user_data = payload
                # El tenant_id del token tiene precedencia sobre la cabecera por seguridad
                if payload.get("tenant_id"):
                    tenant_id = payload.get("tenant_id")
                    
        current_tenant_id_ctx.set(tenant_id)
        current_user_ctx.set(user_data)
        
        response = await call_next(request)
        return response

def get_current_tenant_id() -> Optional[str]:
    """Obtiene el ID del tenant actual en la solicitud."""
    return current_tenant_id_ctx.get()

def get_current_user_data() -> Optional[dict]:
    """Obtiene el payload del usuario autenticado."""
    return current_user_ctx.get()
