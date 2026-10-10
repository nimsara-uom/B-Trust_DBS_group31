# DBS_group31
# Microbanking Management System

A full-stack banking web application designed for microfinance and localized retail banking operations. The system manages core branch operations, account lifecycles, ACID-compliant transactions, fixed deposit commitments, and automated monthly interest calculations.

---

## Tech Stack

* **Frontend:** React (Vite, JavaScript/JSX)
* **Backend:** FastAPI (Python 3.10+ / Python 3.14)
* **Database:** MySQL 8.0+
* **Server & Communication:** Uvicorn, RESTful JSON APIs, CORS Middleware

---

## System Architecture & Core Entities

The database schema is designed in 3rd Normal Form (3NF) and models six core entities:

1. **Branch:** Represents physical banking branches.
2. **Agent:** Field agents associated with specific branches.
3. **Customer:** Bank clients, supporting individual and joint account configurations.
4. **SavingsAccount:** Primary customer accounts categorized by plan tiers (e.g., Children, Adult, Senior).
5. **FixedDeposit:** Term deposits linked directly to a savings account (enforcing a strict `1:0..1` relationship).
6. **Transaction:** Audit ledger of deposits, withdrawals, and interest credits.

---

## Team Modules & Responsibilities

| Role | Module | Database (MySQL) Responsibility | Backend (FastAPI) & Frontend Responsibility |
| :--- | :--- | :--- | :--- |
| **Member 1** | Core Schema & Registry | DDL scripts for `Branch`, `Agent`, `Customer`, and `SavingsAccount` with PK/FK constraints. | Customer registration endpoints and account creation interfaces. |
| **Member 2** | Transaction Engine (ACID) | `Transaction` table, stored procedures `sp_ProcessDeposit` and `sp_ProcessWithdrawal` with transaction locks and overdraft checks. | Deposit/withdrawal endpoints and transaction management UI forms. |
| **Member 3** | Fixed Deposit Logic | `FixedDeposit` table, `trg_CheckSingleFDConstraint` trigger, and `fn_CalculateMaturityDate` function. | FD creation API, tenure management, and maturity calculation displays. |
| **Member 4** | Interest Processing | Stored procedure `sp_RunMonthlyEngine` utilizing database cursors for monthly interest distribution. | Scheduled background endpoint execution and interest auditing logs. |
| **Member 5** | Data & Analytics Reporting | DML sample data scripts and multi-table analytical `JOIN` queries for management summaries. | Report aggregation endpoints and dynamic dashboard/table views in React. |

---

## Project Structure

```text
bank-system-project/
├── backend/
│   ├── main.py              # FastAPI application entry point & CORS configuration
│   ├── database.py          # MySQL database connection pool
│   ├── routers/             # API route endpoints partitioned by module
│   │   ├── accounts.py
│   │   ├── transactions.py
│   │   ├── deposits.py
│   │   └── reports.py
│   └── requirements.txt     # Python backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components (forms, tables, modals)
│   │   ├── pages/           # Module views (Dashboard, Transactions, Reports)
│   │   ├── App.jsx          # Root React component
│   │   └── main.jsx         # React application entry point
│   ├── package.json         # Node.js dependencies and run scripts
│   └── vite.config.js       # Vite development configuration
│
└── database/
    ├── schema.sql           # DDL: Tables, constraints, and triggers
    ├── procedures.sql       # Stored procedures and functions
    └── seed_data.sql        # DML: Sample branches, customers, and transactions
