delimiter //

-- functions for calculate total agent transactions
-- total deposit transactions by agent
create function if not exists agent_total_deposit_amount(pagent_id int)
returns decimal(12,2)

reads sql data
begin
    return (select coalesce(sum(amount), 0) 
            from bank_transaction 
            where pagent_id = agent_id and 
                transaction_type = 'Deposit');
end //

-- total withdrawal transactions by agent
create function if not exists agent_total_withdrawal_amount(pagent_id int)
returns decimal(12,2)

reads sql data
begin
    return (select coalesce(sum(amount), 0) 
            from bank_transaction 
            where pagent_id = agent_id and 
                transaction_type = 'Withdrawal');
end //

--------------------------------------------------------------------------------------------------------------------------------------------
-- functions for calculate customer transactions
-- calculate the total deposit of a account
create function if not exists customer_total_deposit_amount(cus_id int)
returns decimal(12,2)

reads sql data
begin
    return (select coalesce(sum(amount), 0) 
            from bank_transaction tr
            join accountholder a on tr.account_id = a.account_id
            where cus_id = a.customer_id and 
                transaction_type = 'Deposit');
end //

-- calculate the total withdrawal of a ccount
create function if not exists customer_total_withdrawal_amount(cus_id int)
returns decimal(12,2)

reads sql data
begin
    return (select coalesce(sum(amount), 0) 
            from bank_transaction tr
            join accountholder a on tr.account_id = a.account_id
            where cus_id = a.customer_id and 
                transaction_type = 'Withdrawal');
end //

-- function for calculate net movement of month
-- net movement = deposit + fd - withdrawal
create function if not exists monthly_net_movement(pyear int, pmonth int)
returns decimal(12,2)

reads sql data
begin
    declare total_deposits decimal(12,2);
    declare total_withdrawals decimal(12,2);
    declare total_fds decimal(12,2);

    select 
        ifnull(sum(amount), 0) 
        into total_deposits 
        from bank_transaction 
        where transaction_type = 'Deposit' and 
            pyear = year(transaction_timestamp) and 
            pmonth = month(transaction_timestamp);

    select 
        ifnull(sum(amount), 0) 
        into total_withdrawals 
        from bank_transaction 
        where transaction_type = 'Withdrawal' and 
            pyear = year(transaction_timestamp) and 
            pmonth = month(transaction_timestamp);
    
    select
        ifnull(sum(amount), 0) 
        into total_fds 
        from bank_transaction 
        where transaction_type = 'FD_Interest' and 
            pyear = year(transaction_timestamp) and 
            pmonth = month(transaction_timestamp);
    
    return total_deposits + total_fds - total_withdrawals;
    
end //

delimiter ;

