"""
crud/accounts.py
================
Database access functions for Savings Plans, Savings Accounts, and Account Holders.
Corresponds to Member 3 responsibilities in MIMS.

Tables:
    - SAVINGSPLAN
    - SAVINGSACCOUNT
    - ACCOUNTHOLDER
    - CUSTOMER (read-only for age and holder validation)
"""

from datetime import date
from decimal import Decimal
from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
try:
    from models.account import AccountCreate
except ImportError:
    from backend.models.account import AccountCreate


# ---------------------------------------------------------------------------
# Helper: Age Calculation & Plan Eligibility
# ---------------------------------------------------------------------------
def calculate_age(dob: date) -> int:
    """Calculates age in years from date of birth."""
    today = date.today()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))


def validate_plan_eligibility(plan_name: str, dob: date) -> None:
    """
    Validates if a customer qualifies for a specific savings plan based on age criteria (SRS REQ-1.2):
        - Children: Under 13 years (age < 13)
        - Teen: 13 to 17 years (13 <= age <= 17)
        - Adult: 18 to 59 years (18 <= age <= 59)
        - Senior: 60 years and above (age >= 60)
        - Joint: No individual age restriction (requires minimum balance of 5,000)
    """
    age = calculate_age(dob)

    if plan_name == "Children":
        if age >= 13:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Eligibility check failed: Children plan is only for customers under 13 years old (Customer age: {age})."
            )
    elif plan_name == "Teen":
        if not (13 <= age <= 17):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Eligibility check failed: Teen plan is only for customers aged 13-17 (Customer age: {age})."
            )
    elif plan_name == "Adult":
        if not (18 <= age <= 59):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Eligibility check failed: Adult plan is only for customers aged 18-59 (Customer age: {age})."
            )
    elif plan_name == "Senior":
        if age < 60:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Eligibility check failed: Senior plan is only for customers 60 years and above (Customer age: {age})."
            )


# ---------------------------------------------------------------------------
# 1. Savings Plans
# ---------------------------------------------------------------------------
def get_all_plans(cursor) -> List[Dict[str, Any]]:
    """Retrieve all savings plans ordered by plan_id."""
    query = """
        SELECT plan_id, plan_name, interest_rate, minimum_balance
        FROM SAVINGSPLAN
        ORDER BY plan_id ASC
    """
    cursor.execute(query)
    return cursor.fetchall()


def get_plan_by_id(cursor, plan_id: int) -> Optional[Dict[str, Any]]:
    """Retrieve a single savings plan by plan_id."""
    query = """
        SELECT plan_id, plan_name, interest_rate, minimum_balance
        FROM SAVINGSPLAN
        WHERE plan_id = %s
    """
    cursor.execute(query, (plan_id,))
    return cursor.fetchone()


# ---------------------------------------------------------------------------
# 2. Savings Accounts: List & Retrieval
# ---------------------------------------------------------------------------
def get_accounts(
    cursor,
    account_status: Optional[str] = None,
    plan_id: Optional[int] = None
) -> List[Dict[str, Any]]:
    """
    List savings accounts with optional filters:
        - status: 'Active', 'Inactive', 'Closed'
        - plan_id: specific savings plan
    """
    query = """
        SELECT 
            sa.account_id,
            sa.plan_id,
            sp.plan_name,
            sa.account_number,
            sa.opened_date,
            sa.status,
            sa.current_balance
        FROM SAVINGSACCOUNT sa
        JOIN SAVINGSPLAN sp ON sa.plan_id = sp.plan_id
        WHERE 1=1
    """
    params = []

    if account_status:
        query += " AND sa.status = %s"
        params.append(account_status)

    if plan_id is not None:
        query += " AND sa.plan_id = %s"
        params.append(plan_id)

    query += " ORDER BY sa.account_id DESC"
    cursor.execute(query, tuple(params))
    return cursor.fetchall()


