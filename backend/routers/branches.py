"""
routers/branches.py
===================
FastAPI router for BRANCH endpoints.

Endpoints:
  GET  /api/branches          -> list all branches
  GET  /api/branches/{id}     -> get one branch (404 if missing)
  POST /api/branches          -> create branch (201)
  PUT  /api/branches/{id}     -> update branch (404 if missing)

NOTE FOR MEMBER 1:
  This router imports two things you must provide in your files:
    1. get_db  from database.py  — a FastAPI dependency that yields
                                   (cursor, connection).
    2. require_auth from auth.py — a FastAPI dependency for HTTP Basic Auth.
  Once you add those, this router will work without any changes here.
"""

from fastapi import APIRouter, Depends, HTTPException, status
import mysql.connector

# Member 1's dependencies (fill these in once database.py / auth.py are done)
from database import get_db       # yields (cursor, conn)
from auth import require_auth     # HTTP Basic Auth dependency

# Day-1 Pydantic models (Member 2, do not change)
from models.branch import BranchCreate, BranchUpdate, BranchResponse

# CRUD functions we just wrote
from crud.branches import (
    get_all_branches,
    get_branch_by_id,
    create_branch,
    update_branch,
)

# ---------------------------------------------------------------------------
# Router — all paths start with /api/branches
# ---------------------------------------------------------------------------
router = APIRouter(
    prefix="/api/branches",
    tags=["Branches"],          # shown as a section in Swagger UI
)


# ---------------------------------------------------------------------------
# GET /api/branches  — list all branches
# ---------------------------------------------------------------------------
@router.get(
    "/",
    response_model=list[BranchResponse],
    summary="List all branches",
)
def list_branches(
    db=Depends(get_db),
    _=Depends(require_auth),    # any logged-in user can list branches
):
    cursor, conn = db
    branches = get_all_branches(cursor, conn)
    return branches             # FastAPI serialises list[dict] via response_model


# ---------------------------------------------------------------------------
# GET /api/branches/{branch_id}  — get one branch
# ---------------------------------------------------------------------------
@router.get(
    "/{branch_id}",
    response_model=BranchResponse,
    summary="Get a branch by ID",
)
def get_branch(
    branch_id: int,
    db=Depends(get_db),
    _=Depends(require_auth),
):
    cursor, conn = db
    branch = get_branch_by_id(cursor, conn, branch_id)

    if branch is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Branch with id {branch_id} not found.",
        )
    return branch


# ---------------------------------------------------------------------------
# POST /api/branches  — create a new branch
# ---------------------------------------------------------------------------
@router.post(
    "/",
    response_model=BranchResponse,
    status_code=status.HTTP_201_CREATED,   # 201 on success
    summary="Create a new branch",
)
def create_new_branch(
    body: BranchCreate,
    db=Depends(get_db),
    _=Depends(require_auth),
):
    cursor, conn = db
    try:
        new_branch = create_branch(
            cursor, conn,
            branch_name=body.branch_name,
            address=body.address,
            phone=body.phone,
        )
    except mysql.connector.IntegrityError as e:
        # Unique constraint on branch_name or phone was violated
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A branch with that name or phone number already exists.",
        ) from e

    return new_branch


# ---------------------------------------------------------------------------
# PUT /api/branches/{branch_id}  — update an existing branch
# ---------------------------------------------------------------------------
@router.put(
    "/{branch_id}",
    response_model=BranchResponse,
    summary="Update a branch",
)
def update_existing_branch(
    branch_id: int,
    body: BranchUpdate,
    db=Depends(get_db),
    _=Depends(require_auth),
):
    cursor, conn = db
    try:
        updated = update_branch(
            cursor, conn,
            branch_id=branch_id,
            branch_name=body.branch_name,
            address=body.address,
            phone=body.phone,
        )
    except mysql.connector.IntegrityError as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A branch with that name or phone number already exists.",
        ) from e

    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Branch with id {branch_id} not found.",
        )
    return updated
