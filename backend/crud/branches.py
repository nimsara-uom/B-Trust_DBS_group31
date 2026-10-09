from models import branch

def get_branch(cursor, branch_id: int):
    query = "SELECT * FROM BRANCH WHERE branch_id = %s"
    # %s is a placeholder to prevent SQL injection (like a variable slot)
    cursor.execute(query, (branch_id,)) 
    return cursor.fetchone()

def get_branches(cursor):
    query = "SELECT * FROM BRANCH"
    cursor.execute(query)
    return cursor.fetchall()

def create_branch(cursor, branch_data: branch.BranchCreate):
    query = "INSERT INTO BRANCH (name, address, phone) VALUES (%s, %s, %s)"
    values = (branch_data.name, branch_data.address, branch_data.phone)
    cursor.execute(query, values)
    # Return the ID of the newly created branch
    return cursor.lastrowid

def update_branch(cursor, branch_id: int, branch_data: branch.BranchUpdate):
    # A simple way to build the UPDATE query based on what the user wants to change
    updates = []
    values = []
    
    if branch_data.name is not None:
        updates.append("name = %s")
        values.append(branch_data.name)
    if branch_data.address is not None:
        updates.append("address = %s")
        values.append(branch_data.address)
    if branch_data.phone is not None:
        updates.append("phone = %s")
        values.append(branch_data.phone)
        
    if len(updates) == 0:
        return 0 # Nothing to update
        
    query = f"UPDATE BRANCH SET {', '.join(updates)} WHERE branch_id = %s"
    values.append(branch_id) # Add the ID at the very end for the WHERE clause
    
    cursor.execute(query, tuple(values))
    return cursor.rowcount # Tells us how many rows were affected
