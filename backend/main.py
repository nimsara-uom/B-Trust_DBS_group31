import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user
from database import get_db, get_pool
from crud import fixed_deposit as crud_fd
from routers import transactions, accounts, fixed_deposit, report, branches, agents, customers, dashboard, auth

async def auto_interest_background_worker():
    """
    Background worker that runs continuously to automatically calculate interest
    for each Fixed Deposit account as soon as its monthly anniversary date is reached.
    """
    while True:
        try:
            pool = get_pool()
            if pool:
                conn = pool.get_connection()
                cursor = conn.cursor(dictionary=True)
                crud_fd.process_auto_due_interest(cursor, conn)
                cursor.close()
                conn.close()
        except Exception as e:
            print(f"[Auto-Interest Worker] {e}")
        # Run every 60 seconds
        await asyncio.sleep(60)

@asynccontextmanager
async def lifespan(app: FastAPI):
    worker_task = asyncio.create_task(auto_interest_background_worker())
    yield
    worker_task.cancel()
    try:
        await worker_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title="MIMS API",
    description="Microbanking & Interest Management System",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware to allow the frontend to connect without errors
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Public Auth router
app.include_router(auth.router, prefix="/api")

# Register routers — protected by HTTP Basic Auth
_auth = [Depends(get_current_user)]
app.include_router(transactions.router,   dependencies=_auth)
app.include_router(accounts.router,       dependencies=_auth)
app.include_router(dashboard.router,      dependencies=_auth)

app.include_router(fixed_deposit.router,  prefix="/api", dependencies=_auth)
app.include_router(report.router,         prefix="/api", dependencies=_auth)
app.include_router(branches.router,       prefix="/api", dependencies=_auth)
app.include_router(agents.router,         prefix="/api", dependencies=_auth)
app.include_router(customers.router,      prefix="/api", dependencies=_auth)

@app.get("/health")
def health_check(db=Depends(get_db)):
    """
    Health check endpoint to verify that the API is running and the database is connected.
    """
    return {"status": "ok", "database": "connected"}