def get_branches(cursor):
    cursor.execute("SELECT * FROM BRANCH")
    return cursor.fetchall()
