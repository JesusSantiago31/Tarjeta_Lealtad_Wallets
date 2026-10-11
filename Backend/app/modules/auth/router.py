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
    Autodetecta o valida la empresa por slug e inyecta la paleta de colores nativa de la empresa.
    """
    # 1. Buscar tenant en Supabase si se provee slug
    tenant_info = None
    if payload.tenant_slug:
        try:
            res_tenant = supabase_client.table("tenants").select("*").eq("slug", payload.tenant_slug.strip().lower()).execute()
            if res_tenant.data:
                tenant_info = res_tenant.data[0]
        except Exception as e:
            print("[Auth] Error fetching tenant by slug:", e)

    # 2. Demo fallback accounts con la paleta de cafetería por defecto
    demo_users = {
        "admin@democafe.com": {
            "id": "11111111-1111-1111-1111-111111111111",
            "full_name": "Admin Demo Café",
            "role": UserRole.TENANT_ADMIN,
            "tenant_id": "00000000-0000-0000-0000-000000000001",
            "tenant_slug": "demo-cafe",
            "tenant_name": "Café Lealtad Manager",
            "primary_color": "#6b8e64",
            "secondary_color": "#6b462b",
            "bg_color": "#faf8f2",
            "text_color": "#2b261f"
        },
        "cajero@democafe.com": {
            "id": "22222222-2222-2222-2222-222222222222",
            "full_name": "Carlos Cajero",
            "role": UserRole.CASHIER,
            "tenant_id": "00000000-0000-0000-0000-000000000001",
            "tenant_slug": "demo-cafe",
            "tenant_name": "Café Lealtad Manager",
            "primary_color": "#6b8e64",
            "secondary_color": "#6b462b",
            "bg_color": "#faf8f2",
            "text_color": "#2b261f"
        },
        "cliente@gmail.com": {
            "id": "33333333-3333-3333-3333-333333333333",
            "full_name": "Ana Cliente",
            "role": UserRole.CUSTOMER,
            "tenant_id": "00000000-0000-0000-0000-000000000001",
            "tenant_slug": "demo-cafe",
            "tenant_name": "Café Lealtad Manager",
            "primary_color": "#6b8e64",
            "secondary_color": "#6b462b",
            "bg_color": "#faf8f2",
            "text_color": "#2b261f"
        },
        "super@platform.com": {
            "id": "99999999-9999-9999-9999-999999999999",
            "full_name": "Super Admin Global",
            "role": UserRole.SUPER_ADMIN,
            "tenant_id": None,
            "tenant_slug": None,
            "tenant_name": "Global Platform",
            "primary_color": "#0066fe",
            "secondary_color": "#004bbb",
            "bg_color": "#edf5fc",
            "text_color": "#0f172a"
        }
    }

    user = None

    # 3. Consultar primero si el usuario existe en la base de datos Supabase
    try:
        res_user = supabase_client.table("users").select("*").eq("email", payload.email.strip().lower()).execute()
        if res_user.data:
            db_u = res_user.data[0]
            t_id = db_u.get("tenant_id")
            
            # Obtener datos reales de la empresa / tenant
            t_data = {}
            if t_id:
                try:
                    res_t = supabase_client.table("tenants").select("*").eq("id", t_id).execute()
                    if res_t.data:
                        t_data = res_t.data[0]
                except Exception as t_err:
                    print("[Auth] Error fetching tenant by id:", t_err)

            f_name = db_u.get("first_name") or ""
            l_name = db_u.get("last_name") or ""
            full_name = f"{f_name} {l_name}".strip() or db_u.get("email")

            user = {
                "id": str(db_u["id"]),
                "full_name": full_name,
                "role": db_u.get("role", "customer"),
                "tenant_id": t_id,
                "tenant_slug": t_data.get("slug") or payload.tenant_slug or "demo-cafe",
                "tenant_name": t_data.get("name") or "Café Lealtad",
                "primary_color": t_data.get("primary_color") or "#6b8e64",
                "secondary_color": t_data.get("secondary_color") or "#6b462b",
                "bg_color": t_data.get("bg_color") or "#faf8f2",
                "text_color": "#2b261f",
                "logo_url": t_data.get("logo_url") or ""
            }
    except Exception as e:
        print("[Auth] Error querying user in Supabase:", e)

    # 4. Si no se encontró en Supabase, verificar en demo_users
    if not user:
        user = demo_users.get(payload.email.lower().strip())

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas o usuario no registrado."
        )

    # 5. Si hay tenant_info activo de Supabase, asegurar que sus colores reemplacen los de la sesión
    if tenant_info and user.get("role") != UserRole.SUPER_ADMIN:
        user["tenant_name"] = tenant_info.get("name") or user.get("tenant_name")
        user["tenant_slug"] = tenant_info.get("slug") or user.get("tenant_slug")
        user["primary_color"] = tenant_info.get("primary_color") or user.get("primary_color") or "#6b8e64"
        user["secondary_color"] = tenant_info.get("secondary_color") or user.get("secondary_color") or "#6b462b"
        user["bg_color"] = tenant_info.get("bg_color") or user.get("bg_color") or "#faf8f2"
        user["logo_url"] = tenant_info.get("logo_url") or user.get("logo_url") or ""

    # Generar Token JWT con Tenant context
    token_data = {
        "sub": user["id"],
        "email": payload.email,
        "role": user["role"],
        "tenant_id": user["tenant_id"]
    }
    access_token = create_access_token(token_data)

    theme_data = {
        "primary_color": user.get("primary_color") or "#6b8e64",
        "secondary_color": user.get("secondary_color") or "#6b462b",
        "bg_color": user.get("bg_color") or "#faf8f2",
        "text_color": user.get("text_color") or "#2b261f",
        "logo_url": user.get("logo_url") or ""
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
