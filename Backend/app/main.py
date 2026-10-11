from fastapi import FastAPI, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.config import settings
from app.core.middleware.tenant_security import TenantSecurityMiddleware
from app.core.middleware.rate_limiter import RateLimiterMiddleware

# Router Modules imports
from app.modules.auth.router import router as auth_router
from app.modules.super_admin.router import router as super_admin_router
from app.modules.admin.rules.router import router as admin_rules_router
from app.modules.admin.catalog.router import router as admin_catalog_router
from app.modules.admin.branding.router import router as admin_branding_router
from app.modules.cashier.scanner.router import router as cashier_scanner_router
from app.modules.cashier.accumulation.router import router as cashier_accumulation_router
from app.modules.customer.wallet.router import router as customer_wallet_router
from app.modules.customer.portal.router import router as customer_portal_router
from app.modules.customer.history.router import router as customer_history_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 1. MIDDLEWARE DE CABECERAS DE SEGURIDAD ENTERPRISE
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# 2. MIDDLEWARE DE RATE LIMITING
app.add_middleware(RateLimiterMiddleware)

# 3. MIDDLEWARE DE AISLAMIENTO MULTI-TENANT Y JWT
app.add_middleware(TenantSecurityMiddleware)

# 4. CONFIGURACIÓN CORS DINÁMICO RESTRINGIDO
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining"]
)

# 5. REGISTRO DE RUTAS SIN PREFIJO
app.include_router(auth_router)
app.include_router(super_admin_router)
app.include_router(admin_rules_router)
app.include_router(admin_catalog_router)
app.include_router(admin_branding_router)
app.include_router(cashier_scanner_router)
app.include_router(cashier_accumulation_router)
app.include_router(customer_wallet_router)
app.include_router(customer_portal_router)
app.include_router(customer_history_router)

# Soporte para prefijo /api
api_router = APIRouter(prefix="/api")
api_router.include_router(auth_router)
api_router.include_router(super_admin_router)
api_router.include_router(admin_rules_router)
api_router.include_router(admin_catalog_router)
api_router.include_router(admin_branding_router)
api_router.include_router(cashier_scanner_router)
api_router.include_router(cashier_accumulation_router)
api_router.include_router(customer_wallet_router)
api_router.include_router(customer_portal_router)
api_router.include_router(customer_history_router)
app.include_router(api_router)

# Soporte para prefijo /api/v1
v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(auth_router)
v1_router.include_router(super_admin_router)
v1_router.include_router(admin_rules_router)
v1_router.include_router(admin_catalog_router)
v1_router.include_router(admin_branding_router)
v1_router.include_router(cashier_scanner_router)
v1_router.include_router(cashier_accumulation_router)
v1_router.include_router(customer_wallet_router)
v1_router.include_router(customer_portal_router)
v1_router.include_router(customer_history_router)
app.include_router(v1_router)

@app.get("/")
@app.get("/api")
@app.get("/api/v1")
async def root_health_check():
    return {
        "status": "online",
        "system": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "serverless_ready": True
    }
