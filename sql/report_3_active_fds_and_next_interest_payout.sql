select 
    fd.fd_id as fd_id,
    sa.account_number as account_number,
    concat(fp.term_months, ' months') as plan_name,
    fd.principal_amount as principal_amount,
    fd.start_date as start_date,
    fd.maturity_date as maturity_date,
    fd.next_interest_date as next_interest_date
from fixeddeposit fd
    join savingsaccount sa on sa.account_id = fd.account_id
    join fdplan fp on fp.fd_plan_id = fd.fd_plan_id
    where fd.status = 'Active'
order by fd.fd_id;
