from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)

    ticket_id = Column(String(20), unique=True, index=True, nullable=False)

    customer_name = Column(String(100), nullable=False)
    customer_email = Column(String(150), nullable=False)

    subject = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)

    status = Column(String(30), default="Open", nullable=False)
    priority = Column(String(30), default="Medium", nullable=False)
    category = Column(String(50), default="Other", nullable=False)

    assigned_agent = Column(String(100), default="Unassigned", nullable=False)

    due_date = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    notes = relationship(
        "Note",
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="Note.created_at.desc()",
    )


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)

    ticket_id = Column(
        String(20),
        ForeignKey("tickets.ticket_id"),
        nullable=False,
    )

    note_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    ticket = relationship("Ticket", back_populates="notes")