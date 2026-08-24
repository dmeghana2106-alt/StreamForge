from collections import defaultdict
from datetime import datetime, timedelta


class FiveMinuteWindow:
    """
    Maintains a 5-minute tumbling window for truck telemetry.

    For every truck, the window stores:
    - Number of events
    - Sum of temperatures
    - Average temperature
    """

    WINDOW_SIZE = timedelta(minutes=5)

    def __init__(self):
        self.windows = defaultdict(self._create_window)

    @staticmethod
    def _create_window():
        return {
            "window_start": None,
            "window_end": None,
            "event_count": 0,
            "temperature_sum": 0.0,
        }

    def _get_window_start(self, timestamp: datetime) -> datetime:
        """
        Align an event timestamp to the beginning
        of its 5-minute window.
        """

        minute = (timestamp.minute // 5) * 5

        return timestamp.replace(
            minute=minute,
            second=0,
            microsecond=0,
        )

    def add_event(
        self,
        truck_id: str,
        timestamp: datetime,
        temperature: float,
    ):
        """
        Add one telemetry event to the truck's
        current 5-minute window.
        """

        window_start = self._get_window_start(timestamp)
        window_end = window_start + self.WINDOW_SIZE

        window = self.windows[truck_id]

        # First event for this truck
        if window["window_start"] is None:
            window["window_start"] = window_start
            window["window_end"] = window_end

        # Event belongs to a new window
        elif timestamp >= window["window_end"]:

            result = self._build_result(
                truck_id,
                window,
            )

            # Start the new window
            window["window_start"] = window_start
            window["window_end"] = window_end
            window["event_count"] = 0
            window["temperature_sum"] = 0.0

            self._add_temperature(
                window,
                temperature,
            )

            return result

        # Event belongs to current window
        self._add_temperature(
            window,
            temperature,
        )

        return None

    def flush(self):
        """
        Close and return all currently active windows.
        """

        results = []

        for truck_id, window in self.windows.items():

            if window["event_count"] > 0:

                result = self._build_result(
                    truck_id,
                    window,
                )

                results.append(result)

        # Clear all active windows
        self.windows.clear()

        return results

    @staticmethod
    def _add_temperature(
        window,
        temperature,
    ):
        window["event_count"] += 1
        window["temperature_sum"] += temperature

    @staticmethod
    def _build_result(
        truck_id,
        window,
    ):

        event_count = window["event_count"]

        average_temperature = (
            window["temperature_sum"] / event_count
            if event_count > 0
            else 0.0
        )

        return {
            "truck_id": truck_id,
            "window_start": window["window_start"].isoformat(),
            "window_end": window["window_end"].isoformat(),
            "event_count": event_count,
            "average_temperature_c": round(
                average_temperature,
                2,
            ),
        }