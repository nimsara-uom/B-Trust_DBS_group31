"""
models/agent.py
===============
Pydantic models for the AGENT table.

AGENT columns:
    agent_id   INT  AUTO_INCREMENT  PK
    branch_id  INT  NOT NULL  FK -> BRANCH(branch_id)
    agent_name VARCHAR(100) NOT NULL
    phone      VARCHAR(15)  NOT NULL UNIQUE
"""

import re
from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# AgentCreate — body the client sends when registering a new agent
# ---------------------------------------------------------------------------
class AgentCreate(BaseModel):
    branch_id: int = Field(gt=0)            # must be a positive integer
    agent_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=7, max_length=15)

    # Validation 1: strip and check agent_name is not all spaces
    @field_validator("agent_name")
    @classmethod
    def no_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("agent_name cannot be blank or only spaces")
        return v

    # Validation 2: digits, +, -, spaces only — same rule as BRANCH
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
# AgentUpdate — only name and phone make sense to change.
# branch_id is not updatable (moving an agent changes business logic).
# All fields are Optional.
# ---------------------------------------------------------------------------
class AgentUpdate(BaseModel):
    agent_name: str | None = Field(default=None, min_length=2, max_length=100)
    phone: str | None = Field(default=None, min_length=7, max_length=15)

    @field_validator("agent_name")
    @classmethod
    def no_blank(cls, v: str | None) -> str | None:
        if v is not None:
            v = v.strip()
            if not v:
                raise ValueError("agent_name cannot be blank or only spaces")
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
# AgentResponse — returned after GET / POST / PUT
# ---------------------------------------------------------------------------
class AgentResponse(BaseModel):
    agent_id: int
    branch_id: int
    agent_name: str
    phone: str

    model_config = {"from_attributes": True}
