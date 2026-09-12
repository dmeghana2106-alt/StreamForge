import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.processing.processor import StreamProcessor


app = FastAPI(
    title="StreamForge API",
    description="Real-time telemetry streaming API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


processor = StreamProcessor()


def start_stream_processor():
    processor.run()


@app.on_event("startup")
def startup_event():

    thread = threading.Thread(
        target=start_stream_processor,
        daemon=True,
    )

    thread.start()

    print(
        "StreamForge stream processor started."
    )


# ======================================================
# HOME
# ======================================================

@app.get("/")
def home():

    return {
        "message": "StreamForge backend is running",
        "service": "Real-Time Streaming API",
        "status": "online",
    }


# ======================================================
# HEALTH
# ======================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "kafka": "connected",
        "processor": "running",
    }


# ======================================================
# REAL-TIME STATISTICS
# ======================================================

@app.get("/stats")
def get_stats():

    metrics = processor.metrics.get_metrics()

    return {
        "total_events": metrics[
            "total_events"
        ],
        "events_per_second": metrics[
            "events_per_second"
        ],
        "active_streams": metrics[
            "active_trucks"
        ],
        "processing_time": 0,
        "average_temperature_c": metrics[
            "average_temperature_c"
        ],
        "average_speed_kmh": metrics[
            "average_speed_kmh"
        ],
        "average_fuel_level_percent": metrics[
            "average_fuel_level_percent"
        ],
    }


# ======================================================
# ALL TRUCKS
# ======================================================

@app.get("/trucks")
def get_trucks():

    trucks = (
        processor.metrics.get_trucks()
    )

    return {
        "count": len(trucks),
        "trucks": trucks,
    }


# ======================================================
# SINGLE TRUCK
# ======================================================

@app.get("/trucks/{truck_id}")
def get_truck(
    truck_id: str
):

    truck = (
        processor.metrics.get_truck(
            truck_id
        )
    )

    if truck is None:

        return {
            "error": "Truck not found",
            "truck_id": truck_id,
        }

    return truck


# ======================================================
# RECENT EVENTS
# ======================================================

@app.get("/events")
def get_events():

    events = (
        processor.metrics.get_recent_events(
            limit=20
        )
    )

    return events


# ======================================================
# ALERTS
# ======================================================

@app.get("/alerts")
def get_alerts():

    alerts = (
        processor.get_alerts()
    )

    return {
        "count": len(alerts),
        "alerts": alerts,
    }


# ======================================================
# FIVE-MINUTE WINDOWS
# ======================================================

@app.get("/windows")
def get_windows():

    active_windows = (
        processor.get_active_windows()
    )

    completed_windows = (
        processor.get_completed_windows()
    )

    return {
        "active_count": len(
            active_windows
        ),
        "completed_count": len(
            completed_windows
        ),
        "active_windows": active_windows,
        "completed_windows": completed_windows,
    }


# ======================================================
# COMPLETE DASHBOARD DATA
# ======================================================

@app.get("/dashboard")
def get_dashboard():

    metrics = (
        processor.metrics.get_metrics()
    )

    trucks = (
        processor.metrics.get_trucks()
    )

    events = (
        processor.metrics.get_recent_events(
            limit=20
        )
    )

    alerts = (
        processor.get_alerts()
    )

    active_windows = (
        processor.get_active_windows()
    )

    completed_windows = (
        processor.get_completed_windows()
    )

    return {

        "stats": {
            "total_events": metrics[
                "total_events"
            ],
            "events_per_second": metrics[
                "events_per_second"
            ],
            "active_streams": metrics[
                "active_trucks"
            ],
            "average_temperature_c": metrics[
                "average_temperature_c"
            ],
            "average_speed_kmh": metrics[
                "average_speed_kmh"
            ],
            "average_fuel_level_percent": metrics[
                "average_fuel_level_percent"
            ],
        },

        "trucks": {
            "count": len(trucks),
            "items": trucks,
        },

        "events": events,

        "alerts": {
            "count": len(alerts),
            "items": alerts,
        },

        "windows": {
            "active_count": len(
                active_windows
            ),
            "completed_count": len(
                completed_windows
            ),
            "active": active_windows,
            "completed": completed_windows,
        },
    }