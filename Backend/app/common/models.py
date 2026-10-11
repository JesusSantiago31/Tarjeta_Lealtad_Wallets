from pydantic import BaseModel, Field
from typing import Optional, Generic, TypeVar, List
from enum import Enum

T = TypeVar('T')

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    TENANT_ADMIN = "tenant_admin"
    CASHIER = "cashier"
    CUSTOMER = "customer"

class ResponseModel(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operación realizada con éxito"
    data: Optional[T] = None

class ErrorResponseModel(BaseModel):
    success: bool = False
    message: str
    error_code: str
    details: Optional[dict] = None
