from pydantic import BaseModel
from typing import Optional, List

class TransactionItemResponse(BaseModel):
    id: str
    tenant_id: str
    user_id: str
    transaction_type: str  # 'PURCHASE', 'REDEMPTION', 'ADJUSTMENT'
    purchase_amount: float = 0.0
    points_transacted: int = 0
    description: Optional[str] = None
    created_at: str
