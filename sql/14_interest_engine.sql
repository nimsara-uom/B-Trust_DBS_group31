DELIMITER //

DROP PROCEDURE IF EXISTS sp_RunMonthlyEngine //

CREATE PROCEDURE sp_RunMonthlyEngine(
    IN p_RunDate DATE,          -- Cutoff cycle date (e.g., CURRENT_DATE)
    IN p_SystemAgentID INT      -- System Agent ID logging the transactions (e.g., 1)
)
BEGIN
    -- 1. DECLARE CURSOR & LOOP VARIABLES
  
    DECLARE v_done INT DEFAULT FALSE;
    DECLARE v_fd_id INT;
    DECLARE v_account_id INT;
    DECLARE v_principal DECIMAL(12, 2);
    DECLARE v_interest_rate DECIMAL(5, 2);
    DECLARE v_next_interest_date DATE;
    DECLARE v_maturity_date DATE;
    DECLARE v_fd_status VARCHAR(20);
    DECLARE v_sa_status VARCHAR(20);
    
    -- Calculation and Reference variables

    DECLARE v_monthly_interest DECIMAL(12, 2);
    DECLARE v_ref_no VARCHAR(30);
    DECLARE v_txn_counter INT DEFAULT 1;
    DECLARE v_processed_count INT DEFAULT 0;
    DECLARE v_total_disbursed DECIMAL(15, 2) DEFAULT 0.00;
    DECLARE v_base_txn_id INT DEFAULT 0;

    -- 2. CURSOR DECLARATION (DEADLOCK PREVENTION)
    -- Enforce ORDER BY fd.account_id ASC to guarantee a strict, ascending 
    -- global lock hierarchy matching Member 2's transaction procedures.

    DECLARE cur_fd CURSOR FOR
        SELECT 
            fd.fd_id,
            fd.account_id,
            fd.principal_amount,
            fp.interest_rate,
            fd.next_interest_date,
            fd.maturity_date
        FROM FIXEDDEPOSIT fd
        JOIN FDPLAN fp ON fd.fd_plan_id = fp.fd_plan_id
        JOIN SAVINGSACCOUNT sa ON fd.account_id = sa.account_id
        WHERE fd.status = 'Active'
          AND sa.status = 'Active'
          AND fd.next_interest_date <= p_RunDate
        ORDER BY fd.account_id ASC;

    -- Cursor EOF Handler

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = TRUE;

    -- 3. ACID EXCEPTION HANDLER
    -- Automatically roll back the entire batch and release all locks if any error occurs

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- 4. BEGIN ATOMIC TRANSACTION

    START TRANSACTION;

    -- Retrieve base transaction ID for deterministic reference numbering

    SELECT COALESCE(MAX(transaction_id), 0) INTO v_base_txn_id FROM BANK_TRANSACTION;
    SET v_txn_counter = v_base_txn_id + 1;

    OPEN cur_fd;

    fd_loop: LOOP
        FETCH cur_fd INTO 
            v_fd_id, 
            v_account_id, 
            v_principal, 
            v_interest_rate, 
            v_next_interest_date, 
            v_maturity_date;

        IF v_done THEN
            LEAVE fd_loop;
        END IF;

        -- 5. PESSIMISTIC ROW LOCKING & TOCTOU RE-VERIFICATION
        -- Exclusively lock SAVINGSACCOUNT and FIXEDDEPOSIT before calculation.
        -- Any concurrent teller/ATM withdrawal on this account will wait here.

        SELECT status INTO v_sa_status 
        FROM SAVINGSACCOUNT 
        WHERE account_id = v_account_id 
        FOR UPDATE;

        SELECT status, next_interest_date INTO v_fd_status, v_next_interest_date 
        FROM FIXEDDEPOSIT 
        WHERE fd_id = v_fd_id 
        FOR UPDATE;

        -- Verify status and date have not changed while holding the exclusive lock

        IF v_sa_status = 'Active' AND v_fd_status = 'Active' AND v_next_interest_date <= p_RunDate THEN

            -- 6. 30-DAY INTEREST CALCULATION (Actual/365 Standard)
            -- Formula: Principal * (AnnualRate / 100) * (30 / 365)

            SET v_monthly_interest = ROUND(
                v_principal * (v_interest_rate / 100.0) * (30.0 / 365.0), 
                2
            );

            -- 7. GENERATE UNIQUE COLLISION-PROOF REFERENCE NUMBER
            -- Format: TXN-YYYYMMDD-INT-XXXXX (Fits within VARCHAR(30))

            SET v_ref_no = CONCAT(
                'TXN-', 
                DATE_FORMAT(p_RunDate, '%Y%m%d'), 
                '-I', 
                LPAD(v_txn_counter, 5, '0')
            );

            -- 8. INSERT TRANSACTION AUDIT LOG
            -- Member 2's trigger 'trg_update_balance' automatically credits
            -- SAVINGSACCOUNT.current_balance upon this insert.

            INSERT INTO BANK_TRANSACTION (
                account_id,
                agent_id,
                fd_id,
                reference_no,
                transaction_type,
                amount,
                transaction_timestamp
            ) VALUES (
                v_account_id,
                p_SystemAgentID,
                v_fd_id,
                v_ref_no,
                'FD_Interest',
                v_monthly_interest,
                CONCAT(p_RunDate, ' 00:01:00')
            );

            -- 9. ADVANCE NEXT INTEREST DATE (+30 DAYS)
            -- Member 3's trigger 'trg_fd_maturity_check' will automatically
            -- flip status='Matured' if next_interest_date >= maturity_date.

            UPDATE FIXEDDEPOSIT
            SET next_interest_date = DATE_ADD(v_next_interest_date, INTERVAL 30 DAY)
            WHERE fd_id = v_fd_id;

            -- Increment counters

            SET v_txn_counter = v_txn_counter + 1;
            SET v_processed_count = v_processed_count + 1;
            SET v_total_disbursed = v_total_disbursed + v_monthly_interest;

        END IF;

    END LOOP fd_loop;

    CLOSE cur_fd;

    -- 10. COMMIT TRANSACTION & RETURN TELEMETRY SUMMARY

    COMMIT;

    SELECT 
        'SUCCESS' AS execution_status,
        p_RunDate AS batch_cycle_date,
        v_processed_count AS fds_credited,
        v_total_disbursed AS total_interest_disbursed_lkr;

