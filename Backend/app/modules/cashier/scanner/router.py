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

def get_customer_tenant_balance(customer: dict, tenant_id: str):
    """
    Calcula los puntos y sellos que el cliente tiene ESPECÍFICAMENTE en este tenant,
    permitiendo que la misma tarjeta sirva para múltiples empresas manteniendo balances separados.
    """
    customer_id = customer["id"]
    try:
        res_txs = (
            supabase_client.table("transactions")
            .select("points_transacted, description")
            .eq("user_id", customer_id)
            .eq("tenant_id", tenant_id)
            .execute()
        )
        if res_txs.data and len(res_txs.data) > 0:
            total_points = sum(int(t.get("points_transacted") or 0) for t in res_txs.data)
            total_stamps = 0
            for t in res_txs.data:
                desc = t.get("description") or ""
                if "Sello(s) otorgado(s): +" in desc:
                    try:
                        part = desc.split("Sello(s) otorgado(s): +")[1].split(" ")[0]
                        total_stamps += int(part)
                    except:
                        pass
                elif "CANJE SELLOS" in desc:
                    try:
                        total_stamps = 0
                    except:
                        pass
            max_stamps = int(customer.get("max_stamps", 10))
            return max(0, total_points), min(max_stamps, max(0, total_stamps))
        elif str(customer.get("tenant_id")) == str(tenant_id):
            return int(customer.get("current_points", 0)), int(customer.get("current_stamps", 0))
        else:
            return 0, 0
    except Exception as e:
        print(f"[CashierScanner] Error calculating tenant balance: {e}")
        if str(customer.get("tenant_id")) == str(tenant_id):
            return int(customer.get("current_points", 0)), int(customer.get("current_stamps", 0))
        return 0, 0

@router.post("/search", response_model=ResponseModel[CustomerCardInfoResponse])
async def search_customer(payload: ScanCustomerRequest, user: dict = Depends(require_cashier)):
    """
    Busca al cliente por código QR, teléfono o correo en la red de empresas.
    Calcula dinámicamente los puntos y sellos correspondientes al negocio del cajero.
    """
    tenant_id = get_current_tenant_id() or user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID no identificado en la solicitud.")

    query_str = payload.query.strip()
    clean_num = query_str.replace("QR-", "")
    qr_code = f"QR-{clean_num}"

    try:
        # Búsqueda universal del cliente por teléfono, loyalty_code o email
        res = (
            supabase_client.table("users")
            .select("*")
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

            # Balances específicos para la empresa del cajero
            pts_bal, stp_bal = get_customer_tenant_balance(c, tenant_id)

            card_info = CustomerCardInfoResponse(
                customer_id=str(c["id"]),
                card_number=c.get("loyalty_code") or f"CARD-{str(c['id'])[:8]}",
                full_name=full_name,
                email=c.get("email") or "",
                phone=c.get("phone") or "",
                points_balance=float(pts_bal),
                stamps_balance=int(stp_bal),
                stamps_target=int(c.get("max_stamps", 10)),
                wallet_hero_image_url=c.get("wallet_hero_image_url")
            )
            return ResponseModel(success=True, data=card_info)
    except Exception as e:
        print(f"[CashierScanner] Error searching customer in Supabase: {e}")

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"No se encontró ningún cliente registrado con el código o teléfono '{payload.query}'."
    )
