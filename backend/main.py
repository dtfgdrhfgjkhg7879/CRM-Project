from datetime import datetime
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, Base, get_db
from .models import Ticket, Note
from .schemas import TicketCreate, TicketUpdate


app = FastAPI(
    title="Support CRM API",
    description="Customer Support Ticketing CRM API",
    version="1.0.0"
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables
Base.metadata.create_all(bind=engine)


ALLOWED_STATUSES = ["Open", "In Progress", "Closed"]


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "Support CRM API is running!"
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }


# --------------------------------------------------
# CREATE TICKET
# --------------------------------------------------

@app.post("/api/tickets")
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db)
):
    last_ticket = (
        db.query(Ticket)
        .order_by(Ticket.id.desc())
        .first()
    )

    next_number = last_ticket.id + 1 if last_ticket else 1
    ticket_id = f"TKT-{next_number:03d}"

    new_ticket = Ticket(
        ticket_id=ticket_id,
        customer_name=ticket_data.customer_name.strip(),
        customer_email=str(ticket_data.customer_email),
        subject=ticket_data.subject.strip(),
        description=ticket_data.description.strip(),
        status="Open"
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return {
        "success": True,
        "message": "Ticket created successfully",
        "ticket_id": new_ticket.ticket_id,
        "created_at": new_ticket.created_at
    }


# --------------------------------------------------
# LIST, SEARCH, AND FILTER TICKETS
# --------------------------------------------------

@app.get("/api/tickets")
def get_tickets(
    status: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Ticket)

    if status:
        if status not in ALLOWED_STATUSES:
            raise HTTPException(
                status_code=400,
                detail="Invalid status filter"
            )

        query = query.filter(Ticket.status == status)

    if search:
        search_term = f"%{search.strip()}%"

        query = query.filter(
            (Ticket.ticket_id.ilike(search_term)) |
            (Ticket.customer_name.ilike(search_term)) |
            (Ticket.customer_email.ilike(search_term)) |
            (Ticket.subject.ilike(search_term)) |
            (Ticket.description.ilike(search_term))
        )

    tickets = (
        query
        .order_by(Ticket.created_at.desc())
        .all()
    )

    return [
        {
            "ticket_id": ticket.ticket_id,
            "customer_name": ticket.customer_name,
            "customer_email": ticket.customer_email,
            "subject": ticket.subject,
            "status": ticket.status,
            "created_at": ticket.created_at,
            "updated_at": ticket.updated_at
        }
        for ticket in tickets
    ]


# --------------------------------------------------
# TICKET STATISTICS
# --------------------------------------------------

@app.get("/api/ticket-stats")
def get_ticket_stats(
    db: Session = Depends(get_db)
):
    total = db.query(Ticket).count()

    open_count = (
        db.query(Ticket)
        .filter(Ticket.status == "Open")
        .count()
    )

    progress_count = (
        db.query(Ticket)
        .filter(Ticket.status == "In Progress")
        .count()
    )

    closed_count = (
        db.query(Ticket)
        .filter(Ticket.status == "Closed")
        .count()
    )

    return {
        "total": total,
        "open": open_count,
        "in_progress": progress_count,
        "closed": closed_count
    }


# --------------------------------------------------
# GET TICKET DETAILS
# --------------------------------------------------

@app.get("/api/tickets/{ticket_id}")
def get_ticket_details(
    ticket_id: str,
    db: Session = Depends(get_db)
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    notes = (
        db.query(Note)
        .filter(Note.ticket_id == ticket.ticket_id)
        .order_by(Note.created_at.desc())
        .all()
    )

    return {
        "ticket_id": ticket.ticket_id,
        "customer_name": ticket.customer_name,
        "customer_email": ticket.customer_email,
        "subject": ticket.subject,
        "description": ticket.description,
        "status": ticket.status,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
        "notes": [
            {
                "id": note.id,
                "note_text": note.note_text,
                "created_at": note.created_at
            }
            for note in notes
        ]
    }


# --------------------------------------------------
# UPDATE TICKET AND ADD NOTE
# --------------------------------------------------

@app.put("/api/tickets/{ticket_id}")
def update_ticket(
    ticket_id: str,
    ticket_data: TicketUpdate,
    db: Session = Depends(get_db)
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    if ticket_data.status is not None:
        if ticket_data.status not in ALLOWED_STATUSES:
            raise HTTPException(
                status_code=400,
                detail="Invalid status"
            )

        ticket.status = ticket_data.status

    if ticket_data.notes and ticket_data.notes.strip():
        new_note = Note(
            ticket_id=ticket.ticket_id,
            note_text=ticket_data.notes.strip()
        )

        db.add(new_note)

    ticket.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)

    return {
        "success": True,
        "message": "Ticket updated successfully",
        "ticket_id": ticket.ticket_id,
        "status": ticket.status,
        "updated_at": ticket.updated_at
    }