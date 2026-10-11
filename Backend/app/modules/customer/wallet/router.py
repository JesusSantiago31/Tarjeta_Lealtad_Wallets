from fastapi import APIRouter, HTTPException, status
from app.modules.customer.wallet.schemas import GoogleWalletPassRequest, GoogleWalletPassResponse
from app.common.models import ResponseModel
from app.core.services.google_wallet_service import google_wallet_service
from app.core.database import supabase_client
from app.core.middleware.tenant_security import get_current_tenant_id, get_current_user_data

router = APIRouter(prefix="/customer/wallet", tags=["Customer - Google Wallet Digital Passes"])

@router.post("/generate-pass", response_model=ResponseModel[GoogleWalletPassResponse])
async def generate_google_wallet_pass(payload: GoogleWalletPassRequest):
    """
    Genera el enlace JWT firmado oficial 'Save to Google Pay / Google Wallet'
    utilizando las variables dinámicas de CAFETERIA y la clave RS256 de Google Cloud.
    """
    user_data = get_current_user_data() or {}
    tenant_id = get_current_tenant_id() or user_data.get("tenant_id")

    # 1. Consultar usuario completo en Supabase
    db_user = None
    try:
        res_u = supabase_client.table("users").select("*").eq("id", payload.customer_id).execute()
        if res_u.data:
            db_user = res_u.data[0]
            tenant_id = tenant_id or db_user.get("tenant_id")
    except Exception as e:
        print(f"[GoogleWalletRouter] Error fetching user: {e}")

    user_dict = db_user or {
        "id": payload.customer_id,
        "phone": payload.card_number,
        "loyalty_code": payload.card_number,
        "first_name": user_data.get("full_name", "Cliente").split()[0],
        "last_name": "",
        "current_points": 0,
        "current_stamps": 0,
        "max_stamps": 10,
        "total_purchases_count": 0,
        "tenant_id": tenant_id
    }

    wallet_res = google_wallet_service.generate_pass_for_user(user_dict)

    data = GoogleWalletPassResponse(
        save_url=wallet_res["save_url"],
        pass_class_id=wallet_res["pass_class_id"],
        pass_object_id=wallet_res["pass_object_id"],
        hero_image_url=wallet_res.get("hero_image_url"),
        locations=wallet_res.get("locations", []),
        messages=wallet_res.get("messages", [])
    )

    return ResponseModel(
        success=True,
        message="Enlace oficial de Google Wallet generado con éxito",
        data=data
    )
