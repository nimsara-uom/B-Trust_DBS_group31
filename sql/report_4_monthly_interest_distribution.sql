select 
    year(tr.transaction_timestamp) as year,
    month(tr.transaction_timestamp) as month,
    concat(fp.term_months, ' months') as plan_name,
    count(tr.transaction_id) as number_of_interest_creadits,
    sum(tr.amount) as total_inerest_creadited
from bank_transaction tr
    join fixeddeposit fd on fd.fd_id = tr.fd_id
    join fdplan fp on fp.fd_plan_id = fd.fd_plan_id
    where tr.transaction_type = 'FD_Interest'
group by 
    year(tr.transaction_timestamp), 
    month(tr.transaction_timestamp),
    concat(fp.term_months, ' months')
order by year(tr.transaction_timestamp) desc, month(tr.transaction_timestamp) desc;