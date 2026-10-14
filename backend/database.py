import os
import mysql.connector
from mysql.connector import pooling
from fastapi import HTTPException, status
from config import settings

# SSL is required for  MySQL. Set DB_USE_SSL=true in .env when deploying.
_use_ssl: bool = os.getenv("DB_USE_SSL", "false").lower() == "true"

# Create a connection pool to connect to the database
pool_kwargs = dict(
    pool_name="mims_pool",
    pool_size=10,
    pool_reset_session=True,
    host=settings.DB_HOST,
    port=settings.DB_PORT,
    user=settings.DB_USER,
    password=settings.DB_PASSWORD,
    database=settings.DB_NAME,
    ssl_disabled=not _use_ssl,          # False = SSL ON, True = SSL OFF
    connection_timeout=15,
)

try:
    db_pool = pooling.MySQLConnectionPool(**pool_kwargs)
except mysql.connector.Error as err:
    print(f"Error creating connection pool: {err}")
    db_pool = None


def get_pool():
    global db_pool
    if db_pool is None:
        try:
            db_pool = pooling.MySQLConnectionPool(**pool_kwargs)
        except mysql.connector.Error as err:
            print(f"Error recreating connection pool: {err}")
            db_pool = None
    return db_pool


def get_db():
    """
    FastAPI Dependency: Yields a Database Cursor for each API Request
    and safely closes it at the end.
    """
    pool = get_pool()
    if pool is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection pool is not initialized. Please verify database connectivity."
        )
    
    connection = None
    cursor = None
    try:
        # Get a connection from the pool
        connection = pool.get_connection()
        # Verify connection is alive; reconnect if dropped by remote server idle timeout
        connection.ping(reconnect=True, attempts=3, delay=1)
        # dictionary=True returns results as Python Dictionaries
        cursor = connection.cursor(dictionary=True)
        
        yield cursor, connection  # Yield both cursor and connection to API endpoints
        
        connection.commit()  # Commit changes if successful
    except mysql.connector.Error as err:
        if connection:
            try:
                connection.rollback()  # Rollback changes on error
            except Exception:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database Error: {err}"
        )
    finally:
        # Auto-close the cursor and connection after the request
        if cursor:
            try:
                cursor.close()
            except Exception:
                pass
        if connection:
            try:
                connection.close()
            except Exception:
                pass