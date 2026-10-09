from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from models import customer as customer_model
from crud import customers as customer_crud
from database import get_db

router = APIRouter(prefix="/api/customers", tags=["Customers"])

@router.get("/", response_model=List[customer_model.Customer])
def get_all_customers(branch_id: Optional[int] = None, agent_id: Optional[int] = None, cursor = Depends(get_db)):
    # FastAPI automatically handles grabbing branch_id and agent_id from the query string!
    customers = customer_crud.get_customers(cursor, branch_id, agent_id)
    return customers

@router.get("/{customer_id}", response_model=customer_model.Customer)
def get_customer_by_id(customer_id: int, cursor = Depends(get_db)):
    customer = customer_crud.get_customer(cursor, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/", response_model=customer_model.Customer, status_code=201)
def create_customer(customer: customer_model.CustomerCreate, cursor = Depends(get_db)):
    customer_id = customer_crud.create_customer(cursor, customer)
    new_customer = customer_crud.get_customer(cursor, customer_id)
    return new_customer

@router.put("/{customer_id}", response_model=dict)
def update_customer(customer_id: int, customer: customer_model.CustomerUpdate, cursor = Depends(get_db)):
    updated_rows = customer_crud.update_customer(cursor, customer_id, customer)
    if updated_rows == 0:
        raise HTTPException(status_code=404, detail="Customer not found or no changes made")
    return {"message": "Customer updated successfully"}
