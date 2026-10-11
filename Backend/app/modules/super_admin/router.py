from fastapi import APIRouter, HTTPException, Depends
from typing import List
from app.modules.super_admin.schemas import TenantCreateRequest, TenantResponse
from app.common.models import ResponseModel
from app.core.middleware.tenant_security import get_current_user_data
from app.common.exceptions import UnauthorizedRoleException

router = APIRouter(prefix="/super-admin", tags=["Super Admin Global Management"])

def require_super_admin():
    user = get_current_user_data()
    if not user or user.get("role") != "super_admin":
        raise UnauthorizedRoleException(required_role="super_admin")
    return user

@router.get("/tenants", response_model=ResponseModel[List[TenantResponse]])
async def list_tenants(user: dict = Depends(require_super_admin)):
    """Lista todas las empresas / tenants registradas en la plataforma."""
    demo_tenants = [
        TenantResponse(
            id="00000000-0000-0000-0000-000000000001",
            name="Demo Coffee Roasters",
            slug="demo-cafe",
            is_active=True,
            primary_color="#6366f1",
            secondary_color="#14b8a6",
            bg_color="#0f172a",
            created_at="2026-10-01T12:00:00Z"
        ),
        TenantResponse(
            id="00000000-0000-0000-0000-000000000002",
            name="Boutique Bakery",
            slug="boutique-bakery",
            is_active=True,
            primary_color="#ec4899",
            secondary_color="#f59e0b",
            bg_color="#18181b",
            created_at="2026-10-05T15:30:00Z"
        )
    ]
    return ResponseModel(success=True, data=demo_tenants)

@router.post("/tenants", response_model=ResponseModel[TenantResponse])
async def create_tenant(payload: TenantCreateRequest, user: dict = Depends(require_super_admin)):
    """Crea un nuevo tenant y aprovisiona su admin de empresa."""
    new_tenant = TenantResponse(
        id="00000000-0000-0000-0000-000000000003",
        name=payload.name,
        slug=payload.slug,
        is_active=True,
        primary_color=payload.primary_color or "#4f46e5",
        secondary_color=payload.secondary_color or "#06b6d4",
        bg_color=payload.bg_color or "#0f172a",
        created_at="2026-10-10T12:00:00Z"
    )
    return ResponseModel(success=True, message="Empresa/Tenant creada con éxito", data=new_tenant)