END //

DELIMITER ;


-- SECTION 2: MYSQL EVENT SCHEDULER (Automated Monthly Batch)

-- Ensure the MySQL Event Scheduler is globally enabled

SET GLOBAL event_scheduler = ON;

DROP EVENT IF EXISTS evt_monthly_interest_engine;

DELIMITER //

CREATE EVENT evt_monthly_interest_engine
ON SCHEDULE EVERY 1 MONTH
STARTS '2026-08-01 00:01:00'
ON COMPLETION PRESERVE
ENABLE
COMMENT 'Automated monthly batch interest credit engine for active Fixed Deposits'
DO
BEGIN
    CALL sp_RunMonthlyEngine(CURRENT_DATE, 1);
END //

DELIMITER ;


-- SECTION 3: VERIFICATION & TESTING QUERIES (Uncomment to run)

-- 1. Check active FDs and balances before run:
-- SELECT fd.fd_id, fd.account_id, fd.principal_amount, fd.next_interest_date, fd.status, sa.current_balance
-- FROM FIXEDDEPOSIT fd JOIN SAVINGSACCOUNT sa ON fd.account_id = sa.account_id WHERE fd.status = 'Active';

-- 2. Execute sample batch run for March 31, 2024:
-- CALL sp_RunMonthlyEngine('2024-03-31', 1);

-- 3. Verify newly inserted interest transactions:
-- SELECT * FROM BANK_TRANSACTION WHERE transaction_type = 'FD_Interest' ORDER BY transaction_id DESC LIMIT 10;

-- 4. Idempotency test (running again on the same date should credit 0 records):
-- CALL sp_RunMonthlyEngine('2024-03-31', 1);
