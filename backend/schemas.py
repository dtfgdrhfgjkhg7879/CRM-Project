from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class TicketCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_email: EmailStr
    subject: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=5)

    priority: str = "Medium"
    category: str = "Other"
    assigned_agent: str = "Unassigned"
    due_date: Optional[datetime] = None


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    assigned_agent: Optional[str] = None
    due_date: Optional[datetime] = None
    notes: Optional[str] = None


class TicketResponse(BaseModel):
    ticket_id: str
    customer_name: str
    customer_email: str
    subject: str
    description: str
    status: str
    priority: str
    category: str
    assigned_agent: str
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True