from datetime import date
from dateutil.relativedelta import relativedelta

def get_fd_plans(cursor):
    cursor.execute("""
    select *
        from FDPLAN 
        order by term_months""")
    return cursor.fetchall()

#get fixeddeposits by custom filters
def get_fixed_deposits(cursor, status = None, account_id = None):
    query = """
        select 
            fd.fd_id,
            fd.account_id,
            fd.fd_plan_id,
            fd.principal_amount,
            fd.start_date,
            fd.maturity_date,
            fd.next_interest_date,
            fd.status,
            fp.interest_rate,
            fp.term_months
        from FIXEDDEPOSIT fd
            join FDPLAN fp on fd.fd_plan_id = fp.fd_plan_id
        where 1 = 1 """
    params = []

    if status:
        query += " and fd.status = %s"
        params.append(status)

    if account_id is not None:
        query += " and fd.account_id = %s"
        params.append(account_id)

    query += " order by fd.start_date desc"

    cursor.execute(query, params)
    return cursor.fetchall()

#filter fds by fd_id
def get_fixed_deposit_by_id(cursor, fd_id):
    cursor.execute("""
        select 
            fd.fd_id,
            fd.account_id,
            fd.fd_plan_id,
            fd.principal_amount,
            fd.start_date,
            fd.maturity_date,
            fd.next_interest_date,
            fd.status,
            fp.interest_rate,
            fp.term_months
        from FIXEDDEPOSIT fd
            join FDPLAN fp on fd.fd_plan_id = fp.fd_plan_id
        where fd.fd_id = %s """, (fd_id,))

    return cursor.fetchone()

#filter fds by account_id
def get_fixed_deposit_by_account(cursor, account_id):
    cursor.execute("""
        select 
            fd.fd_id,
            fd.account_id,
            fd.fd_plan_id,
            fd.principal_amount,
            fd.start_date,
            fd.maturity_date,
            fd.next_interest_date,
            fd.status,
            fp.interest_rate,
            fp.term_months
        from FIXEDDEPOSIT fd
            join FDPLAN fp on fd.fd_plan_id = fp.fd_plan_id
        where fd.account_id = %s """, (account_id,))

    return cursor.fetchone()

#create new fd
def create_fixed_deposit(cursor, data):
    # 1. Fetch savings account details and minimum balance requirement
    cursor.execute(
        """
        SELECT 
            sa.account_id,
            sa.status,
            sa.current_balance,
            sp.minimum_balance,
            sp.plan_name
        FROM SAVINGSACCOUNT sa
        JOIN SAVINGSPLAN sp ON sa.plan_id = sp.plan_id
        WHERE sa.account_id = %s
        FOR UPDATE
        """,
        (data.account_id,)
    )
    account = cursor.fetchone()

    if not account:
        raise ValueError("Savings account not found.")

    if account["status"] != "Active":
        raise ValueError(f"Savings account is not active (current status: {account['status']}).")

    if (account.get("plan_name") or "").strip().lower() == "children":
        raise ValueError("Children savings accounts cannot open a Fixed Deposit.")

    current_balance = account["current_balance"]
    minimum_balance = account["minimum_balance"]

    # 2. Check that the account has sufficient funds
    if (current_balance - data.principal_amount) < minimum_balance:
        raise ValueError(
            f"Insufficient funds in savings account. "
            f"Available balance is Rs. {current_balance:,.2f}, and maintaining minimum required balance "
            f"of Rs. {minimum_balance:,.2f} leaves insufficient funds for principal amount Rs. {data.principal_amount:,.2f}."
        )

    # 3. Check if an active FD already exists for the account
    cursor.execute(
        """
        SELECT fd_id
        FROM FIXEDDEPOSIT
        WHERE account_id = %s
          AND status = 'Active'
        """,
        (data.account_id,)
    )

    exist_fd = cursor.fetchone()

    if exist_fd:
        raise ValueError("Savings account already has an active fixed deposit.")

    # 4. Get plan duration
    cursor.execute(
        """
        SELECT term_months
        FROM FDPLAN
        WHERE fd_plan_id = %s
        """,
        (data.fd_plan_id,)
    )

    plan = cursor.fetchone()

    if plan is None:
        raise ValueError("Invalid FD plan selected.")

    term_months = plan["term_months"]

    # Calculate dates
    start_date = date.today()
    maturity_date = start_date + relativedelta(months=term_months)
    next_interest_date = start_date + relativedelta(months=1)

    # 5. Insert new Fixed Deposit record
    query = """
        INSERT INTO FIXEDDEPOSIT
        (
            account_id,
            fd_plan_id,
            principal_amount,
            start_date,
            maturity_date,
            next_interest_date,
            status
        )
        VALUES (%s, %s, %s, %s, %s, %s, 'Active')
    """

    cursor.execute(query, (
        data.account_id,
        data.fd_plan_id,
        data.principal_amount,
        start_date,
        maturity_date,
        next_interest_date
    ))

    fd_id = cursor.lastrowid

    # 6. Find agent assigned to customer of this account (or system fallback agent 1)
    cursor.execute(
        """
        SELECT c.agent_id
        FROM ACCOUNTHOLDER ah
        JOIN CUSTOMER c ON ah.customer_id = c.customer_id
        WHERE ah.account_id = %s
        LIMIT 1
        """,
        (data.account_id,)
    )
    holder = cursor.fetchone()
    agent_id = holder["agent_id"] if (holder and holder.get("agent_id")) else 1

    # 7. Generate a unique transaction reference for the transfer
    ref_no = f"TXN-FD-{fd_id}-{data.account_id}"

    # 8. Record the withdrawal / transfer transaction in BANK_TRANSACTION
    # Note: If database trigger trg_update_balance exists, it automatically deducts
    # current_balance on Withdrawal. To support environments with or without the trigger,
    # we verify whether balance was automatically deducted.
    cursor.execute(
        """
        INSERT INTO BANK_TRANSACTION (
            account_id,
            agent_id,
            fd_id,
            reference_no,
            transaction_type,
            amount,
            transaction_timestamp
        ) VALUES (%s, %s, %s, %s, 'Withdrawal', %s, NOW())
        """,
        (
            data.account_id,
            agent_id,
            fd_id,
            ref_no,
            data.principal_amount
        )
    )

    # 9. Verify and ensure account balance is accurately reduced: new_balance = old_balance - principal
    cursor.execute(
        "SELECT current_balance FROM SAVINGSACCOUNT WHERE account_id = %s",
        (data.account_id,)
    )
    updated_acc = cursor.fetchone()
    if updated_acc and updated_acc["current_balance"] == current_balance:
        # Trigger didn't update the balance; explicitly deduct
        cursor.execute(
            """
            UPDATE SAVINGSACCOUNT
            SET current_balance = current_balance - %s
            WHERE account_id = %s
            """,
            (data.principal_amount, data.account_id)
        )

    return fd_id

