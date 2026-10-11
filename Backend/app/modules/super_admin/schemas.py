from pydantic import BaseModel
from typing import Optional, List

class TenantCreateRequest(BaseModel):
    name: str
    slug: str
    primary_color: Optional[str] = "#4f46e5"
    secondary_color: Optional[str] = "#06b6d4"
    bg_color: Optional[str] = "#0f172a"
    admin_email: str
    admin_name: str

class TenantResponse(BaseModel):
    id: str
    name: str
    slug: str
    is_active: bool
    primary_color: str
    secondary_color: str
    bg_color: str
    created_at: str