def get_account_by_id(cursor, account_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieve single savings account by account_id, including plan details
    and all linked account holders.
    """
    query = """
        SELECT 
            sa.account_id,
            sa.plan_id,
            sp.plan_name,
            sp.interest_rate,
            sp.minimum_balance,
            sa.account_number,
            sa.opened_date,
            sa.status,
            sa.current_balance
        FROM SAVINGSACCOUNT sa
        JOIN SAVINGSPLAN sp ON sa.plan_id = sp.plan_id
        WHERE sa.account_id = %s
    """
    cursor.execute(query, (account_id,))
    account = cursor.fetchone()
    if not account:
        return None

    # Retrieve all linked account holders
    holders_query = """
        SELECT 
            c.customer_id,
            c.full_name,
            c.national_id,
            c.dob,
            c.phone,
            c.email,
            c.customer_type
        FROM ACCOUNTHOLDER ah
        JOIN CUSTOMER c ON ah.customer_id = c.customer_id
        WHERE ah.account_id = %s
        ORDER BY c.customer_id ASC
    """
    cursor.execute(holders_query, (account_id,))
    account["holders"] = cursor.fetchall()

    return account


# ---------------------------------------------------------------------------
# 3. Open New Savings Account (POST /api/accounts)
# ---------------------------------------------------------------------------
def create_savings_account(cursor, data: AccountCreate) -> Dict[str, Any]:
    """
    Opens a new savings account:
        1. Verifies customer exists.
        2. Verifies plan exists.
        3. Validates customer age eligibility for the plan.
        4. Validates initial_deposit meets the plan's minimum balance.
        5. Generates unique account_number (e.g. SA-00015).
        6. Inserts into SAVINGSACCOUNT.
        7. Links customer as primary account holder in ACCOUNTHOLDER.
    """
    # 1. Fetch customer
    cursor.execute(
        "SELECT customer_id, full_name, dob, customer_type FROM CUSTOMER WHERE customer_id = %s",
        (data.customer_id,)
    )
    customer = cursor.fetchone()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {data.customer_id} does not exist."
        )

    # 2. Fetch plan
    plan = get_plan_by_id(cursor, data.plan_id)
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Savings plan with ID {data.plan_id} does not exist."
        )

    # 3. Validate Age Eligibility (Joint plan doesn't check age of single owner)
    if plan["plan_name"] != "Joint":
        validate_plan_eligibility(plan["plan_name"], customer["dob"])

    # 4. Validate Minimum Balance
    min_bal = Decimal(str(plan["minimum_balance"]))
    if data.initial_deposit < min_bal:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Initial deposit ({data.initial_deposit}) must be at least the minimum "
                f"required balance of LKR {min_bal} for '{plan['plan_name']}' plan."
            )
        )

    # 5. Generate Account Number (SA-00001, SA-00002, ...)
    cursor.execute("SELECT MAX(account_id) AS max_id FROM SAVINGSACCOUNT")
    row = cursor.fetchone()
    next_id = (row["max_id"] or 0) + 1
    account_number = f"SA-{next_id:05d}"

    # 6. Insert new account
    insert_sql = """
        INSERT INTO SAVINGSACCOUNT (plan_id, account_number, opened_date, status, current_balance)
        VALUES (%s, %s, CURDATE(), 'Active', %s)
    """
    cursor.execute(insert_sql, (data.plan_id, account_number, data.initial_deposit))
    new_account_id = cursor.lastrowid

    # 7. Insert into ACCOUNTHOLDER
    holder_sql = """
        INSERT INTO ACCOUNTHOLDER (account_id, customer_id)
        VALUES (%s, %s)
    """
    cursor.execute(holder_sql, (new_account_id, data.customer_id))

    # Return full created account details
    created_account = get_account_by_id(cursor, new_account_id)
    if not created_account:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Account created but could not be retrieved."
        )
    return created_account


# ---------------------------------------------------------------------------
# 4. Update Account Status (PATCH /api/accounts/{account_id}/status)
# ---------------------------------------------------------------------------
def update_account_status(cursor, account_id: int, new_status: str) -> Dict[str, Any]:
    """Updates account status to Active, Inactive, or Closed."""
    account = get_account_by_id(cursor, account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Savings account with ID {account_id} not found."
        )

    update_sql = "UPDATE SAVINGSACCOUNT SET status = %s WHERE account_id = %s"
    cursor.execute(update_sql, (new_status, account_id))

    updated_account = get_account_by_id(cursor, account_id)
    if not updated_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Savings account with ID {account_id} not found."
        )
    return updated_account


# ---------------------------------------------------------------------------
# 5. Account Holders (Joint Accounts)
# ---------------------------------------------------------------------------
def link_account_holder(cursor, account_id: int, customer_id: int) -> List[Dict[str, Any]]:
    """
    Links an additional customer to an existing savings account (Joint account holder).
    """
    # 1. Verify account exists
    account = get_account_by_id(cursor, account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Savings account with ID {account_id} not found."
        )

    # 2. Verify customer exists
    cursor.execute("SELECT customer_id FROM CUSTOMER WHERE customer_id = %s", (customer_id,))
    if not cursor.fetchone():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found."
        )

    # 3. Verify customer is not already linked
    check_sql = "SELECT 1 FROM ACCOUNTHOLDER WHERE account_id = %s AND customer_id = %s"
    cursor.execute(check_sql, (account_id, customer_id))
    if cursor.fetchone():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer ID {customer_id} is already linked to account ID {account_id}."
        )

    # 4. Insert link
    insert_sql = "INSERT INTO ACCOUNTHOLDER (account_id, customer_id) VALUES (%s, %s)"
    cursor.execute(insert_sql, (account_id, customer_id))

    return get_account_holders(cursor, account_id)


def get_account_holders(cursor, account_id: int) -> List[Dict[str, Any]]:
    """Lists all holders linked to the given savings account."""
    account = get_account_by_id(cursor, account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Savings account with ID {account_id} not found."
        )

    query = """
        SELECT 
            c.customer_id,
            c.full_name,
            c.national_id,
            c.dob,
            c.phone,
            c.email,
            c.customer_type
        FROM ACCOUNTHOLDER ah
        JOIN CUSTOMER c ON ah.customer_id = c.customer_id
        WHERE ah.account_id = %s
        ORDER BY c.customer_id ASC
    """
    cursor.execute(query, (account_id,))
    return cursor.fetchall()
