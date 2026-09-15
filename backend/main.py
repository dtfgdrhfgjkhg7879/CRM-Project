from fastapi import FastAPI

from .database import engine, Base
from .models import Ticket

app = FastAPI(
    title="Support CRM API",
    description="Customer Support Ticketing CRM",
    version="1.0.0"
)

# Create database tables
Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "Support CRM API is running!"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }