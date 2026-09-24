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
group by sa.account_id,
            sa.account_number, 
            c.customer_id,
            c.full_name,
            sp.plan_id,
            sp.plan_name,
            sa.current_balance
order by count(tr.account_id) desc;