from fastapi import FastAPI

app = FastAPI(
    title="Support CRM API",
    description="Customer Support Ticketing CRM",
    version="1.0.0"
)


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