-- =============================================================
-- MIMS – Microbanking & Interest Management System
-- Group 31 | University of Moratuwa
-- Dialect : MySQL 8+
-- =============================================================

-- Commit 02 : AGENT table
-- ----------------------------------------------------------------
-- An Agent is a bank staff member who is assigned to exactly
-- one Branch. Agents serve customers and process their requests.
--
-- Relationship: BRANCH (1) ──── (many) AGENT
--
-- 3NF check:
-- PK → agent_id
-- branch_id is an FK, not a derived value — OK.
-- agent_name, phone all depend directly on agent_id only.
-- ----------------------------------------------------------------

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
