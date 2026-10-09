from typing import Optional
from models import customer


def get_customer(cursor, customer_id: int):
    # Fetch a single customer by their ID
    query = "SELECT * FROM CUSTOMER WHERE customer_id = %s"
    cursor.execute(query, (customer_id,))
    return cursor.fetchone()

def get_customers(cursor, branch_id: Optional[int] = None, agent_id: Optional[int] = None):
    # We want to be able to filter customers by branch or agent, as the project spec requires!
    query = "SELECT * FROM CUSTOMER"
    conditions = []
    values = []
    
    # Check if a branch_id was provided to filter by
    if branch_id is not None:
        conditions.append("branch_id = %s")
        values.append(branch_id)
        
    # Check if an agent_id was provided to filter by
    if agent_id is not None:
        conditions.append("agent_id = %s")
        values.append(agent_id)
        
    # If we have any conditions, stitch them together with " AND "
    if len(conditions) > 0:
        query += " WHERE " + " AND ".join(conditions)
        
    cursor.execute(query, tuple(values))
    return cursor.fetchall()

def create_customer(cursor, customer_data: customer.CustomerCreate):
    # Insert all the required customer fields into the database
    query = """
    INSERT INTO CUSTOMER (branch_id, agent_id, name, nic, phone, email, address) 
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    values = (
        customer_data.branch_id, 
        customer_data.agent_id, 
        customer_data.name, 
        customer_data.nic, 
        customer_data.phone, 
        customer_data.email, 
        customer_data.address
    )
    cursor.execute(query, values)
    return cursor.lastrowid # Return the auto-generated customer_id

def update_customer(cursor, customer_id: int, customer_data: customer.CustomerUpdate):
    # The spec specifically states we only need to update phone and email
    updates = []
    values = []
    
    if customer_data.phone is not None:
        updates.append("phone = %s")
        values.append(customer_data.phone)
        
    if customer_data.email is not None:
        updates.append("email = %s")
        values.append(customer_data.email)
        
    if len(updates) == 0:
        return 0 # Nothing was provided to update
        
    query = f"UPDATE CUSTOMER SET {', '.join(updates)} WHERE customer_id = %s"
    values.append(customer_id)
    
    cursor.execute(query, tuple(values))
    return cursor.rowcount
