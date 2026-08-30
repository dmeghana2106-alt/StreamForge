from collections import defaultdict, deque
from datetime import datetime


class RealTimeMetrics:
    """
    Maintains real-time metrics for StreamForge.
    """

    def __init__(self):

        self.total_events = 0

        self.total_temperature = 0.0

        self.total_speed = 0.0

        self.total_fuel = 0.0


        # Latest state of every truck
        self.trucks = {}


        # Event throughput
        self.events_by_second = defaultdict(int)


        # Recent event history
        self.recent_events = deque(
            maxlen=50
        )


    def record_event(self, event: dict):
        """
        Record one processed telemetry event.
        """

        self.total_events += 1


        temperature = event.get(
            "temperature_c",
            0.0,
        )

        speed = event.get(
            "speed_kmh",
            0.0,
        )

        fuel = event.get(
            "fuel_level_percent",
            0.0,
        )


        self.total_temperature += temperature

        self.total_speed += speed

        self.total_fuel += fuel


        truck_id = event.get(
            "truck_id"
        )


        # Latest truck state

        self.trucks[truck_id] = {

            "truck_id": truck_id,

            "timestamp": event.get(
                "timestamp"
            ),

            "temperature_c": temperature,

            "speed_kmh": speed,

            "fuel_level_percent": fuel,

            "engine_status": event.get(
                "engine_status"
            ),

        }


        # Save event history

        self.recent_events.appendleft({

            "id": (
                f"TEL-"
                f"{self.total_events:06d}"
            ),

            "topic": (
                "streamforge-events"
            ),

            "type": (
                "TRUCK_TELEMETRY"
            ),

            "status": (
                "Processed"
            ),

            "time": event.get(
                "timestamp"
            ),

            "truck_id": truck_id,

            "temperature_c": temperature,

            "speed_kmh": speed,

            "fuel_level_percent": fuel,

            "engine_status": event.get(
                "engine_status"
            ),

        })


        # Events per second

        timestamp = datetime.fromisoformat(
            event["timestamp"]
        )


        second_key = timestamp.strftime(
            "%Y-%m-%dT%H:%M:%S"
        )


        self.events_by_second[
            second_key
        ] += 1


    def get_metrics(self):
        """
        Return current real-time metrics.
        """

        if self.total_events == 0:

            return {

                "total_events": 0,

                "average_temperature_c": 0.0,

                "average_speed_kmh": 0.0,

                "average_fuel_level_percent": 0.0,

                "active_trucks": 0,

                "events_per_second": 0,

            }


        latest_seconds = sorted(
            self.events_by_second.keys()
        )[-5:]


        recent_event_count = sum(

            self.events_by_second[second]

            for second in latest_seconds

        )


        return {

            "total_events":
                self.total_events,


            "average_temperature_c":

                round(

                    self.total_temperature
                    / self.total_events,

                    2,

                ),


            "average_speed_kmh":

                round(

                    self.total_speed
                    / self.total_events,

                    2,

                ),


            "average_fuel_level_percent":

                round(

                    self.total_fuel
                    / self.total_events,

                    2,

                ),


            "active_trucks":
                len(self.trucks),


            "events_per_second":

                round(

                    recent_event_count
                    / max(
                        len(latest_seconds),
                        1,
                    ),

                    2,

                ),

        }


    def get_trucks(self):
        """
        Return latest telemetry
        for every truck.
        """

        return list(
            self.trucks.values()
        )


    def get_truck(
        self,
        truck_id: str,
    ):
        """
        Return latest telemetry
        for one truck.
        """

        return self.trucks.get(
            truck_id
        )


    def get_recent_events(
        self,
        limit: int = 20,
    ):
        """
        Return recent processed events.
        """

        return list(
            self.recent_events
        )[:limit]


    def reset(self):
        """
        Reset all in-memory metrics.
        """

        self.total_events = 0

        self.total_temperature = 0.0

        self.total_speed = 0.0

        self.total_fuel = 0.0


        self.trucks.clear()

        self.events_by_second.clear()

        self.recent_events.clear()