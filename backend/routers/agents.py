from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from models import agent as agent_model
from crud import agents as agent_crud
from database import get_db

router = APIRouter(prefix="/api/agents", tags=["Agents"])

@router.get("/", response_model=List[agent_model.Agent])
def get_all_agents(branch_id: Optional[int] = None, cursor = Depends(get_db)):
    # By adding branch_id as an argument, FastAPI automatically looks for it in the URL 
    # like this: /api/agents?branch_id=1
    agents = agent_crud.get_agents(cursor, branch_id)
    return agents

@router.get("/{agent_id}", response_model=agent_model.Agent)
def get_agent_by_id(agent_id: int, cursor = Depends(get_db)):
    agent = agent_crud.get_agent(cursor, agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent

@router.post("/", response_model=agent_model.Agent, status_code=201)
def create_agent(agent: agent_model.AgentCreate, cursor = Depends(get_db)):
    agent_id = agent_crud.create_agent(cursor, agent)
    new_agent = agent_crud.get_agent(cursor, agent_id)
    return new_agent

@router.put("/{agent_id}", response_model=dict)
def update_agent(agent_id: int, agent: agent_model.AgentUpdate, cursor = Depends(get_db)):
    updated_rows = agent_crud.update_agent(cursor, agent_id, agent)
    if updated_rows == 0:
        raise HTTPException(status_code=404, detail="Agent not found or no changes made")
    return {"message": "Agent updated successfully"}
