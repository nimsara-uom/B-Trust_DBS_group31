from pydantic import BaseModel
from typing import Optional

class AgentBase(BaseModel):
    branch_id: int
    name: str
    phone: Optional[str] = None
    email: Optional[str] = None

class AgentCreate(AgentBase):
    pass

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    branch_id: Optional[int] = None

class Agent(AgentBase):
    agent_id: int

    class Config:
        from_attributes = True
