
CREATE TABLE IF NOT EXISTS AGENT (
    agent_id INT NOT NULL AUTO_INCREMENT,
    branch_id INT NOT NULL, -- which branch this agent works at
    agent_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,

    CONSTRAINT pk_agent PRIMARY KEY (agent_id),
    CONSTRAINT uq_agent_phone UNIQUE (phone),

    -- If a branch is removed, we should not silently lose agent records.
    -- RESTRICT means: "refuse to delete a branch that still has agents."
    CONSTRAINT fk_agent_branch
        FOREIGN KEY (branch_id)
        REFERENCES BRANCH (branch_id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);
