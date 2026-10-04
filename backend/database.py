import mysql.connector
from mysql.connector import pooling
from fastapi import HTTPException, status
from config import settings

# දත්ත සමුදාය සමඟ සම්බන්ධ වීමට Connection Pool එකක් සෑදීම
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
    FastAPI Dependency: සෑම API Request එකකදීම Database Cursor එකක් ලබා දීම
    සහ අවසානයේදී එය ආරක්ෂිතව වසා දැමීම මෙයින් සිදු කරයි.
    """
    if db_pool is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection pool is not initialized."
        )
    
    connection = None
    cursor = None
    try:
        # Pool එකෙන් connection එකක් ලබා ගැනීම
        connection = db_pool.get_connection()
        # dictionary=True යෙදීමෙන් ප්‍රතිඵල Python Dictionary එකක් ලෙස ලබා දේ
        cursor = connection.cursor(dictionary=True)
        
        yield cursor  # Cursor එක API endpoint එකට ලබා දෙයි
        
        connection.commit()  # සාර්ථක වුවහොත් වෙනස්කම් සේව් කරයි
    except mysql.connector.Error as err:
        if connection:
            connection.rollback()  # දෝෂයක් ආවොත් වෙනස්කම් අවලංගු කරයි
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database Error: {err}"
        )
    finally:
        # වැඩේ ඉවර වුනාට පස්සේ connection එකයි cursor එකයි අනිවාර්යයෙන්ම වසා දමයි (auto-closes)
        if cursor:
            cursor.close()
        if connection:
            connection.close()
