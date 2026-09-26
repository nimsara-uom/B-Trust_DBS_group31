-- =============================================================
-- MIMS – Microbanking & Interest Management System
-- Group 31 | University of Moratuwa
-- Dialect : MySQL 8+
-- =============================================================

-- Commit 01 : BRANCH table
-- ----------------------------------------------------------------
-- A Branch is a physical service location of B-Trust.
-- Everything else in the system (agents, customers, accounts)
-- ultimately traces back to a branch.
--
-- 3NF check:
-- PK → branch_id
-- All other columns (branch_name, address, phone) depend ONLY
-- on branch_id. No transitive dependency here.
-- ----------------------------------------------------------------

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
