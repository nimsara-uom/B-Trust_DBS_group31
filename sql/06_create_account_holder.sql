CREATE TABLE IF NOT EXISTS ACCOUNTHOLDER (
    account_id INT NOT NULL, 
    customer_id INT NOT NULL, 

    -- these two form the primary key

    CONSTRAINT pk_account_holder PRIMARY KEY (account_id, customer_id),
    CONSTRAINT fk_holder_account
        FOREIGN KEY (account_id)
        REFERENCES SAVINGSACCOUNT (account_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE, 

    CONSTRAINT fk_holder_customer
        FOREIGN KEY (customer_id)
        REFERENCES CUSTOMER (customer_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT 
);
