from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import secrets
from config import settings

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

class LoginRequest(BaseModel):
    username: str  # Can be email (e.g. admin@btrust.com) or username (e.g. admin)
    password: str

@router.post("/login")
def login(creds: LoginRequest):
    input_user = creds.username.strip().lower()
    input_pass = creds.password.strip()
    expected_user = settings.AUTH_USERNAME.strip().lower()
    expected_pass = settings.AUTH_PASSWORD.strip()
    
    # Also support default admin email format (e.g., admin@btrust.com, admin@bank.com)
    allowed_usernames = {
        expected_user,
        f"{expected_user}@btrust.com",
        f"{expected_user}@btrust.lk",
        f"{expected_user}@gmail.com",
        "admin@btrust.com",
        "admin@btrust.lk"
    }
    
    valid_user = input_user in allowed_usernames
    valid_pass = secrets.compare_digest(input_pass.encode("utf8"), expected_pass.encode("utf8"))
    
    if not (valid_user and valid_pass):
        print(f"[AUTH] Failed login attempt for user/email: '{input_user}'. Expected: '{expected_user}' or associated emails.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password"
        )
    
    return {
        "status": "success",
        "username": input_user,
        "token": "authenticated_basic_session"
    }
