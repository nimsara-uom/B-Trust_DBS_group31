import secrets
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from config import settings
from database import get_db

security = HTTPBasic()

def get_current_user(credentials: HTTPBasicCredentials = Depends(security), db = Depends(get_db)):
    """
    FastAPI Dependency: HTTP Basic Authentication
    Validates either:
    1. Admin credentials (matches .env AUTH_USERNAME and AUTH_PASSWORD)
    2. Customer credentials (username is customer_id, password is customer national_id)
    """
    input_username = credentials.username.strip()
    input_password = credentials.password.strip()

    # 1. Admin check
    correct_username_bytes = settings.AUTH_USERNAME.encode("utf8")
    is_correct_admin_user = secrets.compare_digest(input_username.lower().encode("utf8"), correct_username_bytes.lower())
    is_correct_admin_pass = secrets.compare_digest(input_password.encode("utf8"), settings.AUTH_PASSWORD.encode("utf8"))

    if is_correct_admin_user and is_correct_admin_pass:
        return {
            "role": "admin",
            "username": input_username
        }

    # 2. Customer check (Customer ID as username, password or NIC as password)
    if input_username.isdigit():
        cursor, _ = db
        try:
            cursor.execute(
                "SELECT customer_id, full_name, national_id, password FROM CUSTOMER WHERE customer_id = %s",
                (int(input_username),)
            )
            cust = cursor.fetchone()
            if cust:
                stored_pwd = cust.get("password")
                valid_pass = False

                if stored_pwd is not None and stored_pwd != "":
                    # Custom password exists: strictly require custom password
                    valid_pass = secrets.compare_digest(input_password.encode("utf8"), stored_pwd.encode("utf8"))
                elif cust.get("national_id"):
                    # Default: compare with national_id (NIC)
                    valid_pass = secrets.compare_digest(input_password.upper().encode("utf8"), cust["national_id"].upper().encode("utf8"))

                if valid_pass:
                    return {
                        "role": "customer",
                        "customer_id": cust["customer_id"],
                        "name": cust["full_name"],
                        "username": input_username
                    }
        except Exception:
            pass

    # If neither matches
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Basic"},
    )

