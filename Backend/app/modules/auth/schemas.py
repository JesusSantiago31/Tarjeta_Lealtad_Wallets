from pydantic import BaseModel, EmailStr
from typing import Optional
from app.common.models import UserRole

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    tenant_slug: Optional[str] = None

class RegisterCustomerRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    tenant_slug: str

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
