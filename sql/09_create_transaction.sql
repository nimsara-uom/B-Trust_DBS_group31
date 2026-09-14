CREATE TABLE IF NOT EXISTS BANK_TRANSACTION (
    transaction_id INT NOT NULL AUTO_INCREMENT,
    account_id INT NOT NULL,
    agent_id INT NOT NULL,   
    fd_id INT NULL,     
    reference_no VARCHAR(30) NOT NULL,  
    transaction_type ENUM('Deposit', 'Withdrawal', 'FD_Interest') NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    transaction_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_transaction PRIMARY KEY (transaction_id),
    CONSTRAINT uq_transaction_ref UNIQUE (reference_no),

    CONSTRAINT chk_transaction_amount CHECK (amount > 0),

    CONSTRAINT fk_txn_account
        FOREIGN KEY (account_id)
        REFERENCES SAVINGSACCOUNT (account_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_txn_agent
        FOREIGN KEY (agent_id)
        REFERENCES AGENT (agent_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_txn_fd
        FOREIGN KEY (fd_id)
        REFERENCES FIXEDDEPOSIT (fd_id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);
