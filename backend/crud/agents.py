def get_agents(cursor):
    cursor.execute("SELECT * FROM AGENT")
    return cursor.fetchall()
