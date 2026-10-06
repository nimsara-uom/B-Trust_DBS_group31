import secrets
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from config import settings

security = HTTPBasic()

def get_current_user(credentials: HTTPBasicCredentials = Depends(security)):
    """
    FastAPI Dependency: HTTP Basic Authentication
    Checks if the provided username and password match the credentials in the .env file.
    """
    # Check if the provided username is correct
    current_username_bytes = credentials.username.encode("utf8")
    correct_username_bytes = settings.AUTH_USERNAME.encode("utf8")
    is_correct_username = secrets.compare_digest(
        current_username_bytes, correct_username_bytes
    )
    
    # Check if the provided password is correct
    current_password_bytes = credentials.password.encode("utf8")
    correct_password_bytes = settings.AUTH_PASSWORD.encode("utf8")
    is_correct_password = secrets.compare_digest(
        current_password_bytes, correct_password_bytes
    )
    
    # If either username or password is incorrect, raise a 401 Unauthorized error
    if not (is_correct_username and is_correct_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Basic"},
        )
    
    # Return the username if authentication is successful
    return credentials.username
