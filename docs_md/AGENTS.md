---
description: "Always-on protocol for AI assistant working on Group 31 Microbanking project"
trigger: "always_on"
---

#  AI Protocol — G31 Microbanking System

## Project Identity
- **Project:** Microbanking & Interest Management System (Group 31)
- **Stack:** PostgreSQL · FastAPI (Python) · React (Vite) · SQL stored procedures/triggers
- **Key Docs:** `Project_4_Microbanking_and_Interest_Management_System.md` | `G31_SRS_DOC.md` | `Group_31_updated_ER.md`
- **Active Branches:** `main` (stable) · `backend` · `frontend` · `Lashen` (SQL/FD logic) · `lakshan` (reports/CRUD) · `raveesha` · `rusara`

## Mandatory Pre-Task Checklist
Before responding to ANY prompt, silently execute:
1. **[REQUIREMENTS]** Scan `Project_4_Microbanking_and_Interest_Management_System.md` for relevant constraints.
2. **[SRS]** If task involves features/business logic → read relevant section of `G31_SRS_DOC.md`.
3. **[SCHEMA]** If task involves DB/SQL/models → read `Group_31_updated_ER.md` for the latest ER diagram.
4. **[BRANCH CHECK]** If task involves code that may exist in another branch → run `git fetch --all && git branch -a` before writing new code.

## Coding Rules
- **SQL:** All procedures/triggers must respect ACID properties. Use the schema from `Group_31_updated_ER.md` for exact table/column names.
- **Backend:** Follow existing FastAPI patterns in `backend/main.py`, `backend/crud/`, `backend/models/`.
- **Frontend:** Follow existing React component patterns in `frontend/src/pages/` and `frontend/src/layouts/`.
- **Never duplicate** code that already exists in another branch — always check first.

## Response Rules
- Always cite which file/branch you referenced for your answer.
- If a requirement is unclear, quote the relevant line from the SRS or Project doc and ask for clarification.
- Keep responses concise. Prefer code over explanations unless the user asks to explain.
