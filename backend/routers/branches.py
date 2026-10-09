from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models import branch as branch_model
from crud import branches as branch_crud
from database import get_db

# We use an APIRouter to group all our branch endpoints together under /api/branches
router = APIRouter(prefix="/api/branches", tags=["Branches"])

@router.get("/", response_model=List[branch_model.Branch])
def get_all_branches(cursor = Depends(get_db)):
    # Simply calls the CRUD function we wrote earlier!
    branches = branch_crud.get_branches(cursor)
    return branches

@router.get("/{branch_id}", response_model=branch_model.Branch)
def get_branch_by_id(branch_id: int, cursor = Depends(get_db)):
    branch = branch_crud.get_branch(cursor, branch_id)
    # If the database returns nothing, we send a 404 Error to the user
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch

@router.post("/", response_model=branch_model.Branch, status_code=201)
def create_branch(branch: branch_model.BranchCreate, cursor = Depends(get_db)):
    # Create the branch and get the new ID back
    branch_id = branch_crud.create_branch(cursor, branch)
    # Fetch the complete branch data to show the user what was created
    new_branch = branch_crud.get_branch(cursor, branch_id)
    return new_branch

@router.put("/{branch_id}", response_model=dict)
def update_branch(branch_id: int, branch: branch_model.BranchUpdate, cursor = Depends(get_db)):
    updated_rows = branch_crud.update_branch(cursor, branch_id, branch)
    if updated_rows == 0:
        raise HTTPException(status_code=404, detail="Branch not found or no changes made")
    return {"message": "Branch updated successfully"}
