from datetime import datetime

from pydantic import BaseModel, Field


class TruckTelemetry(BaseModel):
    truck_id: str = Field(min_length=1)
    timestamp: datetime

    latitude: float
    longitude: float

    speed_kmh: float = Field(ge=0, le=100)
    fuel_level_percent: float = Field(ge=0, le=100)

    engine_temperature_c: float
    engine_status: str