# Project 4 - Microbanking and Interest Management System

## Overview & Background
**B-Trust** is a small private microfinance bank operating across several districts in Sri Lanka. The bank aims to support financial inclusion by offering basic savings products and fixed deposits, particularly for rural communities. To improve service efficiency, the bank has decided to digitise its core operations and offer customers the ability to deposit, withdraw, and monitor their balances through an online system managed by regional service agents.

Your team has been hired to design the backend database of this **Microbanking and Interest Management System (MIMS)**. A lightweight UI must be developed to allow QA testers to interact with the database and validate key operations.

---

## System Requirements

1. **Branches and Banking Agents:**
   - The bank operates a series of service branches, each managing a team of banking agents.
   - Customers can register at any branch and are assigned to a specific agent.

2. **Savings Accounts:**
   - Each customer can open one or more Savings Accounts.
   - Account holders may be individuals or joint customers.
   - Savings Accounts are offered under five distinct plans:
     | Plan | Interest Rate (p.a.) | Minimum Balance | Eligibility Criteria |
     | :--- | :---: | :---: | :--- |
     | **Children** | 12% | None | Customer under 13 years |
     | **Teen** | 11% | LKR 500 | Customer 13–17 years |
     | **Adult (18+)** | 10% | LKR 1,000 | Customer 18–59 years |
     | **Senior (60+)** | 13% | LKR 1,000 | Customer 60 years and above |
     | **Joint** | 7% | LKR 5,000 | Two or more account holders |

3. **Deposits and Withdrawals:**
   - Customers can make deposits and withdrawals at any time during business hours via the system.
   - All transactions must be logged with timestamps, transaction type, and reference numbers.
   - Overdrafts are strictly **not allowed**.
   - Only account holders meeting the minimum balance and eligibility criteria can perform withdrawals.

4. **Fixed Deposits (FD):**
   - Customers with an active Savings Account may open a Fixed Deposit (FD).
   - FD options include:
     | Term / Tenure | Annual Interest Rate |
     | :--- | :---: |
     | **6 months** | 13% |
     | **1 year** | 14% |
     | **3 years** | 15% |
   - **FD Constraint:** Customers can only have **one active FD per Savings Account**.
   - FD interest is calculated monthly and credited directly to the linked Savings Account.
   - Each interest credit is treated as a separate transaction.
   - A **30-day period** is used as the monthly cycle for interest calculation.

5. **Joint Accounts:**
   - Customers may also apply for Joint Accounts, allowing multiple users to deposit or withdraw.

6. **Centralized Processing & Audit Logging:**
   - All interest calculations are processed by the central system.
   - The bank must keep track of transaction history, interest distributions, and account activity per customer.

---

## Mandatory Management Reports
The management expects the following 5 reports from the system:

1. **Agent-wise total number and value of transactions**
2. **Account-wise transaction summary and current balance**
3. **List of active FDs and their next interest payout dates**
4. **Monthly interest distribution summary by account type**
5. **Customer activity report (total deposits, withdrawals, and net balance)**

---

## Tasks & Deliverables

Your task is to model the database design to encapsulate these requirements:
- **Entity-Relationship Modeling:** Design relational schema considering all entities and relationships.
- **ACID Integrity & Business Logic:** Identify where stored procedures, functions, and triggers can be applied to guarantee ACID properties.
- **Keys & Constraints:** Use foreign keys and primary keys to enforce data integrity.
- **Performance:** Add indexing where necessary to optimize performance.
- **Domain-Specific Assumptions:** Research similar microfinance systems and make appropriate assumptions (e.g., withdrawal limits, transaction cutoffs).
- **Sample Data Population:** Populate the database with sample data, including:
  - At least **5 agents** and **3 branches**
  - **15 customers** (including at least 2 joint accounts)
  - **10 fixed deposits**
  - **100 transactions** (a mix of deposits, withdrawals, and interest credits)
