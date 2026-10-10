from fastapi import APIRouter, Depends
from database import get_db
from crud import agents as crud_agents

router = APIRouter(
    prefix="/agents",
    tags=["agents"]
)

@router.get("")
def list_agents(db=Depends(get_db)):
    cursor, conn = db
    return crud_agents.get_agents(cursor)
