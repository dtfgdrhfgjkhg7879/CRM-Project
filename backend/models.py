from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from .database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)

    ticket_id = Column(String, unique=True, index=True, nullable=False)

    customer_name = Column(String, nullable=False)

    customer_email = Column(String, nullable=False)

    subject = Column(String, nullable=False)

    description = Column(Text, nullable=False)

    status = Column(String, default="Open", nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )