from typing import Optional


def process_deposit(cursor, account_id: int, agent_id: int, amount, reference_no: str):
    """
    Calls the stored procedure sp_ProcessDeposit.
    The procedure starts its own ACID transaction and commits internally.
    The trigger trg_update_balance automatically credits the account balance.
    """
    cursor.callproc(
        "sp_ProcessDeposit",
        [account_id, agent_id, float(amount), reference_no]
    )


def process_withdrawal(cursor, account_id: int, agent_id: int, amount, reference_no: str):
    """
    Calls the stored procedure sp_ProcessWithdrawal.
    The trigger trg_check_withdrawal will raise SQLSTATE 45000 if the
    withdrawal would drop the balance below the plan minimum — this surfaces
    as a mysql.connector.Error which the router converts to HTTP 400.
    """
    cursor.callproc(
        "sp_ProcessWithdrawal",
        [account_id, agent_id, float(amount), reference_no]
    )


def get_transaction_by_id(cursor, transaction_id: int):
    """Fetch a single transaction by its primary key."""
    cursor.execute(
        """
        SELECT
            transaction_id,
            account_id,
            agent_id,
            fd_id,
            reference_no,
            transaction_type,
            amount,
            transaction_timestamp
        FROM BANK_TRANSACTION
        WHERE transaction_id = %s
        """,
        (transaction_id,)
    )
    return cursor.fetchone()


def get_transactions(
    cursor,
    account_id: Optional[int] = None,
    transaction_type: Optional[str] = None,
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
):
    """
    List transactions with optional filters:
      - account_id      : filter by savings account
      - transaction_type: 'Deposit' | 'Withdrawal' | 'FD_Interest'
      - from_date       : YYYY-MM-DD inclusive lower bound on timestamp
      - to_date         : YYYY-MM-DD inclusive upper bound on timestamp
    """
    query = """
        SELECT
            transaction_id,
            account_id,
            agent_id,
            fd_id,
            reference_no,
            transaction_type,
            amount,
            transaction_timestamp
        FROM BANK_TRANSACTION
        WHERE 1 = 1
    """
    params = []

    if account_id is not None:
        query += " AND account_id = %s"
        params.append(account_id)

    if transaction_type:
        query += " AND transaction_type = %s"
        params.append(transaction_type)

    if from_date:
        query += " AND DATE(transaction_timestamp) >= %s"
        params.append(from_date)

    if to_date:
        query += " AND DATE(transaction_timestamp) <= %s"
        params.append(to_date)

    query += " ORDER BY transaction_timestamp DESC"

    cursor.execute(query, params)
    return cursor.fetchall()
