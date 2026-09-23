from pydantic import BaseModel, Field
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

class FixedDepositCreate(BaseModel):
    account_id: int = Field(..., description = "Savings account ID (must have only 1 active FD)")
    fd_plan_id: int = Field(..., description = "ID of the Fixed Deposit plan (e.g., 6m, 1yr, 3yr)")
    principal_amount: float = Field(..., gt=0, description = "Principal deposit amount")

class FixedDepositResponse(BaseModel):
    fd_id: int
    account_id: int
    fd_plan_id: int
    principal_amount: Decimal
    start_date: date
    maturity_date: date
    next_interest_date: date
    status: str  # Active, Matured, Closed
    interest_rate: float
    term_months: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InterestEngineRunRequest(BaseModel):
    p_RunDate: date = Field(..., description = "The processing date for monthly interest calculation (YYYY-MM-DD)")
    p_SystemAgentID: int = Field(..., description = "ID of the agent running the engine")