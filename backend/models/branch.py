"""
models/branch.py
================
Pydantic models for the BRANCH table.

BRANCH columns:
    branch_id   INT  AUTO_INCREMENT  PK
    branch_name VARCHAR(100) NOT NULL UNIQUE
    address     VARCHAR(255) NOT NULL
    phone       VARCHAR(15)  NOT NULL UNIQUE
"""

import re
from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# BranchCreate — used when the client POSTs a new branch
# ---------------------------------------------------------------------------
class BranchCreate(BaseModel):
    branch_name: str = Field(min_length=2, max_length=100)
    address: str = Field(min_length=5, max_length=255)
    phone: str = Field(min_length=7, max_length=15)

    # Validation 1: strip whitespace, then make sure the field is not blank
    @field_validator("branch_name", "address")
    @classmethod
    def no_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be blank or only spaces")
        return v

    # Validation 2: phone must contain only digits, +, -, spaces
    # e.g. "+94-11-2345678" or "0112345678" both pass
    @field_validator("phone")
    @classmethod
    def phone_format(cls, v: str) -> str:
        v = v.strip()
        if not re.fullmatch(r"[\d\+\-\s]{7,15}", v):
            raise ValueError(
                "Phone must be 7-15 chars with digits, +, -, or spaces only"
            )
        return v


# ---------------------------------------------------------------------------
# BranchUpdate — used when the client PUTs/PATCHes an existing branch.
# All fields are Optional so you can send only the ones you want to change.
# ---------------------------------------------------------------------------
class BranchUpdate(BaseModel):
    branch_name: str | None = Field(default=None, min_length=2, max_length=100)
    address: str | None = Field(default=None, min_length=5, max_length=255)
    phone: str | None = Field(default=None, min_length=7, max_length=15)

    @field_validator("branch_name", "address")
    @classmethod
    def no_blank(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("Field cannot be blank or only spaces")
        return v

    @field_validator("phone")
    @classmethod
    def phone_format(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not re.fullmatch(r"[\d\+\-\s]{7,15}", v):
                raise ValueError(
                    "Phone must be 7-15 chars with digits, +, -, or spaces only"
                )
        return v


# ---------------------------------------------------------------------------
# BranchResponse — what the API sends back after a GET / POST / PUT.
# Every column from the DB row is included.
# ---------------------------------------------------------------------------
class BranchResponse(BaseModel):
    branch_id: int
    branch_name: str
    address: str
    phone: str

    # Pydantic v2: lets us do BranchResponse.model_validate(dict_from_db)
    model_config = {"from_attributes": True}
