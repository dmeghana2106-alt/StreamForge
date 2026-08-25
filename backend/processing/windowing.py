from collections import defaultdict
from datetime import datetime, timedelta

from backend.state.rocksdb_store import RocksDBStateStore


class FiveMinuteWindow:
    """
    Maintains a 5-minute tumbling window for truck telemetry.

    Window state is persisted in RocksDB so that the processor
    can recover active windows after a restart.
    """

    WINDOW_SIZE = timedelta(minutes=5)

    def __init__(self, state_store: RocksDBStateStore):
        self.state_store = state_store
        self.windows = defaultdict(self._create_window)

        self._load_state()

    @staticmethod
    def _create_window():
        return {
            "window_start": None,
            "window_end": None,
            "event_count": 0,
            "temperature_sum": 0.0,
        }

    def _get_window_start(self, timestamp: datetime) -> datetime:
        minute = (timestamp.minute // 5) * 5

        return timestamp.replace(
            minute=minute,
            second=0,
            microsecond=0,
        )

    def _load_state(self):
        """
        Recover previously saved window state from RocksDB.
        """

        recovered = 0

        for truck_id in self.state_store.keys():
            saved_window = self.state_store.get(
                f"window:{truck_id}"
            )

            if saved_window is None:
                continue

            window = self._create_window()

            window["window_start"] = (
                datetime.fromisoformat(
                    saved_window["window_start"]
                )
                if saved_window["window_start"]
                else None
            )

            window["window_end"] = (
                datetime.fromisoformat(
                    saved_window["window_end"]
                )
                if saved_window["window_end"]
                else None
            )

            window["event_count"] = saved_window[
                "event_count"
            ]

            window["temperature_sum"] = saved_window[
                "temperature_sum"
            ]

            self.windows[truck_id] = window
            recovered += 1

        if recovered > 0:
            print(
                f"Recovered {recovered} active window(s) "
                f"from RocksDB."
            )

    def _save_window_state(self, truck_id: str):
        """
        Persist the current window state for a truck.
        """

        window = self.windows[truck_id]

        state = {
            "window_start": (
                window["window_start"].isoformat()
                if window["window_start"]
                else None
            ),
            "window_end": (
                window["window_end"].isoformat()
                if window["window_end"]
                else None
            ),
            "event_count": window["event_count"],
            "temperature_sum": window["temperature_sum"],
        }

        self.state_store.save(
            f"window:{truck_id}",
            state,
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

            # Start new window
            window["window_start"] = window_start
            window["window_end"] = window_end
            window["event_count"] = 0
            window["temperature_sum"] = 0.0

            self._add_temperature(
                window,
                temperature,
            )

            self._save_window_state(truck_id)

            # Previous window is completed
            self.state_store.delete(
                f"completed:{truck_id}"
            )

            return result

        # Event belongs to current window
        self._add_temperature(
            window,
            temperature,
        )

        # Persist updated state
        self._save_window_state(truck_id)

        return None

    def flush(self):
        """
        Close and return all currently active windows.
        """

        results = []

        for truck_id, window in list(
            self.windows.items()
        ):

            if window["event_count"] > 0:

                result = self._build_result(
                    truck_id,
                    window,
                )

                results.append(result)

                self.state_store.delete(
                    f"window:{truck_id}"
                )

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
            "window_start": (
                window["window_start"].isoformat()
            ),
            "window_end": (
                window["window_end"].isoformat()
            ),
            "event_count": event_count,
            "average_temperature_c": round(
                average_temperature,
                2,
            ),
        }