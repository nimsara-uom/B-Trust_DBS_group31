from fastapi import APIRouter, Depends
from typing import Optional
from database import get_db
from crud import customers as crud_customers

router = APIRouter(
    prefix="/customers",
    tags=["customers"]
)

@router.get("")
def list_customers(search: Optional[str] = None, db=Depends(get_db)):
    cursor, conn = db
    return crud_customers.get_customers(cursor, search)
