from pydantic import BaseModel, Field
from typing import Optional

class RewardItemCreateRequest(BaseModel):
    title: str = Field(..., description="Nombre del producto o recompensa")
    description: Optional[str] = Field(None, description="Descripción corta del producto")
    price: float = Field(0.0, ge=0, description="Precio comercial ($ MXN)")
    points_required: int = Field(..., ge=0, description="Puntos necesarios para el canje")
    stock: int = Field(100, ge=0, description="Piezas disponibles en inventario")
    image_url: Optional[str] = Field(None, description="URL de la imagen del producto")

class RewardItemUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    points_required: Optional[int] = None
    stock: Optional[int] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None

class RewardItemResponse(BaseModel):
    id: str
    tenant_id: str
    title: str
    description: Optional[str] = None
    price: float = 0.0
    points_required: int = 0
    stock: int = 0
    image_url: Optional[str] = None
    is_active: bool = True
