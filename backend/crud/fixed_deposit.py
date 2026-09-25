from datetime import date
from dateutil.relativedelta import relativedelta

def get_fd_plans(cursor):
    cursor.execute("""
    select *
        from fdplan 
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
        from fixeddeposit fd
            join fdplan fp on fd.fd_plan_id = fp.fd_plan_id
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
        from fixeddeposit fd
            join fdplan fp on fd.fd_plan_id = fp.fd_plan_id
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
        from fixeddeposit fd
            join fdplan fp on fd.fd_plan_id = fp.fd_plan_id
        where fd.account_id = %s """, (account_id,))

    return cursor.fetchone()

#create new fd
def create_fixed_deposit(cursor, data):

    #check if an FD already exists for the account
    cursor.execute(
        """
        select fd_id
        from fixeddeposit
        where account_id = %s
            and status = 'Active' """, (data.account_id,)
    )

    exist_fd = cursor.fetchone()

    if exist_fd:
        raise ValueError("Savings account already has a fixed deposit")

    #get paln duration
    cursor.execute(
        """
        select term_months
        from fdplan
        where fd_plan_id = %s """,(data.fd_plan_id,)
    )

    plan = cursor.fetchone()

    if plan is None:
        raise ValueError("Invalid FD plan")

    term_months = plan[0]

    # Calculate dates
    start_date = date.today()
    maturity_date = start_date + relativedelta(months = term_months)
    next_interest_date = start_date + relativedelta(months=1)

    query = """
        insert into fixeddeposit
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

    return cursor.lastrowid

#run procedure for monthly fd interest
def run_monthly_engine(cursor, p_RunDate, p_SystemAgentID):
    cursor.callproc(
        "sp_RunMonthlyEngine",
        [p_RunDate, p_SystemAgentID]
    )

    return {
        "message": "Monthly interest engine executed successfully."
    }