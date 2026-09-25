from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from mysql.connector import Error

from backend.database import get_db
from backend.models.fixed_deposit import (
    FixedDepositCreate,
    FixedDepositResponse,
    InterestEngineRunRequest
)
from backend.crud import fixed_deposits as crud_fd

router = APIRouter(prefix = "/fixed-deposits", tags = ["Fixed Deposits"])

@router.get("/plans", summary = "List all FD plans")
def list_fd_plans(db = Depends(get_db)):
    cursor, conn = db
    try:
        plans = crud_fd.get_fd_plans(cursor)
        return plans
    except Error as e:
        raise HTTPException(status_code = 500, detail = str(e))

@router.get("", response_model = List[FixedDepositResponse], summary = "List all fixed deposits")
def list_fixed_deposits(
    status: Optional[str] = None,
    account_id: Optional[int] = None,
    db = Depends(get_db)
):
    cursor, conn = db
    try:
        fds = crud_fd.get_fixed_deposits(cursor, status = status, account_id = account_id)
        return fds
    except Error as e:
        raise HTTPException(status_code = 500, detail = str(e))

@router.post("/interest-engine/run", summary = "Run monthly interest engine")
def run_interest_engine(data: InterestEngineRunRequest, db = Depends(get_db)):
    cursor, conn = db
    try:
        result = crud_fd.run_monthly_engine(cursor, data.p_RunDate, data.p_SystemAgentID)
        conn.commit()
        return result
    except Error as e:
        conn.rollback()
        raise HTTPException(status_code = 400, detail = str(e))
    
@router.get("/{fd_id}", response_model = FixedDepositResponse, summary = "Get fixed deposit by ID")
def get_fixed_deposit(fd_id: int, db = Depends(get_db)):
    cursor, conn = db
    try:
        fd = crud_fd.get_fixed_deposit_by_id(cursor, fd_id)
        if not fd:
            raise HTTPException(status_code = 404, detail="Fixed deposit not found")
        return fd
    except Error as e:
        raise HTTPException(status_code = 500, detail = str(e))

@router.post("", response_model = FixedDepositResponse, status_code = status.HTTP_201_CREATED, summary = "Open a new fixed deposit")
def create_fixed_deposit(data: FixedDepositCreate, db = Depends(get_db)):
    cursor, conn = db
    try:
        fd_id = crud_fd.create_fixed_deposit(cursor, data)
        conn.commit()
        fd = crud_fd.get_fixed_deposit_by_id(cursor, fd_id)

        if not fd:
            raise HTTPException(
                status_code = 500,
                detail="Fixed deposit was created but could not be retrieved"
            )

        return fd

    except ValueError as e:
        conn.rollback()
        raise HTTPException(
            status_code = 400,
            detail = str(e)
        )
    
    except Error as e:
        conn.rollback()
        # Handle MySQL unique constraint violation (one FD per account rule)
        if e.errno == 1062 or "UNIQUE" in str(e):
            raise HTTPException(
                status_code = 400, 
                detail="Violation of one-FD-per-account rule: This savings account already has an active fixed deposit."
            )
        raise HTTPException(status_code = 400, detail = str(e))