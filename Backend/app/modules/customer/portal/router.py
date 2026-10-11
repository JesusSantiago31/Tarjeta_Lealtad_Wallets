from fastapi import APIRouter, HTTPException, status
from app.modules.customer.portal.schemas import CustomerPortalCardResponse
from app.common.models import ResponseModel
from app.core.middleware.tenant_security import get_current_tenant_id, get_current_user_data
from app.core.database import supabase_client

router = APIRouter(prefix="/customer/portal", tags=["Customer - Portal Web y Tarjeta Digital"])

@router.get("/my-card", response_model=ResponseModel[CustomerPortalCardResponse])
async def get_my_digital_card():
    """Retorna los datos de la tarjeta web del cliente autenticado con saldos y paleta de marca del tenant."""
    user = get_current_user_data()
    tenant_id = get_current_tenant_id()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no autenticado.")

    user_id = user.get("sub") or user.get("id")
    tenant_id = tenant_id or user.get("tenant_id")

    # 1. Obtener datos del cliente en Supabase
    db_user = None
    try:
        res_u = supabase_client.table("users").select("*").eq("id", user_id).execute()
        if res_u.data:
            db_user = res_u.data[0]
            tenant_id = tenant_id or db_user.get("tenant_id")
    except Exception as e:
        print(f"[CustomerPortal] Error fetching user: {e}")

    # 2. Obtener datos de la empresa (tenant) en Supabase
    db_tenant = {}
    if tenant_id:
        try:
            res_t = supabase_client.table("tenants").select("*").eq("id", tenant_id).execute()
            if res_t.data:
                db_tenant = res_t.data[0]
        except Exception as e:
            print(f"[CustomerPortal] Error fetching tenant: {e}")

    full_name = "Cliente Lealtad"
    if db_user:
        first = db_user.get("first_name") or ""
        last = db_user.get("last_name") or ""
        full_name = f"{first} {last}".strip() or db_user.get("full_name") or user.get("full_name") or "Cliente Lealtad"

    loyalty_code = (db_user.get("loyalty_code") if db_user else None) or f"CARD-{str(user_id)[:8]}"

    # Buscar imagen de sello correspondiente en stamp_images si wallet_hero_image_url no está definida
    wallet_hero = db_user.get("wallet_hero_image_url") if db_user else None
    if not wallet_hero and db_user and tenant_id:
        try:
            current_stamps = int(db_user.get("current_stamps", 0))
            res_s = supabase_client.table("stamp_images").select("*").eq("tenant_id", tenant_id).eq("stamp_count", current_stamps).execute()
            if res_s.data:
                wallet_hero = res_s.data[0].get("wallet_hero_url") or res_s.data[0].get("image_url")
        except Exception as e:
            print(f"[CustomerPortal] Stamp lookup warning: {e}")

    card = CustomerPortalCardResponse(
        customer_id=str(user_id),
        card_number=loyalty_code,
        full_name=full_name,
        email=(db_user.get("email") if db_user else user.get("email")) or "",
        phone=(db_user.get("phone") if db_user else None),
        points_balance=float(db_user.get("current_points", 0)) if db_user else 0.0,
        stamps_balance=int(db_user.get("current_stamps", 0)) if db_user else 0,
        stamps_target=int(db_user.get("max_stamps", 10)) if db_user else 10,
        qr_code_value=loyalty_code,
        wallet_hero_image_url=wallet_hero,
        tenant_name=db_tenant.get("name") or "Cafetería Gourmet",
        logo_url=db_tenant.get("logo_url") or "",
        primary_color=db_tenant.get("primary_color") or "#788C5A",
        secondary_color=db_tenant.get("secondary_color") or "#CFD989",
        bg_color=db_tenant.get("bg_color") or "#FAF7F2",
        text_color=db_tenant.get("text_color") or "#734F2F"
    )
    return ResponseModel(success=True, data=card)
