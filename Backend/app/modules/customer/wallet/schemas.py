from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class GoogleWalletPassRequest(BaseModel):
    customer_id: str = Field(..., description="UUID del cliente")
    card_number: str = Field(..., description="Código de lealtad o teléfono")

class GoogleWalletLocation(BaseModel):
    kind: str = "walletobjects#latLongPoint"
    latitude: float = 19.432608  # Coordenadas predeterminadas (ej: CDMX / Store)
    longitude: float = -99.133208

class GoogleWalletPassResponse(BaseModel):
    save_url: str
    pass_class_id: str
    pass_object_id: str
    hero_image_url: Optional[str] = None
    locations: List[Dict[str, Any]] = []
    messages: List[Dict[str, Any]] = []
