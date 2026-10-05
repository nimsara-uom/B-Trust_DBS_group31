"""
crud/agents.py
==============
Database operations for the AGENT table.

Rules:
  - Parameterised queries only (%s), no f-strings in SQL values.
  - Functions receive (cursor, conn) and return plain dicts.
  - branch_id FK is validated by MySQL; we let IntegrityError bubble up.
"""

import mysql.connector  # for IntegrityError type reference


# ---------------------------------------------------------------------------
# Helpers (same pattern as branches.py)
# ---------------------------------------------------------------------------
def _row_to_dict(cursor) -> dict | None:
    row = cursor.fetchone()
    if row is None:
        return None
    columns = [col[0] for col in cursor.description]
    return dict(zip(columns, row))


def _rows_to_list(cursor) -> list[dict]:
    rows = cursor.fetchall()
    if not rows:
        return []
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in rows]


# ---------------------------------------------------------------------------
# READ all agents (optional filter by branch_id)
# ---------------------------------------------------------------------------
def get_all_agents(cursor, conn, branch_id: int | None = None) -> list[dict]:
    """
    Return all agents. If branch_id is given, only return agents for that branch.
    """
    if branch_id is None:
        # No filter — return everyone
        cursor.execute(
            "SELECT agent_id, branch_id, agent_name, phone FROM AGENT"
        )
    else:
        # Filter by branch
        cursor.execute(
            "SELECT agent_id, branch_id, agent_name, phone FROM AGENT WHERE branch_id = %s",
            (branch_id,),
        )
    return _rows_to_list(cursor)


# ---------------------------------------------------------------------------
# READ one agent by PK
# ---------------------------------------------------------------------------
def get_agent_by_id(cursor, conn, agent_id: int) -> dict | None:
    """Return the agent with this id, or None if not found."""
    cursor.execute(
        "SELECT agent_id, branch_id, agent_name, phone FROM AGENT WHERE agent_id = %s",
        (agent_id,),
    )
    return _row_to_dict(cursor)


# ---------------------------------------------------------------------------
# CREATE a new agent
# ---------------------------------------------------------------------------
def create_agent(
    cursor, conn, branch_id: int, agent_name: str, phone: str
) -> dict:
    """
    Insert a new agent.
    Returns the created agent dict.
    Raises mysql.connector.IntegrityError if:
      - branch_id does not exist (FK violation)
      - phone is already taken (UNIQUE constraint)
    """
    cursor.execute(
        """
        INSERT INTO AGENT (branch_id, agent_name, phone)
        VALUES (%s, %s, %s)
        """,
        (branch_id, agent_name, phone),
    )
    conn.commit()
    new_id = cursor.lastrowid
    return get_agent_by_id(cursor, conn, new_id)


# ---------------------------------------------------------------------------
# UPDATE an existing agent (name and phone only — branch_id is not editable)
# ---------------------------------------------------------------------------
def update_agent(
    cursor,
    conn,
    agent_id: int,
    agent_name: str | None,
    phone: str | None,
) -> dict | None:
    """
    Update only the provided fields.
    Returns the updated agent dict, or None if agent_id was not found.
    Raises mysql.connector.IntegrityError on duplicate phone.
    """
    fields = []
    values = []

    if agent_name is not None:
        fields.append("agent_name = %s")
        values.append(agent_name)
    if phone is not None:
        fields.append("phone = %s")
        values.append(phone)

    # Nothing to update
    if not fields:
        return get_agent_by_id(cursor, conn, agent_id)

    values.append(agent_id)
    sql = "UPDATE AGENT SET " + ", ".join(fields) + " WHERE agent_id = %s"
    cursor.execute(sql, tuple(values))
    conn.commit()

    if cursor.rowcount == 0:
        return None                     # no row matched -> agent not found

    return get_agent_by_id(cursor, conn, agent_id)
