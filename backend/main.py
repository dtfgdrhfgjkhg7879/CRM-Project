from datetime import datetime
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .models import Note, Ticket
from .schemas import TicketCreate, TicketUpdate


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Support CRM API",
    description="Customer Support Ticketing CRM API",
    version="2.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


ALLOWED_STATUSES = [
    "Open",
    "In Progress",
    "Closed",
]

ALLOWED_PRIORITIES = [
    "Low",
    "Medium",
    "High",
    "Urgent",
]

ALLOWED_CATEGORIES = [
    "Technical",
    "Billing",
    "Account",
    "Feature Request",
    "Complaint",
    "Other",
]


def validate_ticket_values(
    status=None,
    priority=None,
    category=None,
):
    if status is not None and status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Use one of: {ALLOWED_STATUSES}",
        )

    if priority is not None and priority not in ALLOWED_PRIORITIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid priority. Use one of: {ALLOWED_PRIORITIES}",
        )

    if category is not None and category not in ALLOWED_CATEGORIES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid category. Use one of: {ALLOWED_CATEGORIES}",
        )


def ticket_to_dict(ticket: Ticket):
    return {
        "ticket_id": ticket.ticket_id,
        "customer_name": ticket.customer_name,
        "customer_email": ticket.customer_email,
        "subject": ticket.subject,
        "description": ticket.description,
        "status": ticket.status,
        "priority": ticket.priority,
        "category": ticket.category,
        "assigned_agent": ticket.assigned_agent,
        "due_date": ticket.due_date,
        "created_at": ticket.created_at,
        "updated_at": ticket.updated_at,
    }


@app.get("/")
def root():
    return {
        "message": "Support CRM API is running",
        "version": "2.0.0",
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Support CRM API",
    }


@app.post("/api/tickets")
def create_ticket(
    ticket_data: TicketCreate,
    db: Session = Depends(get_db),
):
    validate_ticket_values(
        priority=ticket_data.priority,
        category=ticket_data.category,
    )

    customer_name = ticket_data.customer_name.strip()
    subject = ticket_data.subject.strip()
    description = ticket_data.description.strip()

    if not customer_name or not subject or not description:
        raise HTTPException(
            status_code=400,
            detail="Name, subject, and description cannot be empty.",
        )

    last_ticket = (
        db.query(Ticket)
        .order_by(Ticket.id.desc())
        .first()
    )

    next_number = 1

    if last_ticket:
        next_number = last_ticket.id + 1

    generated_ticket_id = f"TKT-{next_number:04d}"

    new_ticket = Ticket(
        ticket_id=generated_ticket_id,
        customer_name=customer_name,
        customer_email=str(ticket_data.customer_email),
        subject=subject,
        description=description,
        status="Open",
        priority=ticket_data.priority,
        category=ticket_data.category,
        assigned_agent=ticket_data.assigned_agent.strip()
        if ticket_data.assigned_agent
        else "Unassigned",
        due_date=ticket_data.due_date,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return {
        "message": "Ticket created successfully",
        "ticket": ticket_to_dict(new_ticket),
    }


@app.get("/api/tickets")
def get_tickets(
    status: Optional[str] = Query(default=None),
    priority: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    sort_by: str = Query(default="newest"),
    db: Session = Depends(get_db),
):
    validate_ticket_values(
        status=status,
        priority=priority,
        category=category,
    )

    query = db.query(Ticket)

    if status:
        query = query.filter(Ticket.status == status)

    if priority:
        query = query.filter(Ticket.priority == priority)

    if category:
        query = query.filter(Ticket.category == category)

    if search and search.strip():
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                Ticket.ticket_id.ilike(search_value),
                Ticket.customer_name.ilike(search_value),
                Ticket.customer_email.ilike(search_value),
                Ticket.subject.ilike(search_value),
                Ticket.description.ilike(search_value),
                Ticket.assigned_agent.ilike(search_value),
            )
        )

    if sort_by == "oldest":
        query = query.order_by(Ticket.created_at.asc())

    elif sort_by == "priority":
        priority_order = func.case(
            (Ticket.priority == "Urgent", 1),
            (Ticket.priority == "High", 2),
            (Ticket.priority == "Medium", 3),
            (Ticket.priority == "Low", 4),
            else_=5,
        )
        query = query.order_by(priority_order)

    elif sort_by == "subject":
        query = query.order_by(Ticket.subject.asc())

    else:
        query = query.order_by(Ticket.created_at.desc())

    tickets = query.all()

    return {
        "count": len(tickets),
        "tickets": [ticket_to_dict(ticket) for ticket in tickets],
    }


@app.get("/api/ticket-stats")
def get_ticket_stats(db: Session = Depends(get_db)):
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

    urgent_count = (
        db.query(Ticket)
        .filter(Ticket.priority == "Urgent")
        .count()
    )

    high_count = (
        db.query(Ticket)
        .filter(Ticket.priority == "High")
        .count()
    )

    return {
        "total": total,
        "open": open_count,
        "in_progress": progress_count,
        "closed": closed_count,
        "urgent": urgent_count,
        "high": high_count,
    }


@app.get("/api/tickets/{ticket_id}")
def get_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    return {
        "ticket": ticket_to_dict(ticket),
        "notes": [
            {
                "id": note.id,
                "note_text": note.note_text,
                "created_at": note.created_at,
            }
            for note in ticket.notes
        ],
    }


@app.put("/api/tickets/{ticket_id}")
def update_ticket(
    ticket_id: str,
    update_data: TicketUpdate,
    db: Session = Depends(get_db),
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    validate_ticket_values(
        status=update_data.status,
        priority=update_data.priority,
        category=update_data.category,
    )

    if update_data.status is not None:
        ticket.status = update_data.status

    if update_data.priority is not None:
        ticket.priority = update_data.priority

    if update_data.category is not None:
        ticket.category = update_data.category

    if update_data.assigned_agent is not None:
        ticket.assigned_agent = update_data.assigned_agent.strip()

    if update_data.due_date is not None:
        ticket.due_date = update_data.due_date

    if update_data.notes and update_data.notes.strip():
        new_note = Note(
            ticket_id=ticket.ticket_id,
            note_text=update_data.notes.strip(),
            created_at=datetime.utcnow(),
        )

        db.add(new_note)

    ticket.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(ticket)

    return {
        "message": "Ticket updated successfully",
        "ticket": ticket_to_dict(ticket),
    }


@app.delete("/api/tickets/{ticket_id}")
def delete_ticket(
    ticket_id: str,
    db: Session = Depends(get_db),
):
    ticket = (
        db.query(Ticket)
        .filter(Ticket.ticket_id == ticket_id)
        .first()
    )

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found",
        )

    db.delete(ticket)
    db.commit()

    return {
        "message": "Ticket deleted successfully",
        "ticket_id": ticket_id,
    }