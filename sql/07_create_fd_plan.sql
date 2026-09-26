CREATE TABLE IF NOT EXISTS FDPLAN (
    fd_plan_id INT NOT NULL AUTO_INCREMENT,
    term_months INT NOT NULL, 
    interest_rate DECIMAL(5, 2) NOT NULL, 

    CONSTRAINT pk_fd_plan PRIMARY KEY (fd_plan_id),
    CONSTRAINT uq_fd_plan_term UNIQUE (term_months),

    CONSTRAINT chk_fd_rate CHECK (interest_rate > 0),
    CONSTRAINT chk_fd_term CHECK (term_months > 0)
);
-- act like a lookup table with static values