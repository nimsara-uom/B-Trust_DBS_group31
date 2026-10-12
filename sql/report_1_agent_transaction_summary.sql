select 
	a.agent_id as agent_id,
    a.agent_name as agent_name, 
    count(tr.transaction_id) as number_of_transactions,
    coalesce(sum(tr.amount), 0.00) as total_amount,
    coalesce(agent_total_deposit_amount(a.agent_id), 0.00) as total_deposits, 
    coalesce(agent_total_withdrawal_amount(a.agent_id), 0.00) as total_withdrawals
        
from agent a 
    left join bank_transaction tr 
    on a.agent_id = tr.agent_id 
group by a.agent_id, a.agent_name 
order by count(tr.transaction_id) desc;