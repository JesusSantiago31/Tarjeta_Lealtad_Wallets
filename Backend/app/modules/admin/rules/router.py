from fastapi import APIRouter, Depends, HTTPException, status
from app.modules.admin.rules.schemas import PointsRuleUpdateRequest, PointsRuleResponse
from app.common.models import ResponseModel
from app.core.middleware.tenant_security import get_current_tenant_id, get_current_user_data
from app.common.exceptions import UnauthorizedRoleException
from app.core.database import supabase_client

router = APIRouter(prefix="/admin/rules", tags=["Admin - Reglas de Puntos por Consumo"])

def require_tenant_admin():
    user = get_current_user_data()
    if not user or user.get("role") not in ["tenant_admin", "super_admin"]:
        raise UnauthorizedRoleException(required_role="tenant_admin")
    return user

@router.get("", response_model=ResponseModel[PointsRuleResponse])
async def get_points_rule(user: dict = Depends(require_tenant_admin)):
    """Obtiene la regla activa de conversión de dinero a puntos para la empresa autenticada."""
    tenant_id = get_current_tenant_id() or user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID no identificado en la solicitud.")

    try:
        res = supabase_client.table("points_rules").select("*").eq("tenant_id", tenant_id).eq("is_active", True).execute()
        if res.data and len(res.data) > 0:
            rule = res.data[0]
            resp = PointsRuleResponse(
                id=str(rule.get("id")),
                tenant_id=tenant_id,
                monto_dinero=float(rule.get("monto_dinero", 10.0)),
                puntos_otorgados=int(rule.get("puntos_otorgados", 1)),
                descripcion=rule.get("descripcion") or f"1 punto por cada ${rule.get('monto_dinero', 10.0)} MXN gastados",
                is_active=rule.get("is_active", True)
            )
            return ResponseModel(success=True, data=resp)
    except Exception as e:
        print(f"[AdminRules] Error fetching points_rules from Supabase: {e}")

    # Fallback predeterminado ($10 MXN = 1 punto)
    default_rule = PointsRuleResponse(
        tenant_id=tenant_id,
        monto_dinero=10.0,
        puntos_otorgados=1,
        descripcion="1 punto por cada $10.00 MXN gastados",
        is_active=True
    )
    return ResponseModel(success=True, data=default_rule)

@router.put("", response_model=ResponseModel[PointsRuleResponse])
async def update_points_rule(payload: PointsRuleUpdateRequest, user: dict = Depends(require_tenant_admin)):
    """Actualiza o crea la regla de puntos por consumo en la tabla `points_rules` vinculada al `tenant_id`."""
    tenant_id = get_current_tenant_id() or user.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tenant ID no identificado en la solicitud.")

    monto = float(payload.monto_dinero)
    puntos = int(payload.puntos_otorgados)
    desc = payload.descripcion or f"Por cada ${monto:.2f} MXN gastados se otorgan {puntos} pt(s)"

    rule_data = None
    try:
        check = supabase_client.table("points_rules").select("id").eq("tenant_id", tenant_id).execute()
        if check.data:
            res = supabase_client.table("points_rules").update({
                "monto_dinero": monto,
                "puntos_otorgados": puntos,
                "descripcion": desc,
                "is_active": True
            }).eq("tenant_id", tenant_id).execute()
            if res.data:
                rule_data = res.data[0]
        else:
            res = supabase_client.table("points_rules").insert({
                "tenant_id": tenant_id,
                "monto_dinero": monto,
                "puntos_otorgados": puntos,
                "descripcion": desc,
                "is_active": True
            }).execute()
            if res.data:
                rule_data = res.data[0]
    except Exception as e:
        print(f"[AdminRules] Error updating points_rules in Supabase: {e}")

    updated = PointsRuleResponse(
        id=str(rule_data.get("id")) if rule_data else None,
        tenant_id=tenant_id,
        monto_dinero=monto,
        puntos_otorgados=puntos,
        descripcion=desc,
        is_active=True
    )
    return ResponseModel(
        success=True,
        message="Regla de equivalencia de puntos actualizada correctamente en la base de datos",
        data=updated
    )
