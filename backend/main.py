"""
Microbanking Management System — FastAPI Backend
=================================================
Entry point for the backend server.
Run with:  uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import transactions
from routers import fixed_deposit
from routers import report

# ---------------------------------------------------------------------------
# Create the FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="MIMS API",
    description="Microbanking & Interest Management System — DBS Group 31",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# CORS — allows the React frontend (Vite) to talk to this API
# ---------------------------------------------------------------------------
origins = [
    "http://localhost:5173",   # Vite default
    "http://localhost:3000",   # common React port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Register routers
# ---------------------------------------------------------------------------
app.include_router(transactions.router, prefix="/api")
app.include_router(fixed_deposit.router, prefix="/api")
app.include_router(report.router, prefix="/api")


# ---------------------------------------------------------------------------
# Root & Health endpoints
# ---------------------------------------------------------------------------
@app.get("/")
def root():
    """Root endpoint — quick confirmation the server is running."""
    return {"message": "MIMS API is running. Visit /docs for Swagger UI."}


@app.get("/health")
def health_check():
    """Health-check endpoint used for monitoring / quick tests."""
    return {"status": "ok"}