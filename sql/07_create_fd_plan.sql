DROP TABLE IF EXISTS FDPLAN;
CREATE TABLE FDPLAN (
    fd_plan_id      INT AUTO_INCREMENT PRIMARY KEY,  
    term_months     INT NOT NULL,                   
    interest_rate   DECIMAL(5,2) NOT NULL 
    
    CONSTRAINT uq_fd_plan_term UNIQUE (term_months),
    CONSTRAINT chk_fd_rate CHECK (interest_rate > 0),
    CONSTRAINT chk_fd_term CHECK (term_months > 0)
);
