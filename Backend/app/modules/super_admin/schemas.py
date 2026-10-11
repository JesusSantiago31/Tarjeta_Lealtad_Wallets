from pydantic import BaseModel
from typing import Optional

class TenantCreateRequest(BaseModel):
    name: str
    slug: str
    logo_url: Optional[str] = ""
    primary_color: Optional[str] = "#6b8e64"
    secondary_color: Optional[str] = "#6b462b"
    bg_color: Optional[str] = "#faf8f2"
    admin_email: Optional[str] = None
    admin_name: Optional[str] = None

class TenantResponse(BaseModel):
    id: str
    name: str
    slug: str
    logo_url: Optional[str] = ""
    is_active: bool
    primary_color: str
    secondary_color: str
    bg_color: str
    created_at: str
