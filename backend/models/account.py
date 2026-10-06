"""
models/account.py
=================
Pydantic schemas for Savings Plans, Savings Accounts, and Account Holders.
Corresponds to Member 3 responsibilities in MIMS.

DB Tables involved:
    SAVINGSPLAN:
        plan_id         INT AUTO_INCREMENT PK
        plan_name       VARCHAR(50) UNIQUE ('Children', 'Teen', 'Adult', 'Senior', 'Joint')
        interest_rate   DECIMAL(5, 2)
        minimum_balance DECIMAL(12, 2)

    SAVINGSACCOUNT:
        account_id      INT AUTO_INCREMENT PK
        plan_id         INT NOT NULL FK -> SAVINGSPLAN(plan_id)
        account_number  VARCHAR(20) NOT NULL UNIQUE
        opened_date     DATE NOT NULL
        status          ENUM('Active', 'Inactive', 'Closed') DEFAULT 'Active'
        current_balance DECIMAL(12, 2) DEFAULT 0.00

    ACCOUNTHOLDER:
        account_id      INT NOT NULL FK -> SAVINGSACCOUNT(account_id)
        customer_id     INT NOT NULL FK -> CUSTOMER(customer_id)
        PRIMARY KEY (account_id, customer_id)
"""

from datetime import date
from decimal import Decimal
from typing import Literal, Optional, List
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# 1. Savings Plan Schema
# ---------------------------------------------------------------------------
class SavingsPlanResponse(BaseModel):
    """Returned when listing savings plans (GET /api/plans)."""
    plan_id: int
    plan_name: str
    interest_rate: Decimal
    minimum_balance: Decimal

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 2. Account Creation Schema
# ---------------------------------------------------------------------------
class AccountCreate(BaseModel):
    """
    Request body for opening a new savings account (POST /api/accounts).
    The system validates customer age eligibility based on the selected plan.
    """
    customer_id: int = Field(gt=0, description="Customer ID of the primary account owner")
    plan_id: int = Field(gt=0, description="Plan ID (1=Children, 2=Teen, 3=Adult, 4=Senior, 5=Joint)")
    initial_deposit: Decimal = Field(
        ...,
        ge=Decimal("0.00"),
        description="Initial deposit amount (must be >= minimum balance for the plan)"
    )


# ---------------------------------------------------------------------------
# 3. Account Status Update Schema
# ---------------------------------------------------------------------------
class AccountStatusUpdate(BaseModel):
    """Request body for updating account status (PATCH /api/accounts/{account_id}/status)."""
    status: Literal["Active", "Inactive", "Closed"] = Field(
        ...,
        description="New account status: Active, Inactive, or Closed"
    )


# ---------------------------------------------------------------------------
# 4. Account Holder Link Schema
# ---------------------------------------------------------------------------
class AccountHolderLink(BaseModel):
    """Request body for linking a customer to an account (POST /api/accounts/{account_id}/holders)."""
    customer_id: int = Field(gt=0, description="Customer ID to link as an account holder")


# ---------------------------------------------------------------------------
# 5. Account Holder Response Schema
# ---------------------------------------------------------------------------
class AccountHolderResponse(BaseModel):
    """Customer details when listed as an account holder."""
    customer_id: int
    full_name: str
    national_id: str
    dob: date
    phone: str
    email: Optional[str] = None
    customer_type: str

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 6. Basic Account Response Schema
# ---------------------------------------------------------------------------
class AccountResponse(BaseModel):
    """Returned when listing accounts (GET /api/accounts)."""
    account_id: int
    plan_id: int
    plan_name: Optional[str] = None
    account_number: str
    opened_date: date
    status: str
    current_balance: Decimal

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# 7. Detailed Account Response Schema (Includes Holders & Plan details)
# ---------------------------------------------------------------------------
class AccountDetailResponse(AccountResponse):
    """Returned when retrieving single account details (GET /api/accounts/{account_id})."""
    interest_rate: Optional[Decimal] = None
    minimum_balance: Optional[Decimal] = None
    holders: List[AccountHolderResponse] = []

    model_config = {"from_attributes": True}
