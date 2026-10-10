select 
    left join bank_transaction tr 
    on a.agent_id = tr.agent_id 
group by a.agent_id, a.agent_name 
order by count(tr.transaction_id) desc;