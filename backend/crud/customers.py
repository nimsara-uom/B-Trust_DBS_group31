def get_customers(cursor, search: str = None):
    query = "SELECT * FROM CUSTOMER"
    params = []
    if search:
        query += " WHERE full_name LIKE %s OR email LIKE %s OR national_id LIKE %s"
        search_pattern = f"%{search}%"
        params.extend([search_pattern, search_pattern, search_pattern])
    
    cursor.execute(query, tuple(params))
    return cursor.fetchall()

def create_customer(cursor, customer_data):
    query = """
        INSERT INTO CUSTOMER (branch_id, agent_id, full_name, dob, national_id, phone, email, customer_type)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    params = (
        customer_data.branch_id,
        customer_data.agent_id,
        customer_data.full_name,
        customer_data.dob,
        customer_data.national_id,
        customer_data.phone,
        customer_data.email,
        customer_data.customer_type
    )
    cursor.execute(query, params)
    return cursor.lastrowid
