"""
routers/agents.py
=================
FastAPI router for AGENT endpoints.

Endpoints:
  GET  /api/agents              -> list all (optional ?branch_id= filter)
  GET  /api/agents/{id}         -> get one agent (404 if missing)
  POST /api/agents              -> create agent (400 if branch_id invalid)
  PUT  /api/agents/{id}         -> update agent name/phone (404 if missing)

NOTE FOR MEMBER 1:
  Needs get_db (yields (cursor, conn)) from database.py
  and require_auth from auth.py.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
import mysql.connector

from database import get_db
from auth import require_auth

from models.agent import AgentCreate, AgentUpdate, AgentResponse

from crud.agents import (
    get_all_agents,
    get_agent_by_id,
    create_agent,
    update_agent,
)

# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------
router = APIRouter(
    prefix="/api/agents",
    tags=["Agents"],
)


# ---------------------------------------------------------------------------
# GET /api/agents  — list all agents, with optional ?branch_id= filter
# ---------------------------------------------------------------------------
@router.get(
    "/",
    response_model=list[AgentResponse],
    summary="List all agents (filter by branch_id if given)",
)
def list_agents(
    # Query parameter is optional; default is None (no filter)
    branch_id: int | None = Query(default=None, description="Filter by branch ID", gt=0),
    db=Depends(get_db),
    _=Depends(require_auth),
):
    cursor, conn = db
    agents = get_all_agents(cursor, conn, branch_id=branch_id)
    return agents


# ---------------------------------------------------------------------------
# GET /api/agents/{agent_id}  — get one agent
# ---------------------------------------------------------------------------
@router.get(
    "/{agent_id}",
    response_model=AgentResponse,
    summary="Get an agent by ID",
)
def get_agent(
    agent_id: int,
    db=Depends(get_db),
    _=Depends(require_auth),
):
    cursor, conn = db
    agent = get_agent_by_id(cursor, conn, agent_id)

    if agent is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with id {agent_id} not found.",
        )
    return agent


# ---------------------------------------------------------------------------
# POST /api/agents  — create a new agent
# ---------------------------------------------------------------------------
@router.post(
    "/",
    response_model=AgentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new agent",
)
def create_new_agent(
    body: AgentCreate,
    db=Depends(get_db),
    _=Depends(require_auth),
):
    cursor, conn = db
    try:
        new_agent = create_agent(
            cursor, conn,
            branch_id=body.branch_id,
            agent_name=body.agent_name,
            phone=body.phone,
        )
    except mysql.connector.IntegrityError as e:
        conn.rollback()
        # MySQL error 1452 = foreign key constraint failed (branch doesn't exist)
        # MySQL error 1062 = duplicate entry (phone already taken)
        if e.errno == 1452:
            detail = f"Branch with id {body.branch_id} does not exist."
        elif e.errno == 1062:
            detail = "An agent with that phone number already exists."
        else:
            detail = "Database constraint violation."
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail,
        ) from e

    return new_agent


# ---------------------------------------------------------------------------
# PUT /api/agents/{agent_id}  — update agent name and/or phone
# ---------------------------------------------------------------------------
@router.put(
    "/{agent_id}",
    response_model=AgentResponse,
    summary="Update an agent's name or phone",
)
def update_existing_agent(
    agent_id: int,
    body: AgentUpdate,
    db=Depends(get_db),
    _=Depends(require_auth),
):
    cursor, conn = db
    try:
        updated = update_agent(
            cursor, conn,
            agent_id=agent_id,
            agent_name=body.agent_name,
            phone=body.phone,
        )
    except mysql.connector.IntegrityError as e:
        conn.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An agent with that phone number already exists.",
        ) from e

    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with id {agent_id} not found.",
        )
    return updated
