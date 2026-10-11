from pydantic import BaseModel, Field
from typing import Optional

class AccumulatePointsRequest(BaseModel):
    customer_id: str = Field(..., description="UUID del cliente")
    mode: str = Field("amount", description="Modalidad: 'amount' (por monto $ MXN) o 'direct' (puntos directos)")
    amount_spent: Optional[float] = Field(0.0, ge=0, description="Monto consumido en $ MXN")
    direct_points: Optional[int] = Field(0, ge=0, description="Puntos directos a ingresar manualmente")
    notes: Optional[str] = Field(None, description="Notas opcionales de la venta")

class AccumulateStampsRequest(BaseModel):
    customer_id: str = Field(..., description="UUID del cliente")
    stamps_to_add: int = Field(1, description="Cantidad de sellos a sumar (ej: 0, 1, 2)")
    amount_spent: Optional[float] = Field(0.0, ge=0, description="Monto consumido opcional")
    notes: Optional[str] = Field(None, description="Notas opcionales")

class RedeemRewardRequest(BaseModel):
    customer_id: str = Field(..., description="UUID del cliente")
    reward_item_id: Optional[str] = Field(None, description="ID del producto de recompensa a canjear")
    qr_code_redemption: Optional[str] = Field(None, description="Código de ticket QR de canje (REDEMP:telefono:producto_id)")

class TransactionResultResponse(BaseModel):
    transaction_id: str
    customer_id: str
    transaction_type: str
    new_points_balance: float
    new_stamps_balance: int
    stamps_target: int = 10
    reward_unlocked: bool = False
    wallet_hero_image_url: Optional[str] = None
