from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
import mysql.connector

from database import get_db
from models.transaction import DepositRequest, WithdrawalRequest, TransactionResponse
from crud import transactions as crud_txn

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.post(
    "/deposit",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Make a deposit",
    description="Process a deposit into a savings account via `sp_ProcessDeposit`. "
                "The account balance is updated automatically by `trg_update_balance`."
)
def deposit(data: DepositRequest, db=Depends(get_db)):
    cursor, conn = db
    try:
        crud_txn.process_deposit(
            cursor,
            data.account_id,
            data.agent_id,
            data.amount,
            data.reference_no
        )
        conn.commit()

        # Fetch the newly created transaction by reference number
        cursor.execute(
            "SELECT * FROM bank_transaction WHERE reference_no = %s",
            (data.reference_no,)
        )
        txn = cursor.fetchone()
        if not txn:
            raise HTTPException(status_code=500, detail="Deposit was processed but transaction record not found.")
        return txn

    except mysql.connector.Error as e:
        conn.rollback()
        # Duplicate reference number
        if e.errno == 1062:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Reference number '{data.reference_no}' already exists. Use a unique reference number."
            )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/withdraw",
    response_model=TransactionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Make a withdrawal",
    description="Process a withdrawal from a savings account via `sp_ProcessWithdrawal`. "
                "The trigger `trg_check_withdrawal` blocks overdrafts and minimum balance violations automatically."
)
def withdraw(data: WithdrawalRequest, db=Depends(get_db)):
    cursor, conn = db
    try:
        crud_txn.process_withdrawal(
            cursor,
            data.account_id,
            data.agent_id,
            data.amount,
            data.reference_no
        )
        conn.commit()

        # Fetch the newly created transaction by reference number
        cursor.execute(
            "SELECT * FROM bank_transaction WHERE reference_no = %s",
            (data.reference_no,)
        )
        txn = cursor.fetchone()
        if not txn:
            raise HTTPException(status_code=500, detail="Withdrawal was processed but transaction record not found.")
        return txn

    except mysql.connector.Error as e:
        conn.rollback()
        # SQLSTATE 45000 = custom trigger error (overdraft / minimum balance violation)
        if e.sqlstate == "45000":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=str(e.msg)
            )
        # Duplicate reference number
        if e.errno == 1062:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Reference number '{data.reference_no}' already exists. Use a unique reference number."
            )
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get(
    "",
    response_model=List[TransactionResponse],
    summary="List transactions",
    description="Retrieve transactions with optional filters: "
                "`account_id`, `type` (Deposit | Withdrawal | FD_Interest), `from_date`, `to_date` (YYYY-MM-DD)."
)
def list_transactions(
    account_id: Optional[int] = None,
    type: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    db=Depends(get_db)
):
    cursor, conn = db
    try:
        txns = crud_txn.get_transactions(
            cursor,
            account_id=account_id,
            transaction_type=type,
            from_date=from_date,
            to_date=to_date
        )
        return txns
    except mysql.connector.Error as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get(
    "/{transaction_id}",
    response_model=TransactionResponse,
    summary="Get transaction by ID"
)
def get_transaction(transaction_id: int, db=Depends(get_db)):
    cursor, conn = db
    try:
        txn = crud_txn.get_transaction_by_id(cursor, transaction_id)
        if not txn:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Transaction {transaction_id} not found."
            )
        return txn
    except mysql.connector.Error as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
