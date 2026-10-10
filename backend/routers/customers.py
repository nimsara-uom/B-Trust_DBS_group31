from fastapi import APIRouter, Depends, HTTPException
from typing import Optional
from database import get_db
from crud import customers as crud_customers
from models.customer import CustomerCreate

router = APIRouter(
    prefix="/customers",
    tags=["customers"]
)

@router.get("")
def list_customers(search: Optional[str] = None, db=Depends(get_db)):
    cursor, conn = db
    return crud_customers.get_customers(cursor, search)

@router.post("")
def create_customer(customer: CustomerCreate, db=Depends(get_db)):
    cursor, conn = db
    try:
        new_id = crud_customers.create_customer(cursor, customer)
        conn.commit()
        return {"message": "Customer created successfully", "customer_id": new_id}
    except Exception as e:
        conn.rollback()
        # Handle duplicates gracefully (like duplicate NIC or phone)
        raise HTTPException(status_code=400, detail=str(e))

