from fastapi import APIRouter, Depends
from database import get_db
from crud import branches as crud_branches

router = APIRouter(
    prefix="/branches",
    tags=["branches"]
)

@router.get("")
def list_branches(db=Depends(get_db)):
    cursor, conn = db
    return crud_branches.get_branches(cursor)
