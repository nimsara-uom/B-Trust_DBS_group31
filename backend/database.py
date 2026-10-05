"""
database.py — Database Connection
===================================
Creates a MySQL connection pool and exposes get_db(), a FastAPI dependency
that yields (cursor, conn) to route handlers.

Usage in a router:
    from database import get_db
    ...
    def my_route(db=Depends(get_db)):
        cursor, conn = db
        cursor.execute("SELECT ...")
"""

import mysql.connector
from mysql.connector import pooling

from config import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# ---------------------------------------------------------------------------
# Connection pool — created once at import time
# ---------------------------------------------------------------------------
_pool = pooling.MySQLConnectionPool(
    pool_name="microbanking_pool",
    pool_size=5,
    host=DB_HOST,
    port=DB_PORT,
    user=DB_USER,
    password=DB_PASSWORD,
    database=DB_NAME,
)


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------
def get_db():
    """
    Yields a (cursor, conn) tuple for use inside a route handler.
    The connection is returned to the pool automatically when the
    request finishes (whether it succeeds or raises an exception).
    """
    conn = _pool.get_connection()
    cursor = conn.cursor(dictionary=True)   # rows come back as dicts
    try:
        yield cursor, conn
    finally:
        cursor.close()
        conn.close()   # returns the connection to the pool

