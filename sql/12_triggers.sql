
DELIMITER $$



CREATE TRIGGER trg_check_withdrawal
BEFORE INSERT ON BANK_TRANSACTION
FOR EACH ROW
BEGIN
    DECLARE v_current_balance  DECIMAL(12, 2);
    DECLARE v_minimum_balance  DECIMAL(12, 2);

    IF NEW.transaction_type = 'Withdrawal' THEN

        SELECT sa.current_balance, sp.minimum_balance
        INTO   v_current_balance, v_minimum_balance
        FROM   SAVINGSACCOUNT sa
        JOIN   SAVINGSPLAN    sp ON sa.plan_id = sp.plan_id
        WHERE  sa.account_id = NEW.account_id;

        IF (v_current_balance - NEW.amount) < v_minimum_balance THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Withdrawal denied: balance would fall below the minimum required for this plan';
        END IF;

    END IF;
END$$


CREATE TRIGGER trg_update_balance
AFTER INSERT ON BANK_TRANSACTION
FOR EACH ROW
BEGIN

    IF NEW.transaction_type IN ('Deposit', 'FD_Interest') THEN
        UPDATE SAVINGSACCOUNT
        SET    current_balance = current_balance + NEW.amount
        WHERE  account_id = NEW.account_id;

    ELSEIF NEW.transaction_type = 'Withdrawal' THEN
        UPDATE SAVINGSACCOUNT
        SET    current_balance = current_balance - NEW.amount
        WHERE  account_id = NEW.account_id;

    END IF;

END$$



CREATE TRIGGER trg_fd_maturity_check
BEFORE UPDATE ON FIXEDDEPOSIT
FOR EACH ROW
BEGIN

    -- Only check FDs that are still Active
    IF OLD.status = 'Active' THEN

        -- If the next scheduled interest date has reached or passed maturity
        IF NEW.next_interest_date >= NEW.maturity_date THEN
            SET NEW.status = 'Matured';
        END IF;

    END IF;

END$$


DELIMITER ;
