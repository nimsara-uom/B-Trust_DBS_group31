
CREATE TABLE IF NOT EXISTS CUSTOMER (
    customer_id INT NOT NULL AUTO_INCREMENT,
    branch_id INT NOT NULL, 
    agent_id INT NOT NULL, 
    full_name VARCHAR(150) NOT NULL,
    dob DATE NOT NULL, 
    national_id VARCHAR(20) NOT NULL, -- National Identity Card (NIC) for adults, or Birth Certificate Registration Number for minors
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) , 
    customer_type ENUM('Individual', 'Joint') NOT NULL DEFAULT 'Individual',
    password VARCHAR(255) NULL DEFAULT NULL,

    CONSTRAINT pk_customer PRIMARY KEY (customer_id),
    CONSTRAINT uq_customer_nic UNIQUE (national_id),
    CONSTRAINT uq_customer_phone UNIQUE (phone),

    CONSTRAINT fk_customer_branch
        FOREIGN KEY (branch_id)
        REFERENCES BRANCH (branch_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_customer_agent
        FOREIGN KEY (agent_id)
        REFERENCES AGENT (agent_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
