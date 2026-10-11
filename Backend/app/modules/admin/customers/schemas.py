from pydantic import BaseModel
from typing import Optional

class CustomerCreateRequest(BaseModel):
    first_name: str
    last_name: Optional[str] = ""
    phone: Optional[str] = None
    email: Optional[str] = None
    initial_points: Optional[int] = 0

class CustomerUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    current_points: Optional[int] = None

class CustomerItemResponse(BaseModel):
    id: str
    first_name: str
    last_name: Optional[str] = ""
    full_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    loyalty_code: str
    current_points: int
    current_stamps: int
    created_at: str
