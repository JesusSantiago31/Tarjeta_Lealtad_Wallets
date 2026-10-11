from fastapi import APIRouter, Depends, HTTPException, status
from app.modules.cashier.scanner.schemas import ScanCustomerRequest, CustomerCardInfoResponse
from app.common.models import ResponseModel
from app.core.middleware.tenant_security import get_current_tenant_id, get_current_user_data
from app.common.exceptions import UnauthorizedRoleException
from app.core.database import supabase_client

router = APIRouter(prefix="/cashier/scanner", tags=["Cashier (POS) - Escaneo y Búsqueda de Cliente"])

def require_cashier():
    user = get_current_user_data()
    if not user or user.get("role") not in ["cashier", "tenant_admin", "super_admin"]:
        raise UnauthorizedRoleException(required_role="cashier")
    return user

@router.post("/search", response_model=ResponseModel[CustomerCardInfoResponse])
async def search_customer(payload: ScanCustomerRequest, user: dict = Depends(require_cashier)):
    """Busca al cliente por código QR, teléfono o correo electrónico filtrando estrictamente por el tenant_id del cajero."""
    tenant_id = get_current_tenant_id() or user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID no identificado en la solicitud.")

    query_str = payload.query.strip()
    clean_num = query_str.replace("QR-", "")
    qr_code = f"QR-{clean_num}"

    try:
        res = (
            supabase_client.table("users")
            .select("*")
            .eq("tenant_id", tenant_id)
            .or_(
                f"phone.eq.{clean_num},"
                f"phone.eq.{query_str},"
                f"loyalty_code.eq.{query_str},"
                f"loyalty_code.eq.{qr_code},"
                f"email.ilike.%{query_str}%"
            )
            .execute()
        )

        if res.data and len(res.data) > 0:
            c = res.data[0]
            first_name = c.get("first_name") or ""
            last_name = c.get("last_name") or ""
            full_name = f"{first_name} {last_name}".strip() or c.get("full_name") or "Cliente"

            card_info = CustomerCardInfoResponse(
                customer_id=str(c["id"]),
                card_number=c.get("loyalty_code") or f"CARD-{str(c['id'])[:8]}",
                full_name=full_name,
                email=c.get("email") or "",
                phone=c.get("phone") or "",
                points_balance=float(c.get("current_points", 0)),
                stamps_balance=int(c.get("current_stamps", 0)),
                stamps_target=int(c.get("max_stamps", 10)),
                wallet_hero_image_url=c.get("wallet_hero_image_url")
            )
            return ResponseModel(success=True, data=card_info)
    except Exception as e:
        print(f"[CashierScanner] Error searching customer in Supabase: {e}")

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"No se encontró ningún cliente registrado con el código o teléfono '{payload.query}' en este negocio."
    )
