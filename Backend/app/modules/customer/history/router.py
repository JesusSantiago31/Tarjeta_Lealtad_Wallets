from fastapi import APIRouter, HTTPException, status
from typing import List
from app.modules.customer.history.schemas import TransactionItemResponse
from app.common.models import ResponseModel
from app.core.middleware.tenant_security import get_current_tenant_id, get_current_user_data
from app.core.database import supabase_client

router = APIRouter(prefix="/customer/history", tags=["Customer - Historial de Transacciones"])

@router.get("", response_model=ResponseModel[List[TransactionItemResponse]])
async def get_my_history():
    """Retorna el historial de transacciones (compras, acumulación de sellos/puntos y canjes) del cliente autenticado."""
    user = get_current_user_data()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario no autenticado.")

    user_id = user.get("sub") or user.get("id")
    tenant_id = get_current_tenant_id() or user.get("tenant_id")

    try:
        query = supabase_client.table("transactions").select("*").eq("user_id", user_id).order("created_at", desc=True)
        if tenant_id:
            query = query.eq("tenant_id", tenant_id)
        
        res = query.execute()
        if res.data:
            txs = [
                TransactionItemResponse(
                    id=str(t["id"]),
                    tenant_id=str(t["tenant_id"]),
                    user_id=str(t["user_id"]),
                    transaction_type=t.get("transaction_type", "PURCHASE"),
                    purchase_amount=float(t.get("purchase_amount", 0.0)),
                    points_transacted=int(t.get("points_transacted", 0)),
                    description=t.get("description") or "Transacción de lealtad",
                    created_at=str(t.get("created_at"))
                ) for t in res.data
            ]
            return ResponseModel(success=True, data=txs)
    except Exception as e:
        print(f"[CustomerHistory] Error fetching transactions from Supabase: {e}")

    return ResponseModel(success=True, data=[])
