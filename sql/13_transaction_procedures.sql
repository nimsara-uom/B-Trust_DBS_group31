-- Transaction Engine


DELIMITER //

-- Process a Deposit
CREATE PROCEDURE sp_ProcessDeposit(
    IN p_AccountID INT,
    IN p_AgentID INT,
    IN p_Amount DECIMAL(12, 2),
    IN p_ReferenceNo VARCHAR(30)
)
BEGIN
    -- Start the ACID transaction
    START TRANSACTION;
    -- Lock the account to prevent deadlocks 
    SELECT account_id INTO @dummy FROM SAVINGSACCOUNT WHERE account_id = p_AccountID FOR UPDATE;
    -- Insert the record. 
    INSERT INTO BANK_TRANSACTION (
        account_id, agent_id, reference_no, transaction_type, amount, transaction_timestamp
    ) VALUES (
        p_AccountID, p_AgentID, p_ReferenceNo, 'Deposit', p_Amount, NOW()
    );

    
    COMMIT;
END //


-- Process a Withdrawal
CREATE PROCEDURE sp_ProcessWithdrawal(
    IN p_AccountID INT,
    IN p_AgentID INT,
    IN p_Amount DECIMAL(12, 2),
    IN p_ReferenceNo VARCHAR(30)
)
BEGIN
    -- Start the ACID transaction
    START TRANSACTION;
    -- Lock the account to prevent deadlocks 
    SELECT account_id INTO @dummy FROM SAVINGSACCOUNT WHERE account_id = p_AccountID FOR UPDATE;
    -- Insert the record. 
    INSERT INTO BANK_TRANSACTION (
        account_id, agent_id, reference_no, transaction_type, amount, transaction_timestamp
    ) VALUES (
        p_AccountID, p_AgentID, p_ReferenceNo, 'Withdrawal', p_Amount, NOW()
    );
    -- Save the changes permanently
    COMMIT;
END //

DELIMITER ;

DROP FUNCTION IF EXISTS fn_CalculateMaturityDate;
DELIMITER //
 
CREATE FUNCTION fn_CalculateMaturityDate(p_start_date DATE, p_term_months INT)
RETURNS DATE
DETERMINISTIC   -- same input always gives the same output
BEGIN
 
    DECLARE v_result DATE;
    SET v_result = DATE_ADD(p_start_date, INTERVAL p_term_months MONTH);
    RETURN v_result;
END //
 
DELIMITER ;
 DROP PROCEDURE IF EXISTS sp_CreateFixedDeposit;
DELIMITER //
 
CREATE PROCEDURE sp_CreateFixedDeposit(
    IN p_account_id       INT,
    IN p_fd_plan_id       INT,
    IN p_principal_amount DECIMAL(15,2),
    IN p_start_date       DATE
)
BEGIN
    --  variables to store values we look up or calculate
    DECLARE v_term_months        INT;
    DECLARE v_maturity_date      DATE;
    DECLARE v_next_interest_date DATE;
 
    --if ANYTHING goes wrong below, undo everything (ROLLBACK)
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
 
    --  start a transaction = all steps below succeed together,or none of them happen at all
    START TRANSACTION;
        -- check the account is a real account
        IF NOT EXISTS (SELECT 1 FROM SAVINGSACCOUNT WHERE account_id = p_account_id) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Account does not exist.';
        END IF;
 
        --check the plan is a real plan, and get its term_months
        IF NOT EXISTS (SELECT 1 FROM FDPLAN WHERE fd_plan_id = p_fd_plan_id) THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: FD Plan does not exist.';
        END IF;
 
        SELECT term_months INTO v_term_months
        FROM FDPLAN
        WHERE fd_plan_id = p_fd_plan_id;
        -- check the money amount makes sense
        IF p_principal_amount IS NULL OR p_principal_amount <= 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: Principal amount must be positive.';
        END IF;
        --calculate maturity_date using the function 
        SET v_maturity_date = fn_CalculateMaturityDate(p_start_date, v_term_months);
 
        --next_interest_date = start_date + 1 month 
        SET v_next_interest_date = DATE_ADD(p_start_date, INTERVAL 1 MONTH);
 
        --finally insert the new Fixed Deposit row
        INSERT INTO FIXEDDEPOSIT (
            account_id, fd_plan_id, principal_amount,
            start_date, maturity_date, next_interest_date, status
        )
        VALUES (
            p_account_id, p_fd_plan_id, p_principal_amount,
            p_start_date, v_maturity_date, v_next_interest_date, 'ACTIVE'
        );
 
    -- everything worked, so save the changes permanently
    COMMIT;
 
END //
 
DELIMITER ;
 


