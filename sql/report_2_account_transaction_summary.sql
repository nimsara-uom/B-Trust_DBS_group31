select
    sa.account_number as account_number,
    group_concat(c.full_name separator ', ') as customer_name,
    sp.plan_name as plan_name,
    coalesce(tr.txn_count, 0) as number_of_transactions,
    coalesce(tr.txn_sum, 0.00) as total_amount,
    sa.current_balance as current_balance
from savingsaccount sa 
    join accountholder a on a.account_id = sa.account_id
    join customer c on a.customer_id = c.customer_id
    join savingsplan sp on sa.plan_id = sp.plan_id
    left join (
        select 
            account_id, 
            count(transaction_id) as txn_count, 
            sum(amount) as txn_sum 
        from bank_transaction 
        group by account_id
    ) as tr on sa.account_id = tr.account_id
group by 
    sa.account_id,
    sa.account_number, 
    sp.plan_id,
    sp.plan_name,
    sa.current_balance,
    tr.txn_count,
    tr.txn_sum
order by coalesce(tr.txn_count, 0) desc;