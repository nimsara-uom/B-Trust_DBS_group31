select 
    a.agent_name as agent_name, 
    count(tr.transaction_id) as number_of_transactions,
    sum(tr.amount) as total_amount,
    agent_total_deposit_amount(a.agent_id) as total_deposits, 
    agent_total_withdrawal_amount(a.agent_id) as total_withdrawals
     
from agent a 
    join bank_transaction tr 
    on a.agent_id = tr.agent_id 
group by a.agent_id, a.agent_name 
order by count(tr.transaction_id) desc;