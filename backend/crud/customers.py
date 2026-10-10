def get_customers(cursor, search: str = None):
    query = "SELECT * FROM CUSTOMER"
    params = []
    if search:
        query += " WHERE full_name LIKE %s OR email LIKE %s OR national_id LIKE %s"
        search_pattern = f"%{search}%"
        params.extend([search_pattern, search_pattern, search_pattern])
    
    cursor.execute(query, tuple(params))
    return cursor.fetchall()
