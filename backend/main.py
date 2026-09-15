from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from .database import engine, Base, get_db
from .models import Ticket
from .schemas import TicketCreate

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


# CREATE TICKET
@app.post("/api/tickets")
def create_ticket(
    ticket: TicketCreate,
    db: Session = Depends(get_db)
):
    # Find the last ticket
    last_ticket = (
        db.query(Ticket)
        .order_by(Ticket.id.desc())
        .first()
    )

    # Generate ticket ID
    if last_ticket:
        next_number = last_ticket.id + 1
    else:
        next_number = 1

    ticket_id = f"TKT-{next_number:03d}"

    # Create ticket object
    new_ticket = Ticket(
        ticket_id=ticket_id,
        customer_name=ticket.customer_name,
        customer_email=ticket.customer_email,
        subject=ticket.subject,
        description=ticket.description,
        status="Open"
    )

    # Save to database
    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return {
        "ticket_id": new_ticket.ticket_id,
        "created_at": new_ticket.created_at
    }

# LIST ALL TICKETS
@app.get("/api/tickets")
def get_tickets(
    status: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Ticket)

    # Filter by status
    if status:
        query = query.filter(Ticket.status == status)

    # Search across multiple fields
    if search:
        search_term = f"%{search}%"

        query = query.filter(
            (Ticket.ticket_id.ilike(search_term)) |
            (Ticket.customer_name.ilike(search_term)) |
            (Ticket.customer_email.ilike(search_term)) |
            (Ticket.description.ilike(search_term))
        )

    # Newest tickets first
    tickets = query.order_by(Ticket.created_at.desc()).all()

    return [
        {
            "ticket_id": ticket.ticket_id,
            "customer_name": ticket.customer_name,
            "subject": ticket.subject,
            "status": ticket.status,
            "created_at": ticket.created_at
        }
        for ticket in tickets
    ]