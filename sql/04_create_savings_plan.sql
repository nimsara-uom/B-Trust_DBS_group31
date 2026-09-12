-- =============================================================
-- MIMS – Microbanking & Interest Management System
-- Group 31 | University of Moratuwa
-- Dialect : MySQL 8+
-- =============================================================

-- Commit 04 : SAVINGSPLAN table
-- ----------------------------------------------------------------
-- A SavingsPlan defines the *rules* for a type of savings account.
-- It is a lookup/reference table — rows are inserted once and
-- never change during normal operation.
--
-- Plans defined by the SRS:
--   ┌────────────┬───────────────┬─────────────────┐
--   │ Plan       │ Interest Rate │ Min Balance(LKR) │
--   ├────────────┼───────────────┼─────────────────┤
--   │ Children   │     12%       │       0.00       │
--   │ Teen       │     11%       │     500.00       │
--   │ Adult      │     10%       │    1000.00       │
--   │ Senior     │     13%       │    1000.00       │
--   │ Joint      │      7%       │    5000.00       │
--   └────────────┴───────────────┴─────────────────┘
--
-- Why a separate table?
--   If we stored interest_rate directly in SAVINGSACCOUNT, and the
--   bank changed "Teen" from 11% to 11.5%, we'd have to update
--   every single account row. Instead, we update ONE row here.
--   This is exactly the spirit of 3NF — remove redundancy.
--
-- 3NF check:
--   PK  → plan_id
--   plan_name, interest_rate, minimum_balance all depend only on plan_id.
-- ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS SAVINGSPLAN (
    plan_id         INT             NOT NULL AUTO_INCREMENT,
    plan_name       VARCHAR(50)     NOT NULL,
    interest_rate   DECIMAL(5, 2)   NOT NULL,   -- stored as percentage, e.g. 12.00 means 12%
    minimum_balance DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,

    CONSTRAINT pk_savings_plan      PRIMARY KEY (plan_id),
    CONSTRAINT uq_savings_plan_name UNIQUE (plan_name),

    -- Interest rate must be a positive number
    CONSTRAINT chk_savings_plan_rate CHECK (interest_rate > 0),

    -- Minimum balance cannot be negative
    CONSTRAINT chk_savings_plan_min  CHECK (minimum_balance >= 0)
);
