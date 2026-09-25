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