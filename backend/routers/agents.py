from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from database import get_db
from crud import agents as crud_agents

router = APIRouter(
    prefix="/agents",
    tags=["agents"]
)

class AgentCreate(BaseModel):
    agent_name: str
    branch_id: int
    phone: str

@router.get("")
def list_agents(db=Depends(get_db)):
    cursor, conn = db
    return crud_agents.get_agents(cursor)

@router.post("", status_code=status.HTTP_201_CREATED)
def register_agent(agent_data: AgentCreate, db=Depends(get_db)):
    cursor, conn = db
    try:
        new_id = crud_agents.create_agent(
            cursor, 
            conn, 
            agent_name=agent_data.agent_name.strip(),
            branch_id=agent_data.branch_id,
            phone=agent_data.phone.strip()
        )
        return {"status": "success", "agent_id": new_id, "message": "Agent registered successfully"}
    except Exception as e:
        error_msg = str(e)
        if "Duplicate entry" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An agent with this phone number is already registered."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to register agent: {error_msg}"
        )
