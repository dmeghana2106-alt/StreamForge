class AnomalyDetector:
    """
    Detects abnormal conditions in truck telemetry.

    Rules:
    - High engine temperature: > 100°C
    - Low fuel: < 20%
    - Overspeed: > 90 km/h
    - Engine warning status: WARNING
    """

    TEMPERATURE_LIMIT = 100.0
    FUEL_LIMIT = 20.0
    SPEED_LIMIT = 90.0

    def detect(self, event: dict) -> list[dict]:
        alerts = []

        truck_id = event.get("truck_id")
        timestamp = event.get("timestamp")

        temperature = event.get("temperature_c")
        fuel = event.get("fuel_level_percent")
        speed = event.get("speed_kmh")
        engine_status = event.get("engine_status")

        # High temperature detection
        if temperature is not None and temperature > self.TEMPERATURE_LIMIT:
            alerts.append(
                {
                    "truck_id": truck_id,
                    "timestamp": timestamp,
                    "type": "HIGH_TEMPERATURE",
                    "severity": "HIGH",
                    "message": (
                        f"Engine temperature is {temperature}°C"
                    ),
                    "value": temperature,
                    "threshold": self.TEMPERATURE_LIMIT,
                }
            )

        # Low fuel detection
        if fuel is not None and fuel < self.FUEL_LIMIT:
            alerts.append(
                {
                    "truck_id": truck_id,
                    "timestamp": timestamp,
                    "type": "LOW_FUEL",
                    "severity": "MEDIUM",
                    "message": (
                        f"Fuel level is {fuel}%"
                    ),
                    "value": fuel,
                    "threshold": self.FUEL_LIMIT,
                }
            )

        # Overspeed detection
        if speed is not None and speed > self.SPEED_LIMIT:
            alerts.append(
                {
                    "truck_id": truck_id,
                    "timestamp": timestamp,
                    "type": "OVERSPEED",
                    "severity": "HIGH",
                    "message": (
                        f"Truck speed is {speed} km/h"
                    ),
                    "value": speed,
                    "threshold": self.SPEED_LIMIT,
                }
            )

        # Engine warning detection
        if engine_status == "WARNING":
            alerts.append(
                {
                    "truck_id": truck_id,
                    "timestamp": timestamp,
                    "type": "ENGINE_WARNING",
                    "severity": "HIGH",
                    "message": "Truck engine status is WARNING",
                    "value": engine_status,
                    "threshold": "RUNNING",
                }
            )

        return alerts