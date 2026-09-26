
CREATE TABLE IF NOT EXISTS SAVINGSPLAN (
    plan_id INT NOT NULL AUTO_INCREMENT,
    plan_name VARCHAR(50) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL, -- stored as percentage
    minimum_balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    CONSTRAINT pk_savings_plan PRIMARY KEY (plan_id),
    CONSTRAINT uq_savings_plan_name UNIQUE (plan_name),

    -- Interest rateand ballance cant be negative number
    CONSTRAINT chk_savings_plan_rate CHECK (interest_rate > 0),


    CONSTRAINT chk_savings_plan_min CHECK (minimum_balance >= 0)
);
