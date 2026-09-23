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
