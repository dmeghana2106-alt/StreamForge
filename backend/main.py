from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="StreamForge API")

# Allow the React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "StreamForge backend is running"
    }


@app.get("/stats")
def get_stats():
    return {
        "total_events": 12480,
        "events_per_second": 248,
        "active_streams": 4,
        "processing_time": 42
    }


@app.get("/events")
def get_events():
    return [
        {
            "id": "EVT-1024",
            "topic": "streamforge-events",
            "type": "USER_ACTION",
            "status": "Processed",
            "time": "Just now"
        },
        {
            "id": "EVT-1023",
            "topic": "streamforge-events",
            "type": "TRANSACTION",
            "status": "Processed",
            "time": "2 sec ago"
        },
        {
            "id": "EVT-1022",
            "topic": "streamforge-events",
            "type": "LOGIN",
            "status": "Processed",
            "time": "5 sec ago"
        }
    ]