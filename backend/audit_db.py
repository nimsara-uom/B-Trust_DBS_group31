import mysql.connector, os
from dotenv import load_dotenv
load_dotenv()

c = mysql.connector.connect(
    host=os.getenv('DB_HOST'),
    port=int(os.getenv('DB_PORT')),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    database=os.getenv('DB_NAME')
)
cur = c.cursor()

# Tables
cur.execute('SHOW TABLES')
tables = [t[0] for t in cur.fetchall()]
print('=== TABLES ===')
for t in tables:
    print(f'\n--- {t} ---')
    cur.execute(f'DESCRIBE {t}')
    for col in cur.fetchall():
        print(f'  {col}')
    cur.execute(f'SELECT COUNT(*) FROM {t}')
    print(f'  ROW COUNT: {cur.fetchone()[0]}')

# Triggers
print('\n=== TRIGGERS ===')
cur.execute('SHOW TRIGGERS')
for tr in cur.fetchall():
    print(f'  {tr[0]} | Event: {tr[1]} | Table: {tr[2]}')
    print(f'    Timing: {tr[4]}')

# Procedures & Functions
print('\n=== PROCEDURES & FUNCTIONS ===')
q = "SELECT ROUTINE_NAME, ROUTINE_TYPE FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = %s"
cur.execute(q, (os.getenv('DB_NAME'),))
for r in cur.fetchall():
    print(f'  {r[0]} ({r[1]})')

# Indexes
print('\n=== INDEXES ===')
for t in tables:
    cur.execute(f'SHOW INDEX FROM {t}')
    for idx in cur.fetchall():
        print(f'  {t}.{idx[2]} (col: {idx[4]}, unique: {not idx[1]})')

# Foreign Keys
print('\n=== FOREIGN KEYS ===')
q2 = """SELECT TABLE_NAME, CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE REFERENCED_TABLE_NAME IS NOT NULL AND TABLE_SCHEMA = %s"""
cur.execute(q2, (os.getenv('DB_NAME'),))
for fk in cur.fetchall():
    print(f'  {fk[0]}.{fk[2]} -> {fk[3]}.{fk[4]} ({fk[1]})')

# Sample data checks
print('\n=== SAMPLE DATA CHECKS ===')
cur.execute('SELECT COUNT(*) FROM BRANCH')
print(f'  Branches: {cur.fetchone()[0]} (required >= 3)')
cur.execute('SELECT COUNT(*) FROM AGENT')
print(f'  Agents: {cur.fetchone()[0]} (required >= 5)')
cur.execute('SELECT COUNT(*) FROM CUSTOMER')
print(f'  Customers: {cur.fetchone()[0]} (required >= 15)')
cur.execute('SELECT COUNT(*) FROM FIXEDDEPOSIT')
print(f'  Fixed Deposits: {cur.fetchone()[0]} (required >= 10)')
cur.execute('SELECT COUNT(*) FROM BANK_TRANSACTION')
print(f'  Transactions: {cur.fetchone()[0]} (required >= 100)')

# Check joint accounts
cur.execute("""SELECT sa.account_id, COUNT(ah.customer_id) as holders
FROM SAVINGSACCOUNT sa
JOIN ACCOUNTHOLDER ah ON sa.account_id = ah.account_id
GROUP BY sa.account_id HAVING holders > 1""")
joints = cur.fetchall()
print(f'  Joint Accounts (multi-holder): {len(joints)} (required >= 2)')
for j in joints:
    print(f'    Account {j[0]}: {j[1]} holders')

# Check transaction types
cur.execute("SELECT transaction_type, COUNT(*) FROM BANK_TRANSACTION GROUP BY transaction_type")
for tt in cur.fetchall():
    print(f'  Transaction type "{tt[0]}": {tt[1]}')

# Check savings plans
print('\n=== SAVINGS PLANS ===')
cur.execute('SELECT * FROM SAVINGSPLAN')
for sp in cur.fetchall():
    print(f'  {sp}')

# Check FD plans
print('\n=== FD PLANS ===')
cur.execute('SELECT * FROM FDPLAN')
for fp in cur.fetchall():
    print(f'  {fp}')

cur.close()
c.close()
