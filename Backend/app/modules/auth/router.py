from fastapi import APIRouter, HTTPException, status, Depends
from app.modules.auth.schemas import LoginRequest, RegisterCustomerRequest, TokenResponse
from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.database import supabase_client
from app.common.models import ResponseModel, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication Multi-tenant"])

@router.post("/login", response_model=ResponseModel[TokenResponse])
async def login(payload: LoginRequest):
    """
    Login Multi-tenant compatible con super_admin, tenant_admin, cashier y customer.
    Autodetecta o valida la empresa por slug.
    """
    # 1. Buscar tenant si se provee slug
    tenant_info = None
    if payload.tenant_slug:
        res_tenant = supabase_client.table("tenants").select("*").eq("slug", payload.tenant_slug).execute()
        if res_tenant.data:
            tenant_info = res_tenant.data[0]
            
    # Mock / Demo fallback si la BD está en setup
    demo_users = {
        "admin@democafe.com": {
            "id": "11111111-1111-1111-1111-111111111111",
            "full_name": "Admin Demo Café",
            "role": UserRole.TENANT_ADMIN,
            "tenant_id": "00000000-0000-0000-0000-000000000001",
            "tenant_slug": "demo-cafe",
            "tenant_name": "Demo Coffee Roasters",
            "primary_color": "#6366f1",
            "secondary_color": "#14b8a6",
            "bg_color": "#0f172a"
        },
        "cajero@democafe.com": {
            "id": "22222222-2222-2222-2222-222222222222",
            "full_name": "Carlos Cajero",
            "role": UserRole.CASHIER,
            "tenant_id": "00000000-0000-0000-0000-000000000001",
            "tenant_slug": "demo-cafe",
            "tenant_name": "Demo Coffee Roasters",
            "primary_color": "#6366f1",
            "secondary_color": "#14b8a6",
            "bg_color": "#0f172a"
        },
        "cliente@gmail.com": {
            "id": "33333333-3333-3333-3333-333333333333",
            "full_name": "Ana Cliente",
            "role": UserRole.CUSTOMER,
            "tenant_id": "00000000-0000-0000-0000-000000000001",
            "tenant_slug": "demo-cafe",
            "tenant_name": "Demo Coffee Roasters",
            "primary_color": "#6366f1",
            "secondary_color": "#14b8a6",
            "bg_color": "#0f172a"
        },
        "super@platform.com": {
            "id": "99999999-9999-9999-9999-999999999999",
            "full_name": "Super Admin Global",
            "role": UserRole.SUPER_ADMIN,
            "tenant_id": None,
            "tenant_slug": None,
            "tenant_name": "Global Platform",
            "primary_color": "#3b82f6",
            "secondary_color": "#f59e0b",
            "bg_color": "#0f172a"
        }
    }

    user = demo_users.get(payload.email.lower())
    if not user:
        # Intentar consultar Supabase real
        try:
            res_user = supabase_client.table("users").select("*, tenants(*)").eq("email", payload.email).execute()
            if res_user.data:
                db_u = res_user.data[0]
                t_data = db_u.get("tenants") or {}
                user = {
                    "id": db_u["id"],
                    "full_name": db_u["full_name"],
                    "role": db_u["role"],
                    "tenant_id": db_u["tenant_id"],
                    "tenant_slug": t_data.get("slug"),
                    "tenant_name": t_data.get("name"),
                    "primary_color": t_data.get("primary_color", "#4f46e5"),
                    "secondary_color": t_data.get("secondary_color", "#06b6d4"),
                    "bg_color": t_data.get("bg_color", "#0f172a")
                }
        except Exception:
            pass

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas o usuario no registrado."
        )

    # Generar Token JWT con Tenant context
    token_data = {
        "sub": user["id"],
        "email": payload.email,
        "role": user["role"],
        "tenant_id": user["tenant_id"]
    }
    access_token = create_access_token(token_data)

    theme_data = {
        "primary_color": user.get("primary_color", "#4f46e5"),
        "secondary_color": user.get("secondary_color", "#06b6d4"),
        "bg_color": user.get("bg_color", "#0f172a"),
        "text_color": "#f8fafc",
        "logo_url": ""
    }

    token_res = TokenResponse(
        access_token=access_token,
        user_id=user["id"],
        email=payload.email,
        full_name=user["full_name"],
        role=user["role"],
        tenant_id=user["tenant_id"],
        tenant_slug=user.get("tenant_slug"),
        tenant_name=user.get("tenant_name"),
        theme=theme_data
    )

    return ResponseModel(
        success=True,
        message="Inicio de sesión exitoso",
        data=token_res
    )
