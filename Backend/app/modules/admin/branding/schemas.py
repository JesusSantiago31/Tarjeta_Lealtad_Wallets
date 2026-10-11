from pydantic import BaseModel, Field
from typing import Optional, List

class BrandingUpdateRequest(BaseModel):
    name: str = Field(..., description="Nombre comercial de la empresa")
    primary_color: str = Field(..., description="Color primario en código Hex (ej: #788C5A)")
    secondary_color: str = Field(..., description="Color secundario en código Hex (ej: #CFD989)")
    bg_color: str = Field(..., description="Color de fondo en código Hex (ej: #FAF7F2)")
    text_color: Optional[str] = Field("#734F2F", description="Color de texto principal Hex")
    logo_url: Optional[str] = Field("", description="URL de la imagen del logotipo de la empresa")

class BrandingResponse(BaseModel):
    tenant_id: str
    name: str
    primary_color: str
    secondary_color: str
    bg_color: str
    text_color: str
    logo_url: str

class StampImageItem(BaseModel):
    id: Optional[str] = None
    stamp_count: int = Field(ge=0, le=10, description="Nivel de sello de 0 a 10")
    image_url: str = Field(..., description="URL de imagen ImgBB para la tarjeta web")
    wallet_hero_url: Optional[str] = Field(None, description="URL de imagen Hero para Google Wallet")

class StampImageSaveRequest(BaseModel):
    stamps: List[StampImageItem]
