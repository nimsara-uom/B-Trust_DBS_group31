from pydantic import BaseModel
from typing import Optional

class BranchBase(BaseModel):
    name: str
    address: str
    phone: Optional[str] = None

class BranchCreate(BranchBase):
    pass

class BranchUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None

class Branch(BranchBase):
    branch_id: int

    class Config:
        from_attributes = True
