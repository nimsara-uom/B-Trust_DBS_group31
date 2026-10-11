def get_agents(cursor):
    query = """
    SELECT 
        a.agent_id,
        a.branch_id,
        a.agent_name,
        a.phone,
        b.branch_name,
        COUNT(DISTINCT c.customer_id) AS total_customers,
        COUNT(DISTINCT t.transaction_id) AS total_transactions
    FROM AGENT a
    LEFT JOIN BRANCH b ON a.branch_id = b.branch_id
    LEFT JOIN CUSTOMER c ON a.agent_id = c.agent_id
    LEFT JOIN BANK_TRANSACTION t ON a.agent_id = t.agent_id
    GROUP BY a.agent_id, a.branch_id, a.agent_name, a.phone, b.branch_name
    ORDER BY a.agent_id ASC
    """
    cursor.execute(query)
    return cursor.fetchall()

def create_agent(cursor, conn, agent_name: str, branch_id: int, phone: str):
    query = """
    INSERT INTO AGENT (agent_name, branch_id, phone)
    VALUES (%s, %s, %s)
    """
    cursor.execute(query, (agent_name, branch_id, phone))
    conn.commit()
    return cursor.lastrowid

