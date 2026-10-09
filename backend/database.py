import mysql.connector
from fastapi import HTTPException
import os

def get_db():
    """
    Dependency function to get a MySQL database cursor.
    This will be used by FastAPI routers.
    """
    connection = None
    cursor = None
    try:
        # Update these credentials to match your local MySQL configuration
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "microbanking")
        )
        # Using dictionary=True so that row results are returned as dictionaries,
        # which plays nicely with FastAPI's Pydantic response_models
        cursor = connection.cursor(dictionary=True)
        yield cursor
    except mysql.connector.Error as err:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {err}")
    finally:
        if cursor is not None:
            cursor.close()
        if connection is not None and connection.is_connected():
            connection.close()
