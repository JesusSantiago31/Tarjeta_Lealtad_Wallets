from fastapi import APIRouter, Depends, HTTPException, status
from app.modules.cashier.accumulation.schemas import (
    AccumulatePointsRequest,
    AccumulateStampsRequest,
    RedeemRewardRequest,
    TransactionResultResponse
)
from app.common.models import ResponseModel
from app.core.middleware.tenant_security import get_current_tenant_id, get_current_user_data
from app.common.exceptions import UnauthorizedRoleException
from app.core.database import supabase_client

router = APIRouter(prefix="/cashier/accumulation", tags=["Cashier (POS) - Acumulación y Canje Independiente"])

def require_cashier():
    user = get_current_user_data()
    if not user or user.get("role") not in ["cashier", "tenant_admin", "super_admin"]:
        raise UnauthorizedRoleException(required_role="cashier")
    return user

@router.post("/points", response_model=ResponseModel[TransactionResultResponse])
async def accumulate_points(payload: AccumulatePointsRequest, user: dict = Depends(require_cashier)):
    """Acumula puntos por monto consumido o directo filtrando por el tenant_id del cajero."""
    tenant_id = get_current_tenant_id() or user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID no identificado en la solicitud.")

    # 1. Obtener usuario cliente
    res_user = supabase_client.table("users").select("*").eq("id", payload.customer_id).eq("tenant_id", tenant_id).execute()
    if not res_user.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado en este negocio.")
    
    customer = res_user.data[0]
    pts_to_add = 0

    if payload.mode == "direct":
        pts_to_add = payload.direct_points or 0
    else:
        # Consulta de la regla activa en points_rules
        res_rule = supabase_client.table("points_rules").select("*").eq("tenant_id", tenant_id).eq("is_active", True).execute()
        if res_rule.data:
            rule = res_rule.data[0]
            monto_dinero = float(rule.get("monto_dinero") or 10.0)
            puntos_otorgados = int(rule.get("puntos_otorgados") or 1)
            if monto_dinero > 0:
                pts_to_add = int((payload.amount_spent or 0.0) // monto_dinero) * puntos_otorgados
        else:
            pts_to_add = int((payload.amount_spent or 0.0) // 10.0)

    new_points = int(customer.get("current_points", 0)) + pts_to_add
    new_earned = int(customer.get("total_points_earned", 0)) + pts_to_add

    # 2. Actualizar Usuario
    supabase_client.table("users").update({
        "current_points": new_points,
        "total_points_earned": new_earned,
        "total_purchases_count": int(customer.get("total_purchases_count", 0)) + 1
    }).eq("id", payload.customer_id).execute()

    # 3. Registrar Transacción
    res_tx = supabase_client.table("transactions").insert({
        "tenant_id": tenant_id,
        "user_id": payload.customer_id,
        "cashier_id": user.get("sub") or user.get("id"),
        "transaction_type": "PURCHASE",
        "purchase_amount": float(payload.amount_spent or 0.0),
        "points_transacted": pts_to_add,
        "description": payload.notes or f"Acumulación de +{pts_to_add} pts por compra de ${(payload.amount_spent or 0.0):.2f} MXN"
    }).execute()

    tx_id = str(res_tx.data[0]["id"]) if res_tx.data else "tx-pts-ok"

    res = TransactionResultResponse(
        transaction_id=tx_id,
        customer_id=payload.customer_id,
        transaction_type="ACCUMULATE_POINTS",
        new_points_balance=float(new_points),
        new_stamps_balance=int(customer.get("current_stamps", 0)),
        stamps_target=int(customer.get("max_stamps", 10))
    )
    return ResponseModel(success=True, message=f"Se acumularon +{pts_to_add} puntos correctamente", data=res)

@router.post("/stamps", response_model=ResponseModel[TransactionResultResponse])
async def accumulate_stamps(payload: AccumulateStampsRequest, user: dict = Depends(require_cashier)):
    """Control independiente de sellos (0 a 10 sellos) actualizando automáticamente el banner de Google Wallet."""
    tenant_id = get_current_tenant_id() or user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID no identificado en la solicitud.")

    res_user = supabase_client.table("users").select("*").eq("id", payload.customer_id).eq("tenant_id", tenant_id).execute()
    if not res_user.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado.")

    customer = res_user.data[0]
    current_stamps = int(customer.get("current_stamps", 0))
    max_stamps = int(customer.get("max_stamps", 10))
    new_stamps = min(max_stamps, max(0, current_stamps + payload.stamps_to_add))
    unlocked = new_stamps >= max_stamps

    # Buscar banner del nivel correspondiente en stamp_images
    new_hero_url = customer.get("wallet_hero_image_url")
    try:
        res_stamp_img = supabase_client.table("stamp_images").select("*").eq("tenant_id", tenant_id).eq("stamp_count", new_stamps).execute()
        if res_stamp_img.data:
            img_row = res_stamp_img.data[0]
            new_hero_url = img_row.get("wallet_hero_url") or img_row.get("image_url") or new_hero_url
    except Exception as e:
        print(f"[CashierAccumulation] Stamp image lookup warning: {e}")

    # Actualizar Usuario
    supabase_client.table("users").update({
        "current_stamps": new_stamps,
        "total_stamps_earned": int(customer.get("total_stamps_earned", 0)) + max(0, payload.stamps_to_add),
        "wallet_hero_image_url": new_hero_url
    }).eq("id", payload.customer_id).execute()

    # Registrar Transacción
    res_tx = supabase_client.table("transactions").insert({
        "tenant_id": tenant_id,
        "user_id": payload.customer_id,
        "cashier_id": user.get("sub") or user.get("id"),
        "transaction_type": "ADJUSTMENT",
        "purchase_amount": float(payload.amount_spent or 0.0),
        "points_transacted": 0,
        "description": payload.notes or f"Sello(s) otorgado(s): +{payload.stamps_to_add} (Total: {new_stamps}/{max_stamps})"
    }).execute()

    tx_id = str(res_tx.data[0]["id"]) if res_tx.data else "tx-stp-ok"

    res = TransactionResultResponse(
        transaction_id=tx_id,
        customer_id=payload.customer_id,
        transaction_type="ACCUMULATE_STAMPS",
        new_points_balance=float(customer.get("current_points", 0)),
        new_stamps_balance=new_stamps,
        stamps_target=max_stamps,
        reward_unlocked=unlocked,
        wallet_hero_image_url=new_hero_url
    )
    msg = f"Se añadieron +{payload.stamps_to_add} sello(s)" if not unlocked else "¡Felicidades! Se ha completado la tarjeta de sellos"
    return ResponseModel(success=True, message=msg, data=res)

@router.post("/redeem", response_model=ResponseModel[TransactionResultResponse])
async def redeem_reward(payload: RedeemRewardRequest, user: dict = Depends(require_cashier)):
    """Procesa el canje directo o por ticket QR de canje (REDEMP:telefono:producto_id)."""
    tenant_id = get_current_tenant_id() or user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID no identificado en la solicitud.")

    target_product_id = payload.reward_item_id

    # Si se escaneó un código QR tipo REDEMP:telefono:producto_id
    if payload.qr_code_redemption and "REDEMP:" in payload.qr_code_redemption:
        parts = payload.qr_code_redemption.split(":")
        if len(parts) >= 3:
            target_product_id = parts[2]

    if not target_product_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Producto de recompensa no especificado.")

    # 1. Obtener Usuario
    res_user = supabase_client.table("users").select("*").eq("id", payload.customer_id).eq("tenant_id", tenant_id).execute()
    if not res_user.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente no encontrado.")

    customer = res_user.data[0]
    current_pts = int(customer.get("current_points", 0))

    # 2. Obtener Producto
    res_prod = supabase_client.table("products").select("*").eq("id_prod", target_product_id).eq("tenant_id", tenant_id).execute()
    if not res_prod.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto de recompensa no encontrado.")

    prod = res_prod.data[0]
    pts_req = int(prod.get("puntos_requeridos", 0))
    current_stock = int(prod.get("piezas_disponibles", 0))

    if current_pts < pts_req:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Puntos insuficientes ({current_pts} pts disponibles, el producto requiere {pts_req} pts)."
        )

    new_pts = current_pts - pts_req

    # Descontar puntos al usuario
    supabase_client.table("users").update({
        "current_points": new_pts,
        "total_points_spent": int(customer.get("total_points_spent", 0)) + pts_req
    }).eq("id", payload.customer_id).execute()

    # Descontar 1 pieza del stock si es mayor a 0
    if current_stock > 0:
        supabase_client.table("products").update({
            "piezas_disponibles": current_stock - 1
        }).eq("id_prod", target_product_id).execute()

    # Registrar Transacción REDEMPTION
    res_tx = supabase_client.table("transactions").insert({
        "tenant_id": tenant_id,
        "user_id": payload.customer_id,
        "cashier_id": user.get("sub") or user.get("id"),
        "transaction_type": "REDEMPTION",
        "purchase_amount": 0.00,
        "points_transacted": -pts_req,
        "description": f"Canje de recompensa: {prod.get('producto', 'Producto')}"
    }).execute()

    tx_id = str(res_tx.data[0]["id"]) if res_tx.data else "tx-rdm-ok"

    res = TransactionResultResponse(
        transaction_id=tx_id,
        customer_id=payload.customer_id,
        transaction_type="REDEEM_REWARD",
        new_points_balance=float(new_pts),
        new_stamps_balance=int(customer.get("current_stamps", 0)),
        stamps_target=int(customer.get("max_stamps", 10))
    )
    return ResponseModel(success=True, message=f"Se canjeó '{prod.get('producto')}' con éxito por {pts_req} pts", data=res)
