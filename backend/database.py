import mysql.connector
from mysql.connector import pooling
from fastapi import HTTPException, status
from config import settings

# Create a connection pool to connect to the database
try:
    db_pool = pooling.MySQLConnectionPool(
        pool_name="mims_pool",
        pool_size=5,
        pool_reset_session=True,
        host=settings.DB_HOST,
        port=settings.DB_PORT,
        user=settings.DB_USER,
        password=settings.DB_PASSWORD,
        database=settings.DB_NAME
    )
except mysql.connector.Error as err:
    print(f"Error creating connection pool: {err}")
    db_pool = None

def get_db():
    """
    FastAPI Dependency: Yields a Database Cursor for each API Request
    and safely closes it at the end.
    """
    if db_pool is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection pool is not initialized."
        )
    
    connection = None
    cursor = None
    try:
        # Get a connection from the pool
        connection = db_pool.get_connection()
        # dictionary=True returns results as Python Dictionaries
        cursor = connection.cursor(dictionary=True)
        
        yield cursor  # Yield the cursor to the API endpoint
        
        connection.commit()  # Commit changes if successful
    except mysql.connector.Error as err:
        if connection:
            connection.rollback()  # Rollback changes on error
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database Error: {err}"
        )
    finally:
        # Auto-close the cursor and connection after the request
        if cursor:
            cursor.close()
        if connection:
            connection.close()
