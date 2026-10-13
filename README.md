# B-Trust Microbanking & Interest Management System

[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB)](frontend/)
[![Backend](https://img.shields.io/badge/backend-FastAPI-009688)](backend/)
[![Database](https://img.shields.io/badge/database-MySQL%208-4479A1)](sql/)
[![Deployment](https://img.shields.io/badge/deployment-Vercel%20%7C%20Render%20%7C%20AlwaysData-6f42c1)](#9-deployment-architecture-render--vercel--alwaysdata)

## 1. Header & Project Overview

B-Trust is a full-stack microbanking management system for localized retail
banking and microfinance operations. It manages branches, agents, customers,
savings accounts, deposits, withdrawals, fixed deposits, interest processing,
and management reporting.

> Built with caffeine and late nights. ☕

## Live Links

| Resource | Link |
| --- | --- |
| Frontend development server | <http://localhost:5173> |
| Backend development server | <http://127.0.0.1:8000> |
| Swagger UI | <http://127.0.0.1:8000/docs> |
| Health check | <http://127.0.0.1:8000/health> |
| Production frontend | [Open the deployed B-Trust application](https://b-trust-dbs-group31-72v9bhy5t-nimsara-uoms-projects.vercel.app/) |
| Production backend | Configure through Render; no fixed URL is stored in this repository |

The local links become available after following the setup instructions below.

### Contents

- [2. Core Features & Business Capabilities](#2-core-features--business-capabilities)
- [3. System Architecture & Tech Stack](#3-system-architecture--tech-stack)
- [4. Team Workload & Contribution Breakdown](#4-team-workload--contribution-breakdown)
- [5. Project Directory Structure](#5-project-directory-structure)
- [6. Database Design & Integrity Rules](#6-database-design--integrity-rules)
- [7. API Reference & Swagger Documentation](#7-api-reference--swagger-documentation)
- [8. Local Setup & Installation Guide](#8-local-setup--installation-guide)
- [9. Deployment Architecture: Render + Vercel + AlwaysData](#9-deployment-architecture-render--vercel--alwaysdata)

## 2. Core Features & Business Capabilities

### Administrator capabilities

- Dashboard showing customer, savings, fixed-deposit, interest, and transaction
  summaries
- Customer registration and search
- Agent and branch management
- Savings plan and savings-account management
- Account-holder management, including joint accounts
- Deposits, withdrawals, and transaction history
- Fixed-deposit creation and lifecycle tracking
- Monthly fixed-deposit interest-engine execution
- Operational and financial reports

### Customer capabilities

- Customer self-service portal
- Profile and account-balance viewing
- Savings-account transaction history
- Active fixed-deposit viewing
- Transfers between eligible accounts
- Password change

### Business rules implemented

- Savings-account balances cannot become negative.
- Withdrawals cannot reduce an account below its savings-plan minimum balance.
- Transaction amounts must be positive.
- Transaction reference numbers are unique.
- A fixed deposit is linked to a savings account and FD plan.
- An account can have at most one active fixed deposit.
- FD maturity dates are calculated from the selected plan term.
- Interest credits are recorded as auditable bank transactions.
- Financial operations use database transactions, row locks, rollback handlers,
  and balance-update triggers.

## 3. System Architecture & Tech Stack

```text
React/Vite frontend
        |
        | Axios REST/JSON requests with HTTP Basic credentials
        v
FastAPI backend
        |
        | MySQL Connector/Python connection pool
        v
MySQL 8 database hosted locally or on AlwaysData
```


### Cloud and deployment

- **AlwaysData:** MySQL database host configured by environment variables
- **Render:** FastAPI backend deployment configuration
- **Vercel:** Frontend deployment configuration
- **Docker:** Local and containerized deployment through Docker Compose

## 4. Team Workload & Contribution Breakdown

The project documentation identifies five contributors. The table below maps
their database responsibilities to the corresponding Phase 2 application work.

### Summary matrix

| Contributor | Phase 1 database role | Phase 2 backend/frontend role |
| :--- | :--- | :--- |
| Sandamini M.M.R (`240589C`) | **Member 2:** Transaction Procedures (ACID Engine) | **Member 1:** Project Foundation, Config, DB Pool & Auth |
| Dananjaya P.D.L.K (`240118J`) | **Member 3:** Fixed Deposit Logic & Triggers | **Member 2:** Branches, Agents & Customers CRUD APIs |
| Yasarathna G.L.R.S (`240741L`) | **Member 4:** Automated Interest Engine (`sp_RunMonthlyEngine`) | **Member 3:** Savings Accounts, Plans & Holders APIs |
| Kodithuwakku K.A.N.N (`240351P`) | **Member 1:** Core Schema & Master Setup | **Member 4:** Transactions (Deposits, Withdrawals) & Procedures |
| Jayawardana Y.G.L.S (`240294R`) | **Member 5:** Data Population & Reporting Queries | **Member 5:** Fixed Deposits & 5 Management Reports |

### Phase 1: MySQL Database & Core Logic Engine

#### Kodithuwakku K.A.N.N — Core Schema & Master Setup (Member 1)
- Wrote Data Definition Language (DDL) statements to create `BRANCH`, `AGENT`, `CUSTOMER`, and `SAVINGSACCOUNT` tables.
- Enforced all Primary Keys, Foreign Keys, unique constraints, and ENUMs for account plans.
- Ensured strict 3rd Normal Form (3NF) adherence and relational integrity across the registry.

#### Sandamini M.M.R — Transaction Procedures / ACID Engine (Member 2)
- Created the `BANK_TRANSACTION` ledger table.
- Implemented the critical stored procedures `sp_ProcessDeposit` and `sp_ProcessWithdrawal`.
- Applied transaction control (`START TRANSACTION`, `COMMIT`, `ROLLBACK`), row-level locking, and overdraft protection based on minimum balance rules.

#### Dananjaya P.D.L.K — Fixed Deposit Logic & Triggers (Member 3)
- Created the `FIXEDDEPOSIT` table and associated structures.
- Implemented the database trigger `trg_CheckSingleFDConstraint` (enforcing one active FD per savings account).
- Developed the stored function `fn_CalculateMaturityDate` to handle 6, 12, and 36-month maturity date calculations.

#### Yasarathna G.L.R.S — Automated Interest Engine (Member 4)
- Implemented the complex batch stored procedure `sp_RunMonthlyEngine`.
- Utilized database cursors to iterate across active accounts and fixed deposits, calculating exact 30-day interest based on plan rates.
- Handled balance updates, interest audit records in the transaction ledger, and date advancements.

#### Jayawardana Y.G.L.S — Data Population & Reporting Queries (Member 5)
- Prepared Data Manipulation Language (DML) scripts and seed datasets (branches, agents, customers, plans, FDs, and transactions).
- Authored the 5 complex multi-table management report queries (`SELECT` with advanced `JOIN`s, `GROUP BY`, and aggregate metrics).
- Validated business reporting outputs and operational integrity.

### Phase 2: FastAPI Backend & API Layer (Swagger UI / QA)

- **Sandamini M.M.R (Backend Member 1 — Project Foundation & Auth):**
  - Project scaffolding, `config.py` environment settings, and `requirements.txt`.
  - Database connection pooling (`database.py`) with `get_db()` FastAPI dependency.
  - HTTP Basic Authentication (`auth.py`) and FastAPI root setup (`main.py`, CORS, `/health`).

- **Dananjaya P.D.L.K (Backend Member 2 — Branches, Agents & Customers):**
  - Pydantic models, CRUD functions, and API routers for `/api/branches`, `/api/agents`, and `/api/customers`.
  - Branch and agent management and customer onboarding/update workflows.

- **Yasarathna G.L.R.S (Backend Member 3 — Savings Accounts, Plans & Holders):**
  - Pydantic schemas, CRUD layer, and route handlers for `/api/plans`, `/api/accounts`, and `/api/accounts/{account_id}/holders`.
  - Account opening, plan eligibility validation, status toggling, and joint account holder linking.

- **Kodithuwakku K.A.N.N (Backend Member 4 — Transactions & Stored Procedures):**
  - Transaction models, route handlers, and DB calls for `/api/transactions/deposit`, `/api/transactions/withdraw`, and transaction queries with filters.
  - Integration with stored procedures `sp_ProcessDeposit` and `sp_ProcessWithdrawal`, returning clean HTTP 400 error responses on trigger/overdraft rejections.

- **Jayawardana Y.G.L.S (Backend Member 5 — Fixed Deposits & 5 Management Reports):**
  - Fixed deposit schemas, CRUD queries, and endpoints (`/api/fd-plans`, `/api/fixed-deposits`, `/api/interest-engine/run`).
  - Implemented the 5 mandatory management report endpoints (`/api/reports/*`) and aggregation queries.

- **Shared QA & Validation:**
  - Full API and database connectivity validation using auto-generated Swagger UI (`/docs`).
  - Verification of triggers, stored procedures, overdraft checks, and report generation across all endpoints.

## 5. Project Directory Structure

```text
.
├── backend/
│   ├── crud/                 SQL access and business operations
│   ├── models/               Pydantic request/response models
│   ├── routers/              FastAPI route modules
│   ├── auth.py               Authentication dependency
│   ├── audit_db.py           Database inspection and validation utility
│   ├── config.py             Environment-backed settings
│   ├── database.py           MySQL connection pool and request dependency
│   ├── main.py               FastAPI application entry point
│   ├── requirements.txt      Python dependencies
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── layouts/          Shared dashboard layouts
│   │   ├── pages/            Dashboard and business-module screens
│   │   ├── api.js            Axios API client
│   │   ├── AuthContext.jsx   Frontend authentication state
│   │   └── App.jsx           Routes and protected layouts
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .env.example
├── sql/
│   ├── 01_create_branch.sql
│   ├── 02_create_agent.sql
│   ├── 03_create_customer.sql
│   ├── 04_create_savings_plan.sql
│   ├── 05_create_savings_account.sql
│   ├── 06_create_account_holder.sql
│   ├── 07_create_fd_plan.sql
│   ├── 08_create_fixed_deposit.sql
│   ├── 09_create_transaction.sql
│   ├── 10_seed_plans.sql
│   ├── 11_seed_sample_data.sql
│   ├── 11b_seed_transactions.sql
│   ├── 12_triggers.sql
│   ├── 13_transaction_procedures.sql
│   ├── 14_interest_engine.sql
│   └── report_*.sql
├── docs/                     PDF project documentation
├── docs_md/                  Markdown requirements and design notes
├── docker-compose.yml
├── render.yaml
└── README.md
```

Generated folders such as `backend/venv`, `frontend/node_modules`, and
`frontend/dist` are local build/install outputs and are not needed in source
control.

## 6. Database Design & Integrity Rules

### Core tables & schema highlights

| Table | Purpose | Important integrity rules |
| --- | --- | --- |
| `BRANCH` | Physical banking locations | Unique name and phone |
| `AGENT` | Staff/field agents assigned to branches | Branch foreign key |
| `CUSTOMER` | Individual and joint customers | Unique national ID and phone |
| `SAVINGSPLAN` | Savings tiers and minimum balances | Referenced by accounts |
| `SAVINGSACCOUNT` | Customer savings accounts | Unique account number, non-negative balance |
| `ACCOUNTHOLDER` | Customer-to-account relationship | Supports joint accounts |
| `FDPLAN` | Fixed-deposit terms and rates | Referenced by fixed deposits |
| `FIXEDDEPOSIT` | Term-deposit commitments | Positive principal and valid dates |
| `BANK_TRANSACTION` | Deposit, withdrawal, and interest ledger | Positive amount and unique reference |

The schema uses primary keys for entity identity and foreign keys with
appropriate update/delete restrictions. Financial values use fixed-precision
`DECIMAL` columns rather than floating-point storage.

### Triggers, stored procedures & functions

#### Triggers

- `trg_check_withdrawal` prevents withdrawals that breach a savings-plan
  minimum balance.
- `trg_update_balance` updates `SAVINGSACCOUNT.current_balance` after deposits,
  withdrawals, and FD-interest credits.
- `trg_fd_maturity_check` changes an active FD to `Matured` when its interest
  schedule reaches maturity.
- `trg_CheckSingleFDConstraint` prevents more than one active FD per account.

#### Stored procedures

- `sp_ProcessDeposit` locks the account and inserts an atomic deposit.
- `sp_ProcessWithdrawal` locks the account and inserts an atomic withdrawal.
- `sp_CreateFixedDeposit` validates the account, plan, and principal before
  creating an FD.
- `sp_RunMonthlyEngine` calculates and credits monthly FD interest in one
  auditable batch.

#### Stored function and scheduler

- `fn_CalculateMaturityDate` calculates the maturity date from a start date and
  plan term.
- The MySQL Event Scheduler can invoke the monthly interest procedure
  automatically.

### Management reports

The application exposes the following reports through the Reports page and
FastAPI:

1. **Agent transaction summary** — transaction activity grouped by agent.
2. **Account transaction summary** — activity and totals grouped by account.
3. **Active fixed deposits and next interest payout** — active FD commitments
   and upcoming payout dates.
4. **Monthly interest distribution** — interest credits grouped by period.
5. **Customer activity summary** — customer-level account and transaction
   activity.

The implementation also includes **Report 6: Monthly bank transaction
summary**, which summarizes monthly transaction activity across the bank.

## 7. API Reference & Swagger Documentation

Start the backend and open <http://127.0.0.1:8000/docs> for the interactive
Swagger UI. FastAPI also provides the raw OpenAPI document at
<http://127.0.0.1:8000/openapi.json>.

### Route groups

| Area | Base path | Purpose |
| --- | --- | --- |
| Authentication | `/api/auth` | Admin and customer login |
| Dashboard | `/api/dashboard` | Summary statistics and chart data |
| Customers | `/api/customers` | Customer records, portal data, transfers, and passwords |
| Accounts | `/api/accounts` | Savings plans, accounts, status, and holders |
| Transactions | `/api/transactions` | Deposits, withdrawals, and transaction history |
| Fixed deposits | `/api/fixed-deposits` | FD plans, FDs, and interest engine |
| Agents | `/api/agents` | Agent listing and creation |
| Branches | `/api/branches` | Branch listing |
| Reports | `/api/reports` | Six management reports |
| Health | `/health` | API/database health check |

All route groups except login are protected by the backend authentication
dependency. The frontend sends credentials through its Axios interceptor.

## 8. Local Setup & Installation Guide

### Prerequisites

- Python 3.11 or newer
- Node.js 20 or newer and npm
- MySQL 8 or a compatible MySQL server
- Docker Desktop, if using the container workflow

### Database setup

1. Create a MySQL database.
2. Copy `backend/.env.example` to `backend/.env`.
3. Set `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and
   `DB_USE_SSL`.
4. Run the SQL files in dependency order:
   `01` through `09`, seed/plan files, triggers, procedures, interest engine,
   and report scripts.
5. Confirm connectivity with the backend `/health` endpoint.

Example MySQL client workflow:

```sql
SOURCE sql/01_create_branch.sql;
SOURCE sql/02_create_agent.sql;
SOURCE sql/03_create_customer.sql;
-- Continue in the documented numeric order.
```

### Backend setup

From the repository root in PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend setup

Open a second PowerShell terminal:

```powershell
Copy-Item frontend\.env.example frontend\.env
cd frontend
npm install
npm run dev
```

Useful frontend commands:

```powershell
npm run lint
npm run build
npm run preview
```

For local development, `frontend/vite.config.js` proxies API requests to
`http://127.0.0.1:8000`. For a separately deployed backend, set
`VITE_API_BASE_URL` in `frontend/.env`.

### Docker Compose

Configure `backend/.env`, then run from the repository root:

```powershell
docker compose up --build
```

The frontend is exposed at <http://localhost:5173> and the backend at
<http://localhost:8000>. The Compose file does not create a MySQL container;
it uses the MySQL instance specified in `backend/.env`.

## 9. Deployment Architecture: Render + Vercel + AlwaysData

```text
User browser
    |
    v
Vercel-hosted React frontend
    |
    | VITE_API_BASE_URL / HTTPS REST requests
    v
Render-hosted FastAPI backend
    |
    | MySQL Connector/Python over configured connection
    v
AlwaysData-hosted MySQL database
```

### AlwaysData

The MySQL database connection is configured with `DB_HOST`, `DB_PORT`,
`DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `DB_USE_SSL`. The repository's
deployment template uses an AlwaysData hostname, but passwords must be entered
through the hosting provider's secret settings.

### Render

The root [`render.yaml`](render.yaml) describes the backend web service:

- Python runtime
- `backend` as the service root
- `pip install -r requirements.txt` build command
- Uvicorn start command bound to Render's `$PORT`
- Database and authentication variables supplied as environment variables

### Vercel

The deployed frontend is available at
<https://b-trust-dbs-group31-72v9bhy5t-nimsara-uoms-projects.vercel.app/>.
The frontend can be deployed as a Vite application. Set
`VITE_API_BASE_URL` to the public Render backend URL and ensure the deployment
serves the React Router fallback configured in [`frontend/vercel.json`](frontend/vercel.json).

### Docker deployment

For environments that support containers, the root
[`docker-compose.yml`](docker-compose.yml) starts:

- A FastAPI backend on port `8000`
- An Nginx-served frontend on port `5173`
- A shared `bank_network` Docker network

## Security and Configuration Notes

- Never commit `backend/.env` or real credentials.
- Replace the example admin password before deployment.
- Store Render, Vercel, and AlwaysData secrets in provider-managed environment
  variables.
- Use HTTPS for deployed frontend/backend communication.
- The backend currently uses HTTP Basic Authentication; protect production
  deployments with TLS and appropriate platform access controls.

## Project Documentation

Additional requirements, ER design, and project material are available in
[`docs/`](docs/) and [`docs_md/`](docs_md/).