#run procedure for monthly fd interest
def run_monthly_engine(cursor, p_RunDate, p_SystemAgentID):
    cursor.callproc(
        "sp_RunMonthlyEngine",
        [p_RunDate, p_SystemAgentID]
    )

    return {
        "message": "Monthly interest engine executed successfully."
    }

def process_auto_due_interest(cursor, conn):
    """
    Automatically checks and calculates monthly interest for active Fixed Deposits
    whose next_interest_date has arrived (<= today's date).
    For each account opened (e.g. opened 2026/10/13), interest is automatically calculated
    when reaching its monthly date (e.g. 2026/11/13).
    """
    today = date.today()
    max_cycles = 60
    cycle = 0
    total_processed = 0

    while cycle < max_cycles:
        cursor.execute("""
            SELECT COUNT(*) AS due_count
            FROM FIXEDDEPOSIT fd
            JOIN SAVINGSACCOUNT sa ON fd.account_id = sa.account_id
            WHERE fd.status = 'Active'
              AND sa.status = 'Active'
              AND fd.next_interest_date <= %s
        """, (today,))
        row = cursor.fetchone()
        if not row or row.get("due_count", 0) == 0:
            break

        run_monthly_engine(cursor, today, 1)
        conn.commit()
        total_processed += row.get("due_count", 0)
        cycle += 1

    return total_processed

#close fixed deposit and credit principal back to linked savings account
def close_fixed_deposit(cursor, fd_id: int):
    fd = get_fixed_deposit_by_id(cursor, fd_id)
    if not fd:
        raise ValueError(f"Fixed deposit with ID {fd_id} does not exist.")

    if fd["status"] == "Closed":
        raise ValueError(f"Fixed deposit FD-{fd_id:04d} is already Closed.")

    account_id = fd["account_id"]
    principal = fd["principal_amount"]

    # 1. Update FD status to Closed
    cursor.execute(
        "UPDATE FIXEDDEPOSIT SET status = 'Closed' WHERE fd_id = %s",
        (fd_id,)
    )

    # 2. Find agent assigned to customer of this account (or system fallback agent 1)
    cursor.execute(
        """
        SELECT c.agent_id
        FROM ACCOUNTHOLDER ah
        JOIN CUSTOMER c ON ah.customer_id = c.customer_id
        WHERE ah.account_id = %s
        LIMIT 1
        """,
        (account_id,)
    )
    holder = cursor.fetchone()
    agent_id = holder["agent_id"] if (holder and holder.get("agent_id")) else 1

    # 3. Create a Deposit transaction returning principal back to the savings account
    ref_no = f"TXN-FD-CLOSE-{fd_id}-{account_id}"
    cursor.execute(
        """
        INSERT INTO BANK_TRANSACTION (
            account_id,
            agent_id,
            fd_id,
            reference_no,
            transaction_type,
            amount,
            transaction_timestamp
        ) VALUES (%s, %s, %s, %s, 'Deposit', %s, NOW())
        """,
        (
            account_id,
            agent_id,
            fd_id,
            ref_no,
            principal
        )
    )

    # 4. In case the trigger does not automatically increase the balance:
    cursor.execute(
        "SELECT current_balance FROM SAVINGSACCOUNT WHERE account_id = %s",
        (account_id,)
    )
    acc = cursor.fetchone()

    return get_fixed_deposit_by_id(cursor, fd_id)