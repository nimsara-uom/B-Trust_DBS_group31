
CREATE TABLE IF NOT EXISTS BRANCH (
    branch_id INT NOT NULL AUTO_INCREMENT,
    branch_name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,

    -- Every branch must have a unique name and a unique phone number
    CONSTRAINT pk_branch PRIMARY KEY (branch_id),
    CONSTRAINT uq_branch_name UNIQUE (branch_name),
    CONSTRAINT uq_branch_phone UNIQUE (phone)
);
