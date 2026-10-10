from pydantic import BaseModel
from typing import Optional
from datetime import date

class CustomerBase(BaseModel):
    full_name: str
    national_id: str
    dob: date
    phone: str
    email: Optional[str] = None
    branch_id: int
    agent_id: int
    customer_type: str = 'Individual'

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    customer_id: int

    class Config:
        from_attributes = True
