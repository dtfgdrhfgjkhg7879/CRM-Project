# SupportCRM --- Customer Support Ticketing System

A full-stack customer support ticketing CRM developed for the
**Datastraw AI + Tech Intern Assessment**.

The application provides a clean dashboard for support teams to create,
manage, search, filter, and update customer support tickets. It also
includes customer information, reporting, ticket statistics, and REST
API documentation.

## Live Demo

**Deployed Application:**\
https://crm-project-production-9d18.up.railway.app/index.html

**API Documentation (Swagger):**\
https://crm-project-production-9d18.up.railway.app/docs

## Features

### Dashboard

-   View overall ticket statistics
-   Total, open, in-progress, and closed ticket counts
-   Ticket status and priority visualizations
-   Recent ticket list
-   Search and filtering

### Ticket Management

-   Create new support tickets
-   View complete ticket details
-   Update ticket status
-   Change priority, category, and assigned agent
-   Set due dates
-   Add internal notes
-   Delete tickets

### Search & Filtering

-   Search tickets by relevant ticket/customer information
-   Filter tickets by status
-   Sort ticket records
-   Search-as-you-type dashboard experience

### Customer Management

-   View customer information
-   View ticket/customer relationships
-   Track customer ticket activity

### Reports

-   Ticket statistics and summaries
-   Status-based reporting
-   Priority/category analysis
-   Visual dashboard charts

### REST API

The backend provides RESTful endpoints for ticket operations and
dashboard statistics.

## Tech Stack

### Frontend

-   HTML5
-   CSS3
-   JavaScript
-   Chart.js

### Backend

-   Python
-   FastAPI
-   SQLAlchemy
-   Pydantic
-   Uvicorn

### Database

-   SQLite

### Deployment

-   Railway

## Project Structure

``` text
CRM-Project/
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
│   ├── ticket-details.js
│   ├── customers.html
│   ├── customers.js
│   ├── reports.html
│   └── reports.js
│
├── requirements.txt
├── .env.example
├── .gitignore
└── README.md
```

## Database Design

The application uses SQLite with SQLAlchemy.

### Tickets

The ticket model contains information such as:

-   Ticket ID
-   Customer name
-   Customer email
-   Subject
-   Description
-   Status
-   Priority
-   Category
-   Assigned agent
-   Due date
-   Created timestamp
-   Updated timestamp

### Notes

Notes are associated with tickets and can be used to record internal
support information.

## API Endpoints

  ----------------------------------------------------------------------------
  Method                  Endpoint                     Description
  ----------------------- ---------------------------- -----------------------
  `POST`                  `/api/tickets`               Create a new ticket

  `GET`                   `/api/tickets`               List tickets with
                                                       search/filter/sort
                                                       options

  `GET`                   `/api/tickets/{ticket_id}`   Get a specific ticket

  `PUT`                   `/api/tickets/{ticket_id}`   Update a ticket

  `DELETE`                `/api/tickets/{ticket_id}`   Delete a ticket

  `GET`                   `/api/ticket-stats`          Get dashboard ticket
                                                       statistics

  `GET`                   `/health`                    Health check

  `GET`                   `/docs`                      Swagger API
                                                       documentation
  ----------------------------------------------------------------------------

## Running Locally

### 1. Clone the repository

``` bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd CRM-Project
```

### 2. Create a virtual environment

Windows PowerShell:

``` powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If PowerShell execution policy prevents activation, the virtual
environment can also be activated from Command Prompt:

``` cmd
venv\Scripts\activate
```

### 3. Install dependencies

``` bash
pip install -r requirements.txt
```

### 4. Start the FastAPI application

From the project root:

``` bash
uvicorn backend.main:app --reload
```

The application will be available at:

``` text
http://127.0.0.1:8000
```

Swagger API documentation:

``` text
http://127.0.0.1:8000/docs
```

## Environment Configuration

Create a `.env` file when environment-specific configuration is
required.

Example:

``` env
DATABASE_URL=sqlite:///./support_crm.db
```

A `.env.example` file is included in the repository. Actual environment
files and database files should not be committed.

## Deployment

The application is deployed on Railway.

The production server runs FastAPI using:

``` bash
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

The frontend is served by the FastAPI application, allowing the deployed
application to operate from a single public URL.

### Production URLs

Application:

https://crm-project-production-9d18.up.railway.app/index.html

API documentation:

https://crm-project-production-9d18.up.railway.app/docs

## API Architecture

``` text
Browser
   │
   ▼
HTML / CSS / JavaScript
   │
   │ HTTP REST API
   ▼
FastAPI Backend
   │
   ▼
SQLAlchemy
   │
   ▼
SQLite Database
```

## Validation

The backend validates ticket fields including:

-   Required customer information
-   Valid email format
-   Supported ticket status values
-   Supported priority values
-   Supported category values
-   Ticket existence before update/delete operations

## Security & Repository Hygiene

The repository excludes local and environment-specific files such as:

``` text
.env
*.db
venv/
__pycache__/
```

Sensitive configuration should be stored through environment variables
rather than committed to source control.

## Assessment Deliverables

This project was developed as a full-stack customer support ticketing
CRM assessment and includes:

-   Full-stack web application
-   REST API
-   SQLite database
-   Search and filtering
-   Ticket creation and updates
-   Dashboard statistics
-   Customer and reporting views
-   Deployed application
-   API documentation
-   GitHub repository
-   Demonstration video

## Author

**Shivam Pandey**

BE Computer Engineering

VESIT, Mumbai

## License

This project was developed for assessment and educational purposes.
