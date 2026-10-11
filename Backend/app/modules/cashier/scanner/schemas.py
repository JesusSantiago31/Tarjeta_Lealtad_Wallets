from pydantic import BaseModel, Field
from typing import Optional

class ScanCustomerRequest(BaseModel):
    query: str = Field(..., description="Número de teléfono, correo electrónico o código QR (ej: QR-5512345678)")

class CustomerCardInfoResponse(BaseModel):
    customer_id: str
    card_number: str
    full_name: str
    email: str
    phone: Optional[str] = None
    points_balance: float = 0.0
    stamps_balance: int = 0
    stamps_target: int = 10
    wallet_hero_image_url: Optional[str] = None
