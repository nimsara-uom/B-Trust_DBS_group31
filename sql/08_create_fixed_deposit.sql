DROP TABLE IF EXISTS FIXEDDEPOSIT;
CREATE TABLE FIXEDDEPOSIT (
    fd_id                INT AUTO_INCREMENT PRIMARY KEY,
    account_id           INT NOT NULL UNIQUE,   
    fd_plan_id           INT NOT NULL,           
    principal_amount     DECIMAL(15,2) NOT NULL, 
    start_date           DATE NOT NULL,
    maturity_date        DATE NOT NULL,          
    next_interest_date   DATE NOT NULL,   
    status ENUM('Active', 'Matured', 'Closed') NOT NULL DEFAULT 'Active',

  

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

    




