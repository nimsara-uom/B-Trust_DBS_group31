from models import agent

def get_agent(cursor, agent_id: int):
    query = "SELECT * FROM AGENT WHERE agent_id = %s"
    cursor.execute(query, (agent_id,))
    return cursor.fetchone()

def get_agents(cursor, branch_id: int | None = None):
    # The project spec says we should be able to filter agents by branch_id!
    if branch_id is not None:
        query = "SELECT * FROM AGENT WHERE branch_id = %s"
        cursor.execute(query, (branch_id,))
    else:
        query = "SELECT * FROM AGENT"
        cursor.execute(query)
        
    return cursor.fetchall()

def create_agent(cursor, agent_data: agent.AgentCreate):
    query = "INSERT INTO AGENT (branch_id, name, phone, email) VALUES (%s, %s, %s, %s)"
    values = (agent_data.branch_id, agent_data.name, agent_data.phone, agent_data.email)
    cursor.execute(query, values)
    return cursor.lastrowid

def update_agent(cursor, agent_id: int, agent_data: agent.AgentUpdate):
    updates = []
    values = []
    
    if agent_data.name is not None:
        updates.append("name = %s")
        values.append(agent_data.name)
    if agent_data.phone is not None:
        updates.append("phone = %s")
        values.append(agent_data.phone)
    if agent_data.email is not None:
        updates.append("email = %s")
        values.append(agent_data.email)
    if agent_data.branch_id is not None:
        updates.append("branch_id = %s")
        values.append(agent_data.branch_id)
        
    if len(updates) == 0:
        return 0
        
    query = f"UPDATE AGENT SET {', '.join(updates)} WHERE agent_id = %s"
    values.append(agent_id)
    
    cursor.execute(query, tuple(values))
    return cursor.rowcount
