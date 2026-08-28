import threading

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.processing.processor import StreamProcessor


app = FastAPI(
    title="StreamForge API",
    description="Real-time telemetry streaming API",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# STREAM PROCESSOR
# ============================================================

processor = StreamProcessor()


def start_stream_processor():
    """
    Run the Kafka stream processor in a background thread.
    """

    processor.run()


@app.on_event("startup")
def startup_event():
    """
    Start Kafka processing when FastAPI starts.
    """

    thread = threading.Thread(
        target=start_stream_processor,
        daemon=True,
    )

    thread.start()

    print("StreamForge stream processor started.")


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():
    return {
        "message": "StreamForge backend is running",
        "service": "Real-Time Streaming API",
        "status": "online",
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "kafka": "connected",
        "processor": "running",
    }


# ============================================================
# REAL-TIME STATISTICS
# ============================================================

@app.get("/stats")
def get_stats():

    metrics = processor.metrics.get_metrics()

    return {
        "total_events": metrics["total_events"],
        "events_per_second": metrics["events_per_second"],
        "active_streams": metrics["active_trucks"],
        "processing_time": 0,
        "average_temperature_c": (
            metrics["average_temperature_c"]
        ),
        "average_speed_kmh": (
            metrics["average_speed_kmh"]
        ),
        "average_fuel_level_percent": (
            metrics["average_fuel_level_percent"]
        ),
    }


# ============================================================
# TRUCKS
# ============================================================

@app.get("/trucks")
def get_trucks():

    return {
        "count": len(processor.metrics.get_trucks()),
        "trucks": processor.metrics.get_trucks(),
    }


# ============================================================
# SINGLE TRUCK
# ============================================================

@app.get("/trucks/{truck_id}")
def get_truck(truck_id: str):

    truck = processor.metrics.get_truck(
        truck_id
    )

    if truck is None:
        return {
            "error": "Truck not found",
            "truck_id": truck_id,
        }

    return truck


# ============================================================
# RECENT EVENTS
# ============================================================

@app.get("/events")
def get_events():

    trucks = processor.metrics.get_trucks()

    events = []

    for index, truck in enumerate(
        reversed(trucks)
    ):

        events.append(
            {
                "id": f"TEL-{index + 1:04d}",
                "topic": "streamforge-events",
                "type": "TRUCK_TELEMETRY",
                "status": "Processed",
                "time": truck["timestamp"],
                "truck_id": truck["truck_id"],
                "temperature_c": truck[
                    "temperature_c"
                ],
                "speed_kmh": truck[
                    "speed_kmh"
                ],
                "fuel_level_percent": truck[
                    "fuel_level_percent"
                ],
                "engine_status": truck[
                    "engine_status"
                ],
            }
        )

    return events