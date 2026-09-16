# Support CRM – Customer Support Ticketing System

A simple and responsive Customer Support CRM application for creating, managing, searching, and updating customer support tickets.

This project was developed as part of the Datastraw AI + Tech Intern Assessment.

## Features

### Ticket Management

- Create new support tickets
- Automatically generate unique ticket IDs
- View all support tickets
- View detailed ticket information
- Update ticket status
- Add internal notes to tickets
- Track ticket creation and update times

### Search and Filtering

- Search tickets by:
  - Ticket ID
  - Customer name
  - Customer email
  - Subject
  - Description
- Filter tickets by status:
  - Open
  - In Progress
  - Closed

### Dashboard

- Total ticket count
- Open ticket count
- In Progress ticket count
- Closed ticket count
- Responsive ticket table
- Loading and error states

## Technologies Used

### Backend

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- Uvicorn

### Frontend

- HTML5
- CSS3
- JavaScript
- Fetch API

### Development Tools

- Git
- GitHub
- Visual Studio Code
- PowerShell

## Project Structure

```text
support-crm/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   └── schemas.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── create-ticket.html
│   ├── create-ticket.js
│   ├── ticket-details.html
│   └── ticket-details.js
│
├── .env.example
├── .gitignore
├── README.md
└── support_crm.db