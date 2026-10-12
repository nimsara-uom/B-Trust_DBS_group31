from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from pydantic import BaseModel
from decimal import Decimal
import uuid
import mysql.connector

from database import get_db
from crud import customers as crud_customers
from models.customer import CustomerCreate

router = APIRouter(
    prefix="/customers",
    tags=["customers"]
)

class TransferRequest(BaseModel):
    from_account_id: int
    to_account_number: str
    amount: float
    description: Optional[str] = "Customer Online Transfer"

class ChangePasswordRequest(BaseModel):
    customer_id: int
    current_password: str
    new_password: str

@router.get("")
def list_customers(search: Optional[str] = None, db=Depends(get_db)):
    cursor, conn = db
    return crud_customers.get_customers(cursor, search)

@router.post("")
def create_customer(customer: CustomerCreate, db=Depends(get_db)):
    cursor, conn = db
    try:
        new_id = crud_customers.create_customer(cursor, customer)
        conn.commit()
        return {"message": "Customer created successfully", "customer_id": new_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/change-password")
def change_customer_password(data: ChangePasswordRequest, db=Depends(get_db)):
    """
    Allow customer to update their portal password:
    - If current password is null, current_password must match their national_id (NIC).
    - If current password is set, current_password must match the stored password.
    - After update, only the new password can be used; NIC is no longer accepted.
    """
    cursor, conn = db
    cust_id = data.customer_id
    curr_pwd = data.current_password.strip()
    new_pwd = data.new_password.strip()

    if len(new_pwd) < 4:
        raise HTTPException(status_code=400, detail="New password must be at least 4 characters long.")

    cursor.execute(
        "SELECT customer_id, national_id, password FROM CUSTOMER WHERE customer_id = %s",
        (cust_id,)
    )
    cust = cursor.fetchone()
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found.")

    stored_pwd = cust.get("password")
    is_valid_current = False

    from security import hash_password, verify_password

    if stored_pwd is not None and stored_pwd != "":
        is_valid_current = verify_password(curr_pwd, stored_pwd)
    else:
        # Default fallback to NIC
        import secrets
        nic = cust.get("national_id", "")
        is_valid_current = secrets.compare_digest(curr_pwd.upper().encode("utf8"), nic.upper().encode("utf8"))

    if not is_valid_current:
        raise HTTPException(status_code=400, detail="Current password is incorrect.")

    try:
        hashed_new_pwd = hash_password(new_pwd)
        cursor.execute(
            "UPDATE CUSTOMER SET password = %s WHERE customer_id = %s",
            (hashed_new_pwd, cust_id)
        )
        conn.commit()
        return {
            "status": "success",
            "message": "Password updated successfully."
        }
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update password: {str(e)}")

@router.get("/{customer_id}/portal")
def get_customer_portal_data(customer_id: int, db=Depends(get_db)):
    """
    Fetch comprehensive customer data for their portal:
    - Customer Profile
    - All their linked savings accounts & balances
    - Transaction history across their accounts
    - Their active fixed deposits
    - Available FD plans offered by the bank
    """
    if isinstance(db, tuple):
        cursor = db[0]
    else:
        cursor = db

    try:
        # 1. Profile
        cursor.execute(
            """
            SELECT c.customer_id, c.branch_id, c.agent_id, c.full_name, c.dob, c.national_id, 
                   c.phone, c.email, c.customer_type, b.branch_name, a.agent_name
            FROM CUSTOMER c
            LEFT JOIN BRANCH b ON c.branch_id = b.branch_id
            LEFT JOIN AGENT a ON c.agent_id = a.agent_id
            WHERE c.customer_id = %s
            """,
            (customer_id,)
        )
        profile = cursor.fetchone()
        if not profile:
            raise HTTPException(status_code=404, detail=f"Customer ID {customer_id} not found")

        # 2. Linked Savings Accounts
        cursor.execute(
            """
            SELECT sa.account_id, sa.plan_id, sp.plan_name, sp.interest_rate, sp.minimum_balance,
                   sa.account_number, sa.opened_date, sa.status, sa.current_balance
            FROM SAVINGSACCOUNT sa
            JOIN SAVINGSPLAN sp ON sa.plan_id = sp.plan_id
            JOIN ACCOUNTHOLDER ah ON sa.account_id = ah.account_id
            WHERE ah.customer_id = %s
            ORDER BY sa.account_id ASC
            """,
            (customer_id,)
        )
        accounts = cursor.fetchall() or []
        account_ids = [acc["account_id"] for acc in accounts]

        # 3. Recent Transactions across these accounts
        transactions = []
        if account_ids:
            format_strings = ','.join(['%s'] * len(account_ids))
            cursor.execute(
                f"""
                SELECT t.transaction_id, t.account_id, sa.account_number, t.agent_id, 
                       t.reference_no, t.transaction_type, t.amount, t.transaction_timestamp
                FROM BANK_TRANSACTION t
                JOIN SAVINGSACCOUNT sa ON t.account_id = sa.account_id
                WHERE t.account_id IN ({format_strings})
                ORDER BY t.transaction_timestamp DESC
                LIMIT 50
                """,
                tuple(account_ids)
            )
            transactions = cursor.fetchall() or []

        # 4. Active FDs linked to these accounts
        fds = []
        if account_ids:
            format_strings = ','.join(['%s'] * len(account_ids))
            cursor.execute(
                f"""
                SELECT fd.fd_id, fd.account_id, sa.account_number, fd.fd_plan_id, 
                       fp.term_months, fp.interest_rate,
                       fd.principal_amount, fd.start_date, fd.maturity_date, 
                       fd.next_interest_date, fd.status
                FROM FIXEDDEPOSIT fd
                JOIN FDPLAN fp ON fd.fd_plan_id = fp.fd_plan_id
                JOIN SAVINGSACCOUNT sa ON fd.account_id = sa.account_id
                WHERE fd.account_id IN ({format_strings})
                ORDER BY fd.fd_id DESC
                """,
                tuple(account_ids)
            )
            fds = cursor.fetchall() or []

        # 5. Bank's Available FD Plans
        cursor.execute(
            """
            SELECT fd_plan_id, term_months, interest_rate
            FROM FDPLAN
            ORDER BY term_months ASC
            """
        )
        fd_plans = cursor.fetchall() or []

        return {
            "profile": profile,
            "accounts": accounts,
            "transactions": transactions,
            "fixed_deposits": fds,
            "available_fd_plans": fd_plans
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/transfer")
def transfer_funds(data: TransferRequest, db=Depends(get_db)):
    """
    Online inter-account transfer initiated by a customer:
    1. Debits sender account via sp_ProcessWithdrawal (checking minimum balance).
    2. Credits receiver account via sp_ProcessDeposit.
    """
    cursor, conn = db
    amount = Decimal(str(data.amount))
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Transfer amount must be greater than zero.")

    try:
        # Check source account
        cursor.execute(
            "SELECT account_id, account_number, current_balance, status FROM SAVINGSACCOUNT WHERE account_id = %s",
            (data.from_account_id,)
        )
        src_account = cursor.fetchone()
        if not src_account:
            raise HTTPException(status_code=404, detail="Source account not found.")
        if src_account["status"] != "Active":
            raise HTTPException(status_code=400, detail="Source account is not active.")

        # Check destination account by account_number
        cursor.execute(
            "SELECT account_id, account_number, status FROM SAVINGSACCOUNT WHERE account_number = %s",
            (data.to_account_number.strip(),)
        )
        dest_account = cursor.fetchone()
        if not dest_account:
            raise HTTPException(status_code=404, detail=f"Destination account '{data.to_account_number}' not found.")
        if dest_account["account_id"] == src_account["account_id"]:
            raise HTTPException(status_code=400, detail="Source and destination accounts cannot be the same.")
        if dest_account["status"] != "Active":
            raise HTTPException(status_code=400, detail="Destination account is not active.")

        # Resolve an agent ID to associate with the transaction (online agent or first agent)
        cursor.execute("SELECT agent_id FROM AGENT ORDER BY agent_id ASC LIMIT 1")
        agent_row = cursor.fetchone()
        agent_id = agent_row["agent_id"] if agent_row else 1

        transfer_code = uuid.uuid4().hex[:8].upper()
        ref_debit = f"TRF-OUT-{transfer_code}"
        ref_credit = f"TRF-IN-{transfer_code}"

        # 1. Debit from source account
        cursor.callproc(
            "sp_ProcessWithdrawal",
            [src_account["account_id"], agent_id, float(amount), ref_debit]
        )

        # 2. Credit to destination account
        cursor.callproc(
            "sp_ProcessDeposit",
            [dest_account["account_id"], agent_id, float(amount), ref_credit]
        )

        conn.commit()

        return {
            "status": "success",
            "message": f"Successfully transferred LKR {amount:,.2f} to {dest_account['account_number']}",
            "reference_code": transfer_code,
            "amount": float(amount),
            "from_account": src_account["account_number"],
            "to_account": dest_account["account_number"]
        }

    except mysql.connector.Error as e:
        conn.rollback()
        # Trigger failure: minimum balance check
        if e.sqlstate == "45000":
            raise HTTPException(status_code=400, detail=str(e.msg))
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))


