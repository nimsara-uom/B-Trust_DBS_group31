"""
models/customer.py
==================
Pydantic models for the CUSTOMER table.

CUSTOMER columns:
    customer_id   INT  AUTO_INCREMENT  PK
    branch_id     INT  NOT NULL  FK -> BRANCH(branch_id)
    agent_id      INT  NOT NULL  FK -> AGENT(agent_id)
    full_name     VARCHAR(150) NOT NULL
    dob           DATE NOT NULL
    national_id   VARCHAR(20)  NOT NULL UNIQUE
    phone         VARCHAR(15)  NOT NULL UNIQUE
    email         VARCHAR(100) nullable
    customer_type ENUM('Individual','Joint') DEFAULT 'Individual'
"""

import re
from datetime import date
from typing import Literal
from pydantic import BaseModel, Field, field_validator, EmailStr


# Helper: reusable phone validator (keeps both Create & Update DRY)
def _validate_phone(v: str) -> str:
    v = v.strip()
    if not re.fullmatch(r"[\d\+\-\s]{7,15}", v):
        raise ValueError(
            "Phone must be 7-15 chars with digits, +, -, or spaces only"
        )
    return v


# ---------------------------------------------------------------------------
# CustomerCreate — body the client sends when opening a new customer record
# ---------------------------------------------------------------------------
class CustomerCreate(BaseModel):
    branch_id: int = Field(gt=0)
    agent_id: int = Field(gt=0)
    full_name: str = Field(min_length=2, max_length=150)
    dob: date                              # FastAPI parses "YYYY-MM-DD" automatically
    national_id: str = Field(min_length=5, max_length=20)
    phone: str = Field(min_length=7, max_length=15)
    email: EmailStr | None = None          # optional — EmailStr validates format
    customer_type: Literal["Individual", "Joint"] = "Individual"

    # Validation 1: no blank full_name or national_id
    @field_validator("full_name", "national_id")
    @classmethod
    def no_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Field cannot be blank or only spaces")
        return v

    # Validation 2: phone format check
    @field_validator("phone")
    @classmethod
    def phone_format(cls, v: str) -> str:
        return _validate_phone(v)

    # Validation 3: customer must be at least 18 years old
    @field_validator("dob")
    @classmethod
    def must_be_adult(cls, v: date) -> date:
        today = date.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 18:
            raise ValueError("Customer must be at least 18 years old")
        return v


# ---------------------------------------------------------------------------
# CustomerUpdate — per spec: ONLY phone and email are updatable.
# branch_id, agent_id, full_name, dob, national_id, customer_type are LOCKED.
# ---------------------------------------------------------------------------
class CustomerUpdate(BaseModel):
    phone: str | None = Field(default=None, min_length=7, max_length=15)
    email: EmailStr | None = None

    @field_validator("phone")
    @classmethod
    def phone_format(cls, v: str | None) -> str | None:
        if v is not None:
            return _validate_phone(v)
        return v


# ---------------------------------------------------------------------------
# CustomerResponse — returned after GET / POST / PUT
# Includes every DB column so Swagger shows the full record.
# ---------------------------------------------------------------------------
class CustomerResponse(BaseModel):
    customer_id: int
    branch_id: int
    agent_id: int
    full_name: str
    dob: date
    national_id: str
    phone: str
    email: str | None
    customer_type: str

    model_config = {"from_attributes": True}
