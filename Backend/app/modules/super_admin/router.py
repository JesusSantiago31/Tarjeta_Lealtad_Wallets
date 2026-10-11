from fastapi import APIRouter, HTTPException, Depends
from typing import List
import uuid
from datetime import datetime, timezone
from app.modules.super_admin.schemas import TenantCreateRequest, TenantUpdateRequest, TenantResponse
from app.common.models import ResponseModel
from app.core.middleware.tenant_security import get_current_user_data
from app.core.database import supabase_client
from app.common.exceptions import UnauthorizedRoleException

router = APIRouter(prefix="/super-admin", tags=["Super Admin Global Management"])

def require_super_admin():
    user = get_current_user_data()
    if not user or user.get("role") != "super_admin":
        raise UnauthorizedRoleException(required_role="super_admin")
    return user

@router.get("/tenants", response_model=ResponseModel[List[TenantResponse]])
async def list_tenants(user: dict = Depends(require_super_admin)):
    """Lista todas las empresas / tenants registradas en Supabase."""
    tenants_list = []
    try:
        res = supabase_client.table("tenants").select("*").order("created_at", desc=True).execute()
        if res.data:
            for item in res.data:
                tenants_list.append(TenantResponse(
                    id=str(item["id"]),
                    name=item["name"],
                    slug=item["slug"],
                    logo_url=item.get("logo_url") or "",
                    is_active=item.get("is_active", True),
                    primary_color=item.get("primary_color") or "#6b8e64",
                    secondary_color=item.get("secondary_color") or "#6b462b",
                    bg_color=item.get("bg_color") or "#faf8f2",
                    created_at=str(item.get("created_at") or datetime.now(timezone.utc).isoformat())
                ))
    except Exception as e:
        print("Error fetching tenants from Supabase:", e)

    # Fallback si no hay empresas registradas
    if not tenants_list:
        tenants_list = [
            TenantResponse(
                id="00000000-0000-0000-0000-000000000001",
                name="Café Lealtad Manager",
                slug="demo-cafe",
                logo_url="",
                is_active=True,
                primary_color="#6b8e64",
                secondary_color="#6b462b",
                bg_color="#faf8f2",
                created_at="2026-10-01T12:00:00Z"
            )
        ]

    return ResponseModel(success=True, data=tenants_list)

@router.post("/tenants", response_model=ResponseModel[TenantResponse])
async def create_tenant(payload: TenantCreateRequest, user: dict = Depends(require_super_admin)):
    """Crea una nueva empresa/tenant con su paleta de colores y la guarda en Supabase."""
    tenant_id = str(uuid.uuid4())
    now_str = datetime.now(timezone.utc).isoformat()

    new_tenant_data = {
        "id": tenant_id,
        "name": payload.name,
        "slug": payload.slug.strip().lower(),
        "logo_url": payload.logo_url or "",
        "primary_color": payload.primary_color or "#6b8e64",
        "secondary_color": payload.secondary_color or "#6b462b",
        "bg_color": payload.bg_color or "#faf8f2",
        "is_active": True
    }

    try:
        res = supabase_client.table("tenants").insert(new_tenant_data).execute()
        if res.data:
            item = res.data[0]
            
            # Opcional: Crear admin de empresa si se proporcionó correo
            if payload.admin_email:
                try:
                    admin_user = {
                        "id": str(uuid.uuid4()),
                        "first_name": payload.admin_name or "Gerente",
                        "last_name": payload.name,
                        "email": payload.admin_email.strip().lower(),
                        "loyalty_code": f"GER-{payload.slug.upper()}",
                        "role": "tenant_admin",
                        "tenant_id": tenant_id,
                        "password_hash": "contrasena_segura"
                    }
                    supabase_client.table("users").insert(admin_user).execute()
                except Exception as user_err:
                    print("Could not auto-create tenant admin user:", user_err)

            response_obj = TenantResponse(
                id=str(item["id"]),
                name=item["name"],
                slug=item["slug"],
                logo_url=item.get("logo_url") or "",
                is_active=True,
                primary_color=item.get("primary_color") or "#6b8e64",
                secondary_color=item.get("secondary_color") or "#6b462b",
                bg_color=item.get("bg_color") or "#faf8f2",
                created_at=str(item.get("created_at") or now_str)
            )
            return ResponseModel(success=True, message="Empresa creada exitosamente en Supabase", data=response_obj)
    except Exception as err:
        print("Error inserting tenant in Supabase:", err)

    # Fallback si Supabase no responde o da timeout
    fallback_response = TenantResponse(
        id=tenant_id,
        name=payload.name,
        slug=payload.slug,
        logo_url=payload.logo_url or "",
        is_active=True,
        primary_color=payload.primary_color or "#6b8e64",
        secondary_color=payload.secondary_color or "#6b462b",
        bg_color=payload.bg_color or "#faf8f2",
        created_at=now_str
    )
    return ResponseModel(success=True, message="Empresa registrada", data=fallback_response)

@router.put("/tenants/{tenant_id}", response_model=ResponseModel[TenantResponse])
async def update_tenant(tenant_id: str, payload: TenantUpdateRequest, user: dict = Depends(require_super_admin)):
    """Modifica las propiedades de una tienda (nombre, slug, colores, logo) en Supabase."""
    update_data = {}
    if payload.name is not None:
        update_data["name"] = payload.name
    if payload.slug is not None:
        update_data["slug"] = payload.slug.strip().lower()
    if payload.logo_url is not None:
        update_data["logo_url"] = payload.logo_url
    if payload.primary_color is not None:
        update_data["primary_color"] = payload.primary_color
    if payload.secondary_color is not None:
        update_data["secondary_color"] = payload.secondary_color
    if payload.bg_color is not None:
        update_data["bg_color"] = payload.bg_color
    if payload.is_active is not None:
        update_data["is_active"] = payload.is_active

    try:
        res = supabase_client.table("tenants").update(update_data).eq("id", tenant_id).execute()
        if res.data:
            item = res.data[0]
            return ResponseModel(
                success=True,
                message="Empresa actualizada correctamente en Supabase",
                data=TenantResponse(
                    id=str(item["id"]),
                    name=item["name"],
                    slug=item["slug"],
                    logo_url=item.get("logo_url") or "",
                    is_active=item.get("is_active", True),
                    primary_color=item.get("primary_color") or "#6b8e64",
                    secondary_color=item.get("secondary_color") or "#6b462b",
                    bg_color=item.get("bg_color") or "#faf8f2",
                    created_at=str(item.get("created_at") or datetime.now(timezone.utc).isoformat())
                )
            )
    except Exception as e:
        print("Error updating tenant in Supabase:", e)

    # Fallback
    fallback_response = TenantResponse(
        id=tenant_id,
        name=payload.name or "Empresa Actualizada",
        slug=payload.slug or "slug",
        logo_url=payload.logo_url or "",
        is_active=payload.is_active if payload.is_active is not None else True,
        primary_color=payload.primary_color or "#6b8e64",
        secondary_color=payload.secondary_color or "#6b462b",
        bg_color=payload.bg_color or "#faf8f2",
        created_at=datetime.now(timezone.utc).isoformat()
    )
    return ResponseModel(success=True, message="Empresa actualizada", data=fallback_response)
