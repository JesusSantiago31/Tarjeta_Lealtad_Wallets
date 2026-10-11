from pydantic import BaseModel
from typing import Optional

class CustomerPortalCardResponse(BaseModel):
    customer_id: str
    card_number: str
    full_name: str
    email: str
    phone: Optional[str] = None
    points_balance: float = 0.0
    stamps_balance: int = 0
    stamps_target: int = 10
    qr_code_value: str
    wallet_hero_image_url: Optional[str] = None
    tenant_name: str
    logo_url: Optional[str] = None
    primary_color: str = "#788C5A"
    secondary_color: str = "#CFD989"
    bg_color: str = "#FAF7F2"
    text_color: str = "#734F2F"
