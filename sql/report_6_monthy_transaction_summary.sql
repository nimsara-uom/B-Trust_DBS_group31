select 
    year,
    month,
    number_of_transactions,
    total_amount,
    monthly_net_movement(year, month) as net_movement
from (
    select 
        year(transaction_timestamp) as year,
        month(transaction_timestamp) as month,
        count(transaction_id) as number_of_transactions,
        sum(amount) as total_amount
    from bank_transaction
    group by 
        year(transaction_timestamp),
        month(transaction_timestamp)) as monthly_data
order by 
    year desc,
    month desc;