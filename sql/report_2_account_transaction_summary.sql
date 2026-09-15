select
    sa.account_number as account_number,
    sp.plan_name as plan_name,
    count(tr.account_id) as number_of_transactions,
    sum(tr.amount) as total_amount,
    sa.current_balance as current_balance
from savingsaccount sa 
    join savingsplan sp on sa.plan_id = sp.plan_id
    join bank_transaction tr on sa.account_id = tr.account_id
group by sa.account_id
order by count(tr.account_id) desc;