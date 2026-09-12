-- =============================================================
-- MIMS – Microbanking & Interest Management System
-- Group 31 | University of Moratuwa
-- Dialect : MySQL 8+
-- =============================================================

-- Commit 03 : CUSTOMER table
-- ----------------------------------------------------------------
-- A Customer is a person who registers at a branch and is
-- assigned to one Agent. Customers go on to open savings accounts.
--
-- Relationships:
--   BRANCH  (1) ──── (many) CUSTOMER   [registers_at]
--   AGENT   (1) ──── (many) CUSTOMER   [assigned_to]
--
-- Design note on customer_type:
--   This tells us the *category* of the customer (Individual /
--   Joint-primary). It is NOT the savings plan type — that lives
--   in SAVINGSPLAN. Keeping them separate avoids a transitive
--   dependency (3NF rule).
--
-- 3NF check:
--   PK  → customer_id
--   branch_id, agent_id are FKs — not derived.
--   full_name, dob, national_id, phone, email, customer_type
--   all depend ONLY on customer_id.
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS CUSTOMER (
    customer_id     INT          NOT NULL AUTO_INCREMENT,
    branch_id       INT          NOT NULL,  -- registered branch
    agent_id        INT          NOT NULL,  -- assigned agent
    full_name       VARCHAR(150) NOT NULL,
    dob             DATE         NOT NULL,  -- date of birth (used to validate plan eligibility)
    national_id     VARCHAR(20)  NOT NULL,
    phone           VARCHAR(15)  NOT NULL,
    email           VARCHAR(100)          ,  -- optional
    customer_type   ENUM('Individual', 'Joint') NOT NULL DEFAULT 'Individual',

    CONSTRAINT pk_customer         PRIMARY KEY (customer_id),
    CONSTRAINT uq_customer_nic     UNIQUE (national_id),
    CONSTRAINT uq_customer_phone   UNIQUE (phone),

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
