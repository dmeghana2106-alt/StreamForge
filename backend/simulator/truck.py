import random
from datetime import datetime


class TruckSimulator:
    def __init__(self, truck_id, latitude, longitude):
        self.truck_id = truck_id
        self.latitude = latitude
        self.longitude = longitude

        self.speed = 0.0
        self.fuel_level = 100.0
        self.engine_temperature = 75.0
        self.engine_status = "RUNNING"

    def generate_telemetry(self):
        # Simulate truck movement
        self.latitude += random.uniform(-0.001, 0.001)
        self.longitude += random.uniform(-0.001, 0.001)

        # Simulate speed changes
        self.speed = max(
            0.0,
            min(100.0, self.speed + random.uniform(-10, 10))
        )

        # Simulate fuel consumption
        self.fuel_level = max(
            0.0,
            self.fuel_level - random.uniform(0.01, 0.05 )
        )

        # Simulate engine temperature
        self.engine_temperature += random.uniform(-1.5, 1.5)

        self.engine_temperature = max(
            60.0,
            min(110.0, self.engine_temperature)
        )

        # Simulate engine status
        if self.engine_temperature > 105:
            self.engine_status = "WARNING"
        else:
            self.engine_status = "RUNNING"

        # Create telemetry event
        telemetry = {
            "truck_id": self.truck_id,
            "timestamp": datetime.now().isoformat(),
            "latitude": round(self.latitude, 6),
            "longitude": round(self.longitude, 6),
            "speed_kmh": round(self.speed, 2),
            "fuel_level_percent": round(self.fuel_level, 2),
            "engine_temperature_c": round(self.engine_temperature, 2),
            "engine_status": self.engine_status
        }

        return telemetry