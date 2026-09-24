"""
Microbanking Management System — FastAPI Backend
=================================================
Entry point for the backend server.
Run with:  uvicorn main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------------------------
# Create the FastAPI application
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Microbanking Management System",
    description="Backend API for the DBS Group 31 banking project",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# CORS configuration — allows the React frontend to talk to this API
# ---------------------------------------------------------------------------
# During development the Vite dev-server usually runs on http://localhost:5173.
# We list the origins we want to allow here.
origins = [
    "http://localhost:5173",   # Vite default
    "http://localhost:3000",   # common React port
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # which frontends can call us
    allow_credentials=True,      # allow cookies / auth headers
    allow_methods=["*"],         # allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],         # allow all headers
)

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    """Root endpoint — quick confirmation the server is running."""
    return {"message": "Microbanking Management System API"}


@app.get("/health")
def health_check():
    """Health-check endpoint used for monitoring / quick tests."""
    return {"status": "ok"}
