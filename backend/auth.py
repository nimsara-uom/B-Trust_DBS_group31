"""
auth.py — Authentication & Authorisation
==========================================
Will hold login, JWT token generation, and role-based access helpers.
To be implemented when the auth module is added.
"""

# TODO: Replace this stub with real JWT authentication when ready.
# Example (to be filled in later):
# from fastapi import Depends, HTTPException
# from fastapi.security import OAuth2PasswordBearer
# import jwt
#
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
#
# def get_current_user(token: str = Depends(oauth2_scheme)):
#     ...


def require_auth():
    """
    Stub authentication dependency.
    Replace with real JWT/session verification when the auth module is implemented.
    Currently allows all requests through without any checks.
    """
    pass
