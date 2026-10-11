from fastapi import HTTPException, status

class TenantNotFoundException(HTTPException):
    def __init__(self, tenant_id: str = ""):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Empresa/Tenant '{tenant_id}' no encontrado o inactivo."
        )

class UnauthorizedRoleException(HTTPException):
    def __init__(self, required_role: str = ""):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Acceso denegado. Se requiere rol '{required_role}' para realizar esta acción."
        )

class InsufficientBalanceException(HTTPException):
    def __init__(self, resource_type: str = "puntos"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Balance insuficiente de {resource_type} para realizar el canje."
        )
