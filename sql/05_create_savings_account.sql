CREATE TABLE IF NOT EXISTS SAVINGSACCOUNT (
    account_id INT NOT NULL AUTO_INCREMENT,
    plan_id INT NOT NULL, 
    account_number VARCHAR(20) NOT NULL, 
    opened_date DATE NOT NULL,
    status ENUM('Active', 'Inactive', 'Closed') NOT NULL DEFAULT 'Active',
    current_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    CONSTRAINT pk_savings_account PRIMARY KEY (account_id),
    CONSTRAINT uq_savings_account_no UNIQUE (account_number),

    -- Bno overdraft
    CONSTRAINT chk_account_balance CHECK (current_balance >= 0),

    -- link to the plan
    CONSTRAINT fk_account_plan
        FOREIGN KEY (plan_id)
        REFERENCES SAVINGSPLAN (plan_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
