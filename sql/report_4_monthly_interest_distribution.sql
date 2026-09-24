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