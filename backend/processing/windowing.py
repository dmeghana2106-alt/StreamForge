from collections import defaultdict
from datetime import datetime, timedelta


class FiveMinuteWindow:
    """
    Five-minute event window with persistent state support.

    Each truck gets its own five-minute window.

    Active window state is stored in RocksDB when a state
    store is provided, allowing the window to be restored
    after a processor restart.
    """

    WINDOW_SIZE = timedelta(minutes=5)

    def __init__(self, state_store=None):
        self.state_store = state_store
        self.windows = defaultdict(self._create_window)

        self._restore_windows()

    @staticmethod
    def _create_window():
        return {
            "window_start": None,
            "window_end": None,
            "event_count": 0,
            "temperature_sum": 0.0,
        }

    def _restore_windows(self):
        """
        Restore active window state from RocksDB.
        """

        if self.state_store is None:
            return

        for key in self.state_store.keys():
            if not key.startswith("window:"):
                continue

            truck_id = key.replace(
                "window:",
                "",
                1,
            )

            saved_window = self.state_store.get(key)

            if saved_window is None:
                continue

            self.windows[truck_id] = saved_window

    def _get_window_start(
        self,
        timestamp: datetime,
    ) -> datetime:
        minute = (
            timestamp.minute // 5
        ) * 5

        return timestamp.replace(
            minute=minute,
            second=0,
            microsecond=0,
        )

    def _save_window(
        self,
        truck_id: str,
    ):
        """
        Save the current window state to RocksDB.
        """

        if self.state_store is None:
            return

        window = self.windows[truck_id]

        saved_window = {
            "window_start": window["window_start"],
            "window_end": window["window_end"],
            "event_count": window["event_count"],
            "temperature_sum": window["temperature_sum"],
        }

        self.state_store.save(
            f"window:{truck_id}",
            saved_window,
        )

    def _delete_window(
        self,
        truck_id: str,
    ):
        """
        Delete a truck's completed window from RocksDB.
        """

        if self.state_store is None:
            return

        self.state_store.delete(
            f"window:{truck_id}"
        )

    def add_event(
        self,
        truck_id: str,
        timestamp: datetime,
        temperature: float,
    ):
        """
        Add an event to the truck's current five-minute window.

        If the event belongs to a new window, the previous
        window result is returned.
        """

        window_start = self._get_window_start(
            timestamp
        )

        window_end = (
            window_start +
            self.WINDOW_SIZE
        )

        window = self.windows[truck_id]

        # First event for this truck
        if window["window_start"] is None:

            window["window_start"] = (
                window_start.isoformat()
            )

            window["window_end"] = (
                window_end.isoformat()
            )

            self._add_temperature(
                window,
                temperature,
            )

            self._save_window(
                truck_id
            )

            return None

        current_window_end = datetime.fromisoformat(
            window["window_end"]
        )

        # Event belongs to a new five-minute window
        if timestamp >= current_window_end:

            result = self._build_result(
                truck_id,
                window,
            )

            # Start the new window
            window["window_start"] = (
                window_start.isoformat()
            )

            window["window_end"] = (
                window_end.isoformat()
            )

            window["event_count"] = 0
            window["temperature_sum"] = 0.0

            self._add_temperature(
                window,
                temperature,
            )

            self._save_window(
                truck_id
            )

            return result

        # Event belongs to current window
        self._add_temperature(
            window,
            temperature,
        )

        self._save_window(
            truck_id
        )

        return None

    def flush(self):
        """
        Return all active window results and clear
        their persistent state.
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

            self._delete_window(
                truck_id
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
        event_count = window[
            "event_count"
        ]

        average_temperature = (
            window["temperature_sum"]
            / event_count
            if event_count > 0
            else 0.0
        )

        return {
            "truck_id": truck_id,
            "window_start": window[
                "window_start"
            ],
            "window_end": window[
                "window_end"
            ],
            "event_count": event_count,
            "average_temperature_c": round(
                average_temperature,
                2,
            ),
        }