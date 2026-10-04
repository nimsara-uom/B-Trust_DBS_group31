from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from auth import get_current_user
from database import get_db

app = FastAPI(
    title="MIMS API",
    description="Microbanking & Interest Management System",
    version="1.0.0"
)

# Add CORS middleware to allow the frontend to connect without errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

@app.get("/health")
def health_check(db=Depends(get_db)):
    """
    Health check endpoint to verify that the API is running and the database is connected.
    """
    # If the database connection is successful, the get_db dependency will provide a cursor
    # and this endpoint will return a success message.
    return {"status": "ok", "database": "connected"}