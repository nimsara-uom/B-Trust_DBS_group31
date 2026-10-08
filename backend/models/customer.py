from pydantic import BaseModel
from typing import Optional

class CustomerBase(BaseModel):
    branch_id: int
    agent_id: Optional[int] = None
    name: str
    nic: str
    phone: str
    email: Optional[str] = None
    address: str

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    # Based on the spec, update customer is for (phone, email)
    phone: Optional[str] = None
    email: Optional[str] = None

class Customer(CustomerBase):
    customer_id: int

    class Config:
        from_attributes = True
