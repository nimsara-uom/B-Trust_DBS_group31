from pydantic import BaseModel, Field
from datetime import datetime
from decimal import Decimal
from typing import Optional


class DepositRequest(BaseModel):
    account_id: int = Field(..., description="ID of the savings account to deposit into")
    agent_id: int = Field(..., description="ID of the agent processing this deposit")
    amount: Decimal = Field(..., gt=0, description="Amount to deposit (must be > 0)")
    reference_no: str = Field(..., max_length=30, description="Unique reference number for this transaction")


class WithdrawalRequest(BaseModel):
    account_id: int = Field(..., description="ID of the savings account to withdraw from")
    agent_id: int = Field(..., description="ID of the agent processing this withdrawal")
    amount: Decimal = Field(..., gt=0, description="Amount to withdraw (must be > 0, overdrafts not allowed)")
    reference_no: str = Field(..., max_length=30, description="Unique reference number for this transaction")


class TransactionResponse(BaseModel):
    transaction_id: int
    account_id: int
    agent_id: int
    fd_id: Optional[int]
    reference_no: str
    transaction_type: str  # Deposit, Withdrawal, FD_Interest
    amount: Decimal
    transaction_timestamp: datetime

    class Config:
        from_attributes = True
