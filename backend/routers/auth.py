from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
import secrets
from config import settings
from database import get_db

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

class LoginRequest(BaseModel):
    username: str  # Admin username or Customer ID
    password: str  # Admin password or Customer NIC

@router.post("/login")
def login(creds: LoginRequest, db=Depends(get_db)):
    cursor, _ = db
    input_user = creds.username.strip()
    input_pass = creds.password.strip()
    expected_admin = settings.AUTH_USERNAME.strip().lower()
    expected_pass = settings.AUTH_PASSWORD.strip()
    
    # 1. Admin login check
    allowed_admin_usernames = {
        expected_admin,
        f"{expected_admin}@btrust.com",
        f"{expected_admin}@btrust.lk",
        f"{expected_admin}@gmail.com",
        "admin@btrust.com",
        "admin@btrust.lk"
    }
    
    if input_user.lower() in allowed_admin_usernames:
        valid_pass = secrets.compare_digest(input_pass.encode("utf8"), expected_pass.encode("utf8"))
        if valid_pass:
            return {
                "status": "success",
                "role": "admin",
                "username": input_user,
                "token": "authenticated_admin_session"
            }

    # 2. Customer login check (by cust-<id>, numeric Customer ID, or NIC)
    try:
        cust_id = None
        lower_input = input_user.lower()
        if lower_input.startswith("cust-"):
            raw_id = lower_input.replace("cust-", "").strip()
            if raw_id.isdigit():
                cust_id = int(raw_id)
        elif lower_input.startswith("cust"):
            raw_id = lower_input.replace("cust", "").strip()
            if raw_id.isdigit():
                cust_id = int(raw_id)
        elif input_user.isdigit():
            cust_id = int(input_user)

        if cust_id is not None:
            cursor.execute(
                "SELECT customer_id, full_name, national_id, password, email, phone FROM CUSTOMER WHERE customer_id = %s",
                (cust_id,)
            )
        else:
            cursor.execute(
                "SELECT customer_id, full_name, national_id, password, email, phone FROM CUSTOMER WHERE national_id = %s",
                (input_user,)
            )
        cust = cursor.fetchone()

        if cust:
            stored_pwd = cust.get("password")
            valid_customer_pass = False

            if stored_pwd is not None and stored_pwd != "":
                # Customer has changed/set a password: only this password is valid (NIC is NO LONGER valid)
                from security import verify_password
                valid_customer_pass = verify_password(input_pass, stored_pwd)
            else:
                # Password is null: use national_id (NIC) as initial default password
                if cust.get("national_id"):
                    valid_customer_pass = secrets.compare_digest(input_pass.upper().encode("utf8"), cust["national_id"].upper().encode("utf8"))

            if valid_customer_pass:
                formatted_username = f"cust-{cust['customer_id']}"
                return {
                    "status": "success",
                    "role": "customer",
                    "customer_id": cust["customer_id"],
                    "username": formatted_username,
                    "name": cust["full_name"],
                    "national_id": cust["national_id"],
                    "has_custom_password": bool(stored_pwd),
                    "token": f"authenticated_customer_{cust['customer_id']}"
                }
    except Exception as e:
        print(f"[AUTH ERROR] {e}")

    # Neither matched
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid Customer ID / username or password"
    )

