"""
crud/branches.py
================
Database operations for the BRANCH table.

Rules followed:
  - All queries use %s placeholders (never f-strings).
  - Every function receives (cursor, conn) so the router can
    commit() or rollback() after calling us.
  - Functions return plain dicts so the router can build
    Pydantic response models from them.
"""

import mysql.connector  # only used for the IntegrityError type


# ---------------------------------------------------------------------------
# Helper: turn one DB row into a plain dict
# (cursor.description gives us the column names)
# ---------------------------------------------------------------------------
def _row_to_dict(cursor) -> dict | None:
    """Return the last fetched row as a dict, or None if nothing was fetched."""
    row = cursor.fetchone()
    if row is None:
        return None
    # cursor.description is a list of (name, type, …) tuples
    columns = [col[0] for col in cursor.description]
    return dict(zip(columns, row))


def _rows_to_list(cursor) -> list[dict]:
    """Return all fetched rows as a list of dicts."""
    rows = cursor.fetchall()
    if not rows:
        return []
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in rows]


# ---------------------------------------------------------------------------
# READ all branches
# ---------------------------------------------------------------------------
def get_all_branches(cursor, conn) -> list[dict]:
    """Return every branch as a list of dicts."""
    cursor.execute("SELECT branch_id, branch_name, address, phone FROM BRANCH")
    return _rows_to_list(cursor)


# ---------------------------------------------------------------------------
# READ one branch by PK
# ---------------------------------------------------------------------------
def get_branch_by_id(cursor, conn, branch_id: int) -> dict | None:
    """Return the branch with this id, or None if it does not exist."""
    cursor.execute(
        "SELECT branch_id, branch_name, address, phone FROM BRANCH WHERE branch_id = %s",
        (branch_id,),
    )
    return _row_to_dict(cursor)


# ---------------------------------------------------------------------------
# CREATE a new branch
# ---------------------------------------------------------------------------
def create_branch(cursor, conn, branch_name: str, address: str, phone: str) -> dict:
    """
    Insert a new branch row.
    Returns the newly created branch as a dict.
    Raises mysql.connector.IntegrityError if branch_name or phone already exists.
    """
    cursor.execute(
        """
        INSERT INTO BRANCH (branch_name, address, phone)
        VALUES (%s, %s, %s)
        """,
        (branch_name, address, phone),
    )
    conn.commit()                        # save the insert
    new_id = cursor.lastrowid           # MySQL gives us the new PK
    return get_branch_by_id(cursor, conn, new_id)


# ---------------------------------------------------------------------------
# UPDATE an existing branch
# ---------------------------------------------------------------------------
def update_branch(
    cursor,
    conn,
    branch_id: int,
    branch_name: str | None,
    address: str | None,
    phone: str | None,
) -> dict | None:
    """
    Update only the fields that are not None.
    Returns the updated branch dict, or None if branch_id was not found.
    Raises mysql.connector.IntegrityError on duplicate name/phone.
    """
    # Build the SET clause dynamically (only include provided fields)
    fields = []   # e.g. ["branch_name = %s", "phone = %s"]
    values = []   # matching values

    if branch_name is not None:
        fields.append("branch_name = %s")
        values.append(branch_name)
    if address is not None:
        fields.append("address = %s")
        values.append(address)
    if phone is not None:
        fields.append("phone = %s")
        values.append(phone)

    # Nothing to update — just return the current record
    if not fields:
        return get_branch_by_id(cursor, conn, branch_id)

    values.append(branch_id)            # for the WHERE clause
    sql = "UPDATE BRANCH SET " + ", ".join(fields) + " WHERE branch_id = %s"
    # fields contains only our own hardcoded strings — never user input.
    # Values are still parameterised with %s placeholders.
    cursor.execute(sql, tuple(values))
    conn.commit()

    if cursor.rowcount == 0:
        return None                     # no row matched -> branch not found

    return get_branch_by_id(cursor, conn, branch_id)
