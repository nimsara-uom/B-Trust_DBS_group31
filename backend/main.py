from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user
from database import get_db
from routers import transactions, accounts, fixed_deposit, report, branches, agents, customers, dashboard

app = FastAPI(
    title="MIMS API",
    description="Microbanking & Interest Management System",
    version="1.0.0"
)

# Add CORS middleware to allow the frontend to connect without errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers — every endpoint is protected by HTTP Basic Auth
_auth = [Depends(get_current_user)]
app.include_router(transactions.router,   dependencies=_auth)
app.include_router(accounts.router,       dependencies=_auth)
app.include_router(fixed_deposit.router,  dependencies=_auth)
app.include_router(fixed_deposit.router,  prefix="/api", dependencies=_auth)
app.include_router(report.router,         dependencies=_auth)
app.include_router(report.router,         prefix="/api", dependencies=_auth)
app.include_router(branches.router,       dependencies=_auth)
app.include_router(agents.router,         dependencies=_auth)
app.include_router(customers.router,      dependencies=_auth)
app.include_router(dashboard.router,      dependencies=_auth)

@app.get("/health")
def health_check(db=Depends(get_db)):
    """
    Health check endpoint to verify that the API is running and the database is connected.
    """
    return {"status": "ok", "database": "connected"}