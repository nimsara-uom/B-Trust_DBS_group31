def get_agent_transaction_summary(cursor):
    query = """
        select 
            a.agent_id as agent_id,
            a.agent_name as agent_name, 
            count(tr.transaction_id) as number_of_transactions,
            sum(tr.amount) as total_amount,
            agent_total_deposit_amount(a.agent_id) as total_deposits, 
            agent_total_withdrawal_amount(a.agent_id) as total_withdrawals
            
        from agent a 
            left join bank_transaction tr 
            on a.agent_id = tr.agent_id 
        group by a.agent_id, a.agent_name 
        order by count(tr.transaction_id) desc;
    """
    cursor.execute(query)
    return cursor.fetchall()

def get_account_transaction_summary(cursor):
    query = """
        select
            sa.account_number as account_number,
            c.full_name as customer_name,
            sp.plan_name as plan_name,
            count(tr.account_id) as number_of_transactions,
            sum(tr.amount) as total_amount,
            sa.current_balance as current_balance
        from savingsaccount sa 
            join accountholder a on a.account_id = sa.account_id
            join customer c on a.customer_id = c.customer_id
            join savingsplan sp on sa.plan_id = sp.plan_id
            join bank_transaction tr on sa.account_id = tr.account_id
        group by 
            sa.account_id,
            sa.account_number, 
            c.customer_id,
            c.full_name,
            sp.plan_id,
            sp.plan_name,
            sa.current_balance
        order by count(tr.account_id) desc;
    """
    cursor.execute(query)
    return cursor.fetchall()

def get_active_fds_report(cursor):
    query = """
        select 
            fd.fd_id as fd_id,
            sa.account_number as account_number,
            concat(fp.term_months, ' months') as plan_name,
            c.full_name as customer_name,
            fd.principal_amount as principal_amount,
            fp.interest_rate as interest_rate,
            fd.start_date as start_date,
            fd.maturity_date as maturity_date,
            fd.next_interest_date as next_interest_date
        from fixeddeposit fd
            join accountholder a on a.account_id = fd.account_id
            join customer c on c.customer_id = a.customer_id
            join savingsaccount sa on sa.account_id = fd.account_id
            join fdplan fp on fp.fd_plan_id = fd.fd_plan_id
            where fd.status = 'Active'
        order by fd.fd_id;
    """
    cursor.execute(query)
    return cursor.fetchall()

def get_monthly_interest_distribution(cursor):
    query = """
        select 
            year(tr.transaction_timestamp) as year,
            month(tr.transaction_timestamp) as month,
            fd.fd_id as fd_id,
            sa.account_number as account_number,
            c.full_name as customer_name,
            concat(fp.term_months, ' months') as plan_name,
            count(tr.transaction_id) as number_of_interest_credits,
            sum(tr.amount) as total_interest_credited
        from bank_transaction tr
            join fixeddeposit fd on fd.fd_id = tr.fd_id
            join savingsaccount sa on sa.account_id = fd.account_id
            join accountholder a on a.account_id = sa.account_id
            join customer c on a.customer_id = c.customer_id
            join fdplan fp on fp.fd_plan_id = fd.fd_plan_id
            where tr.transaction_type = 'FD_Interest'
        group by 
            year(tr.transaction_timestamp), 
            month(tr.transaction_timestamp),
            concat(fp.term_months, ' months'),
            fd.fd_id,
            sa.account_number,
            c.full_name,
            fp.fd_plan_id,
            fp.term_months
        order by year(tr.transaction_timestamp) desc, month(tr.transaction_timestamp) desc;
    """
    cursor.execute(query)
    return cursor.fetchall()

def get_customer_activity_summary(cursor):
    query = """
        select 
            cu.full_name as customer_name, 
            count(tr.transaction_id) as number_of_transactions, 
            customer_total_deposit_amount(cu.customer_id) as total_deposit,
            customer_total_withdrawal_amount(cu.customer_id) as total_withdrawal,
            customer_total_deposit_amount(cu.customer_id) - customer_total_withdrawal_amount(cu.customer_id) as net_balance
        from customer cu 
        join accountholder ac on cu.customer_id = ac.customer_id 
        join bank_transaction tr on ac.account_id = tr.account_id 
        group by 
            cu.customer_id, 
            cu.full_name
        order by number_of_transactions desc;
    """
    cursor.execute(query)
    return cursor.fetchall()

def get_monthly_bank_transaction_summary(cursor):
    query = """
        select 
            year,
            month,
            number_of_transactions,
            total_amount,
            monthly_net_movement(year, month) as net_movement
        from (
            select 
                year(transaction_timestamp) as year,
                month(transaction_timestamp) as month,
                count(transaction_id) as number_of_transactions,
                sum(amount) as total_amount
            from bank_transaction
            group by 
                year(transaction_timestamp),
                month(transaction_timestamp)) as monthly_data
        order by 
            year desc,
            month desc;
    """
    cursor.execute(query)
    return cursor.fetchall()