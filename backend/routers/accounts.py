"""
routers/accounts.py
===================
API Route endpoints for Savings Plans, Savings Accounts, and Joint Account Holders.
Corresponds to Member 3 responsibilities in MIMS.

Endpoints implemented:
    - GET   /api/plans                    -> List all savings plans (Children, Teen, Adult, Senior, Joint)
    - GET   /api/accounts                 -> List all accounts (filter by ?status=Active, ?plan_id=)
    - GET   /api/accounts/{account_id}    -> Get account details + holders + current balance
    - POST  /api/accounts                 -> Open a new savings account (validates plan eligibility)
    - PATCH /api/accounts/{account_id}/status -> Update account status (Active/Inactive/Closed)
    - POST  /api/accounts/{account_id}/holders -> Link a customer to a joint account
    - GET   /api/accounts/{account_id}/holders -> List all holders of an account
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

# Safe imports supporting both relative/direct and package-level execution
try:
    from database import get_db
except ImportError:
    from backend.database import get_db

try:
    from models.account import (
        SavingsPlanResponse,
        AccountResponse,
        AccountDetailResponse,
        AccountCreate,
        AccountStatusUpdate,
        AccountHolderLink,
        AccountHolderResponse,
    )
except ImportError:
    from backend.models.account import (
        SavingsPlanResponse,
        AccountResponse,
        AccountDetailResponse,
        AccountCreate,
        AccountStatusUpdate,
        AccountHolderLink,
        AccountHolderResponse,
    )

try:
    from crud import accounts as crud_accounts
except ImportError:
    from backend.crud import accounts as crud_accounts


# Helper to safely extract cursor whether get_db yields cursor or (cursor, connection)
def _get_cursor(db):
    if isinstance(db, tuple):
        return db[0]
    return db


# Initialize router for Member 3
router = APIRouter(tags=["Savings Accounts & Plans"])


# ---------------------------------------------------------------------------
# 1. Savings Plans
# ---------------------------------------------------------------------------
@router.get(
    "/api/plans",
    response_model=List[SavingsPlanResponse],
    summary="List all savings plans",
    description="Returns all available savings plans (Children, Teen, Adult, Senior, Joint) with interest rates and minimum balances."
)
@router.get("/plans", response_model=List[SavingsPlanResponse], include_in_schema=False)
def list_plans(db=Depends(get_db)):
    cursor = _get_cursor(db)
    return crud_accounts.get_all_plans(cursor)


# ---------------------------------------------------------------------------
# 2. Savings Accounts: List & Filter
# ---------------------------------------------------------------------------
@router.get(
    "/api/accounts",
    response_model=List[AccountResponse],
    summary="List all savings accounts",
    description="Retrieve all savings accounts with optional filters by status (Active/Inactive/Closed) and plan_id."
)
@router.get("/accounts", response_model=List[AccountResponse], include_in_schema=False)
def list_accounts(
    status: Optional[str] = Query(None, description="Filter by status: Active, Inactive, Closed"),
    plan_id: Optional[int] = Query(None, description="Filter by plan ID"),
    db=Depends(get_db)
):
    cursor = _get_cursor(db)
    return crud_accounts.get_accounts(cursor, account_status=status, plan_id=plan_id)


# ---------------------------------------------------------------------------
# 3. Savings Account: Get by ID
# ---------------------------------------------------------------------------
@router.get(
    "/api/accounts/{account_id}",
    response_model=AccountDetailResponse,
    summary="Get savings account details by ID",
    description="Returns full account details including current balance, plan tier, and all linked holders."
)
@router.get("/accounts/{account_id}", response_model=AccountDetailResponse, include_in_schema=False)
def get_account_by_id(account_id: int, db=Depends(get_db)):
    cursor = _get_cursor(db)
    account = crud_accounts.get_account_by_id(cursor, account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Savings account with ID {account_id} not found."
        )
    return account


# ---------------------------------------------------------------------------
# 4. Open New Savings Account (Plan Eligibility Validated)
# ---------------------------------------------------------------------------
@router.post(
    "/api/accounts",
    response_model=AccountDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Open a new savings account",
    description="Validates customer age eligibility based on selected plan (Children < 13, Teen 13-17, Adult 18-59, Senior 60+) and enforces minimum deposit."
)
@router.post("/accounts", response_model=AccountDetailResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def open_account(data: AccountCreate, db=Depends(get_db)):
    cursor = _get_cursor(db)
    return crud_accounts.create_savings_account(cursor, data)


# ---------------------------------------------------------------------------
# 5. Update Account Status
# ---------------------------------------------------------------------------
@router.patch(
    "/api/accounts/{account_id}/status",
    response_model=AccountDetailResponse,
    summary="Update account status",
    description="Update account status to Active, Inactive, or Closed."
)
@router.patch("/accounts/{account_id}/status", response_model=AccountDetailResponse, include_in_schema=False)
def update_status(account_id: int, data: AccountStatusUpdate, db=Depends(get_db)):
    cursor = _get_cursor(db)
    return crud_accounts.update_account_status(cursor, account_id, data.status)


# ---------------------------------------------------------------------------
# 6. Joint Accounts: Link Holder
# ---------------------------------------------------------------------------
@router.post(
    "/api/accounts/{account_id}/holders",
    response_model=List[AccountHolderResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Link customer to joint account",
    description="Adds an additional customer as a holder to the specified savings account."
)
@router.post("/accounts/{account_id}/holders", response_model=List[AccountHolderResponse], status_code=status.HTTP_201_CREATED, include_in_schema=False)
def add_holder(account_id: int, data: AccountHolderLink, db=Depends(get_db)):
    cursor = _get_cursor(db)
    return crud_accounts.link_account_holder(cursor, account_id, data.customer_id)


# ---------------------------------------------------------------------------
# 7. Joint Accounts: List Holders
# ---------------------------------------------------------------------------
@router.get(
    "/api/accounts/{account_id}/holders",
    response_model=List[AccountHolderResponse],
    summary="List all holders of an account",
    description="Returns all customer profiles linked as account holders for the given account ID."
)
@router.get("/accounts/{account_id}/holders", response_model=List[AccountHolderResponse], include_in_schema=False)
def list_holders(account_id: int, db=Depends(get_db)):
    cursor = _get_cursor(db)
    return crud_accounts.get_account_holders(cursor, account_id)
