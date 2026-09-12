CREATE TABLE IF NOT EXISTS FIXEDDEPOSIT (
    fd_id INT NOT NULL AUTO_INCREMENT,
    account_id INT NOT NULL,  
    fd_plan_id INT NOT NULL,  
    principal_amount DECIMAL(12, 2) NOT NULL,  
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,  
    next_interest_date DATE NOT NULL, 
    status ENUM('Active', 'Matured', 'Closed') NOT NULL DEFAULT 'Active',

    CONSTRAINT pk_fixed_deposit PRIMARY KEY (fd_id),

    
    CONSTRAINT uq_fd_per_account UNIQUE (account_id),

    CONSTRAINT chk_fd_principal CHECK (principal_amount > 0),
    CONSTRAINT chk_fd_dates CHECK (maturity_date > start_date),

    
    CONSTRAINT fk_fd_account
        FOREIGN KEY (account_id)
        REFERENCES SAVINGSACCOUNT (account_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_fd_plan
        FOREIGN KEY (fd_plan_id)
        REFERENCES FDPLAN (fd_plan_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
