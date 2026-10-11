from pydantic import BaseModel, Field
from typing import Optional

class PointsRuleUpdateRequest(BaseModel):
    monto_dinero: float = Field(gt=0, description="Monto en dinero ($ MXN) necesario para ganar puntos")
    puntos_otorgados: int = Field(gt=0, description="Puntos otorgados por cada monto_dinero gastado")
    descripcion: Optional[str] = Field(None, description="Descripción opcional de la regla de equivalencia")

class PointsRuleResponse(BaseModel):
    id: Optional[str] = None
    tenant_id: str
    monto_dinero: float
    puntos_otorgados: int
    descripcion: Optional[str] = None
    is_active: bool = True
