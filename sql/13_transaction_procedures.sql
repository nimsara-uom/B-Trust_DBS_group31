-- Author: Member 2 (Transaction Engine)


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

    -- Insert the record. Triggers will handle the balance update automatically.
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

    -- Insert the record. Triggers will block overdrafts and update the balance.
    INSERT INTO BANK_TRANSACTION (
        account_id, agent_id, reference_no, transaction_type, amount, transaction_timestamp
    ) VALUES (
        p_AccountID, p_AgentID, p_ReferenceNo, 'Withdrawal', p_Amount, NOW()
    );

    -- Save the changes permanently
    COMMIT;
END //



DELIMITER ;