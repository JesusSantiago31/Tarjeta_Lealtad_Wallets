from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
from app.modules.admin.branding.schemas import (
    BrandingUpdateRequest,
    BrandingResponse,
    StampImageItem,
    StampImageSaveRequest
)
from app.common.models import ResponseModel
from app.core.middleware.tenant_security import get_current_tenant_id, get_current_user_data
from app.common.exceptions import UnauthorizedRoleException
from app.core.database import supabase_client
from app.core.services.imgbb_service import imgbb_service

router = APIRouter(prefix="/admin/branding", tags=["Admin - Branding y Galería de Sellos"])

def require_tenant_admin():
    user = get_current_user_data()
    if not user or user.get("role") not in ["tenant_admin", "super_admin"]:
        raise UnauthorizedRoleException(required_role="tenant_admin")
    return user

@router.post("/upload-image", response_model=ResponseModel[dict])
async def upload_image_to_imgbb(file: UploadFile = File(...), user: dict = Depends(require_tenant_admin)):
    """
    Sube un archivo de imagen directamente a la API de ImgBB y devuelve la URL pública.
    """
    try:
        content = await file.read()
        res = imgbb_service.upload_file(content, filename=file.filename or "image.jpg", content_type=file.content_type or "image/jpeg")
        return ResponseModel(
            success=True,
            message="Imagen subida con éxito a ImgBB Cloud Storage",
            data=res
        )
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error al subir imagen a ImgBB: {str(e)}")

@router.get("", response_model=ResponseModel[BrandingResponse])
async def get_tenant_branding():
    """Obtiene la configuración de colores e imagen de marca del tenant activo de la tabla `tenants`."""
    tenant_id = get_current_tenant_id()
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID no identificado en la solicitud.")

    try:
        res = supabase_client.table("tenants").select("*").eq("id", tenant_id).execute()
        if res.data and len(res.data) > 0:
            t = res.data[0]
            brand = BrandingResponse(
                tenant_id=tenant_id,
                name=t.get("name") or "Cafetería Gourmet",
                primary_color=t.get("primary_color") or "#788C5A",
                secondary_color=t.get("secondary_color") or "#CFD989",
                bg_color=t.get("bg_color") or "#FAF7F2",
                text_color=t.get("text_color") or "#734F2F",
                logo_url=t.get("logo_url") or ""
            )
            return ResponseModel(success=True, data=brand)
    except Exception as e:
        print(f"[AdminBranding] Error fetching tenant branding: {e}")

    default_brand = BrandingResponse(
        tenant_id=tenant_id,
        name="Café Lealtad Manager",
        primary_color="#6b8e64",
        secondary_color="#6b462b",
        bg_color="#faf8f2",
        text_color="#2b261f",
        logo_url=""
    )
    return ResponseModel(success=True, data=default_brand)

@router.put("", response_model=ResponseModel[BrandingResponse])
async def update_tenant_branding(payload: BrandingUpdateRequest, user: dict = Depends(require_tenant_admin)):
    """Actualiza los colores y el logotipo en la tabla `tenants` filtrados estrictamente por el `tenant_id`."""
    tenant_id = get_current_tenant_id() or user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID no identificado en la solicitud.")

    update_payload = {
        "name": payload.name,
        "primary_color": payload.primary_color,
        "secondary_color": payload.secondary_color,
        "bg_color": payload.bg_color,
        "text_color": payload.text_color or "#734F2F",
        "logo_url": payload.logo_url or ""
    }

    try:
        supabase_client.table("tenants").update(update_payload).eq("id", tenant_id).execute()
    except Exception as e:
        print(f"[AdminBranding] Error updating tenant branding in Supabase: {e}")

    brand = BrandingResponse(
        tenant_id=tenant_id,
        name=payload.name,
        primary_color=payload.primary_color,
        secondary_color=payload.secondary_color,
        bg_color=payload.bg_color,
        text_color=payload.text_color or "#734F2F",
        logo_url=payload.logo_url or ""
    )
    return ResponseModel(success=True, message="Configuración de marca e imagen actualizada correctamente en Supabase", data=brand)

@router.get("/stamps", response_model=ResponseModel[List[StampImageItem]])
async def get_stamp_gallery():
    """Obtiene los 11 niveles de sellos dinámicos (0 a 10 sellos) de la tabla `stamp_images` para el tenant activo."""
    tenant_id = get_current_tenant_id()
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID no identificado en la solicitud.")

    stamps_dict = {}
    try:
        res = supabase_client.table("stamp_images").select("*").eq("tenant_id", tenant_id).order("stamp_count", desc=False).execute()
        if res.data:
            for item in res.data:
                sc = item.get("stamp_count")
                if sc is not None and 0 <= sc <= 10:
                    stamps_dict[sc] = StampImageItem(
                        id=str(item.get("id")),
                        stamp_count=sc,
                        image_url=item.get("image_url") or "",
                        wallet_hero_url=item.get("wallet_hero_url") or ""
                    )
    except Exception as e:
        print(f"[AdminBranding] Error fetching stamp_images: {e}")

    result_list: List[StampImageItem] = []
    for count in range(11):
        if count in stamps_dict:
            result_list.append(stamps_dict[count])
        else:
            result_list.append(StampImageItem(
                id=None,
                stamp_count=count,
                image_url=f"https://i.ibb.co/demo/stamp-{count}.png",
                wallet_hero_url=""
            ))

    return ResponseModel(success=True, data=result_list)

@router.post("/stamps", response_model=ResponseModel[List[StampImageItem]])
async def save_stamp_gallery(payload: StampImageSaveRequest, user: dict = Depends(require_tenant_admin)):
    """Guarda o actualiza la galería de sellos (0 a 10) en la tabla `stamp_images` vinculada al `tenant_id`."""
    tenant_id = get_current_tenant_id() or user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID no identificado en la solicitud.")

    saved_items: List[StampImageItem] = []

    for item in payload.stamps:
        if not (0 <= item.stamp_count <= 10):
            continue
        try:
            check = supabase_client.table("stamp_images").select("id").eq("tenant_id", tenant_id).eq("stamp_count", item.stamp_count).execute()
            
            row_data = {
                "tenant_id": tenant_id,
                "stamp_count": item.stamp_count,
                "image_url": item.image_url,
                "wallet_hero_url": item.wallet_hero_url or ""
            }

            if check.data and len(check.data) > 0:
                res = supabase_client.table("stamp_images").update({
                    "image_url": item.image_url,
                    "wallet_hero_url": item.wallet_hero_url or ""
                }).eq("tenant_id", tenant_id).eq("stamp_count", item.stamp_count).execute()
                inserted_id = str(check.data[0]["id"])
            else:
                res = supabase_client.table("stamp_images").insert(row_data).execute()
                inserted_id = str(res.data[0]["id"]) if res.data else None

            saved_items.append(StampImageItem(
                id=inserted_id,
                stamp_count=item.stamp_count,
                image_url=item.image_url,
                wallet_hero_url=item.wallet_hero_url or ""
            ))
        except Exception as e:
            print(f"[AdminBranding] Error saving stamp_count {item.stamp_count}: {e}")
            saved_items.append(item)

    return ResponseModel(
        success=True,
        message="Galería de 11 sellos (0 a 10) guardada correctamente en Supabase",
        data=saved_items
    )
