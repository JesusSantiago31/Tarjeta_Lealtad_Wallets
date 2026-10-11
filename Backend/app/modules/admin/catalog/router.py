from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.modules.admin.catalog.schemas import (
    RewardItemCreateRequest,
    RewardItemUpdateRequest,
    RewardItemResponse
)
from app.common.models import ResponseModel
from app.core.middleware.tenant_security import get_current_tenant_id, get_current_user_data
from app.common.exceptions import UnauthorizedRoleException
from app.core.database import supabase_client

router = APIRouter(prefix="/admin/catalog", tags=["Admin - Catálogo de Recompensas"])

def require_tenant_admin():
    user = get_current_user_data()
    if not user or user.get("role") not in ["tenant_admin", "super_admin"]:
        raise UnauthorizedRoleException(required_role="tenant_admin")
    return user

@router.get("", response_model=ResponseModel[List[RewardItemResponse]])
async def list_rewards():
    """Obtiene la lista de productos de recompensa filtrados por el `tenant_id` de la empresa activa."""
    tenant_id = get_current_tenant_id()
    if not tenant_id:
        return ResponseModel(success=True, data=[])

    try:
        res = supabase_client.table("products").select("*").eq("tenant_id", tenant_id).eq("is_active", True).order("puntos_requeridos", desc=False).execute()
        if res.data:
            items = [
                RewardItemResponse(
                    id=str(p["id_prod"]),
                    tenant_id=tenant_id,
                    title=p["producto"],
                    description=f"Precio $ {p.get('precio', 0):.2f} MXN | Stock: {p.get('piezas_disponibles', 0)} pzas",
                    price=float(p.get("precio", 0.0)),
                    points_required=int(p.get("puntos_requeridos", 0)),
                    stock=int(p.get("piezas_disponibles", 0)),
                    image_url=p.get("imagen_url") or "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
                    is_active=p.get("is_active", True)
                ) for p in res.data
            ]
            return ResponseModel(success=True, data=items)
    except Exception as e:
        print(f"[AdminCatalog] Error fetching products from Supabase: {e}")

    return ResponseModel(success=True, data=[])

@router.post("", response_model=ResponseModel[RewardItemResponse])
async def create_reward(payload: RewardItemCreateRequest, user: dict = Depends(require_tenant_admin)):
    """Crea un nuevo producto de recompensa en la tabla `products` vinculado al `tenant_id`."""
    tenant_id = get_current_tenant_id() or user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID no identificado en la solicitud.")

    product_payload = {
        "tenant_id": tenant_id,
        "producto": payload.title,
        "precio": payload.price,
        "puntos_requeridos": payload.points_required,
        "piezas_disponibles": payload.stock,
        "imagen_url": payload.image_url or "https://images.unsplash.com/photo-1509042239860-f550ce710b93",
        "is_active": True
    }

    try:
        res = supabase_client.table("products").insert(product_payload).execute()
        if res.data:
            p = res.data[0]
            item = RewardItemResponse(
                id=str(p["id_prod"]),
                tenant_id=tenant_id,
                title=p["producto"],
                description=payload.description or f"Precio ${p.get('precio', 0):.2f} MXN",
                price=float(p.get("precio", 0.0)),
                points_required=int(p.get("puntos_requeridos", 0)),
                stock=int(p.get("piezas_disponibles", 0)),
                image_url=p.get("imagen_url"),
                is_active=True
            )
            return ResponseModel(success=True, message="Producto de recompensa creado con éxito en la base de datos", data=item)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error al guardar producto: {str(e)}")

    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo crear la recompensa.")

@router.put("/{product_id}", response_model=ResponseModel[RewardItemResponse])
async def update_reward(product_id: str, payload: RewardItemUpdateRequest, user: dict = Depends(require_tenant_admin)):
    """Actualiza un producto existente en la tabla `products` validando la pertenencia al `tenant_id`."""
    tenant_id = get_current_tenant_id() or user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID no identificado en la solicitud.")

    update_fields = {}
    if payload.title is not None:
        update_fields["producto"] = payload.title
    if payload.price is not None:
        update_fields["precio"] = payload.price
    if payload.points_required is not None:
        update_fields["puntos_requeridos"] = payload.points_required
    if payload.stock is not None:
        update_fields["piezas_disponibles"] = payload.stock
    if payload.image_url is not None:
        update_fields["imagen_url"] = payload.image_url
    if payload.is_active is not None:
        update_fields["is_active"] = payload.is_active

    try:
        res = supabase_client.table("products").update(update_fields).eq("id_prod", product_id).eq("tenant_id", tenant_id).execute()
        if res.data:
            p = res.data[0]
            item = RewardItemResponse(
                id=str(p["id_prod"]),
                tenant_id=tenant_id,
                title=p["producto"],
                description=f"Precio ${p.get('precio', 0):.2f} MXN",
                price=float(p.get("precio", 0.0)),
                points_required=int(p.get("puntos_requeridos", 0)),
                stock=int(p.get("piezas_disponibles", 0)),
                image_url=p.get("imagen_url"),
                is_active=p.get("is_active", True)
            )
            return ResponseModel(success=True, message="Producto actualizado con éxito", data=item)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error al actualizar producto: {str(e)}")

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado o no pertenece a este negocio.")

@router.delete("/{product_id}", response_model=ResponseModel[dict])
async def delete_reward(product_id: str, user: dict = Depends(require_tenant_admin)):
    """Elimina o desactiva un producto del catálogo de la empresa activa."""
    tenant_id = get_current_tenant_id() or user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID no identificado.")

    try:
        supabase_client.table("products").update({"is_active": False}).eq("id_prod", product_id).eq("tenant_id", tenant_id).execute()
        return ResponseModel(success=True, message="Producto eliminado del catálogo con éxito", data={"id": product_id})
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error al eliminar producto: {str(e)}")
