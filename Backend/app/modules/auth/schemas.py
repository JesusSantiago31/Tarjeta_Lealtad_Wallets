from pydantic import BaseModel
from typing import Optional
from app.common.models import UserRole

class LoginRequest(BaseModel):
    email: str
    password: str
    tenant_slug: Optional[str] = None

class RegisterCustomerRequest(BaseModel):
    phone: str
    full_name: str
    password: str
    tenant_slug: str
    email: Optional[str] = None

class TenantPublicBrandingResponse(BaseModel):
    id: str
    name: str
    slug: str
    primary_color: str = "#6b8e64"
    secondary_color: str = "#6b462b"
    bg_color: str = "#faf8f2"
    text_color: str = "#2b261f"
    logo_url: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    role: UserRole
    tenant_id: Optional[str]
    tenant_slug: Optional[str]
    tenant_name: Optional[str]
    theme: Optional[dict] = None
