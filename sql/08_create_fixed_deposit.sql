DROP TABLE IF EXISTS FIXEDDEPOSIT;
CREATE TABLE FIXEDDEPOSIT (
    fd_id                INT AUTO_INCREMENT PRIMARY KEY,
    account_id           INT NOT NULL UNIQUE,   
    fd_plan_id           INT NOT NULL,           
    principal_amount     DECIMAL(15,2) NOT NULL, 
    start_date           DATE NOT NULL,
    maturity_date        DATE NOT NULL,          
    next_interest_date   DATE NOT NULL,         
    status               VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
 
    
    CONSTRAINT fk_fd_account
        FOREIGN KEY (account_id) REFERENCES SAVINGSACCOUNT(account_id),
 
    CONSTRAINT fk_fd_plan
        FOREIGN KEY (fd_plan_id) REFERENCES FDPLAN(fd_plan_id)
);
 
-- Extra indexes so searching by status or upcoming interest date is fast later
CREATE INDEX idx_fd_status ON FIXEDDEPOSIT (status);
CREATE INDEX idx_fd_next_interest_date ON FIXEDDEPOSIT (next_interest_date);





