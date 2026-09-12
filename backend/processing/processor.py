import json
from datetime import datetime

from confluent_kafka import Consumer, KafkaException

from backend.kafka.topics import (
    KAFKA_BOOTSTRAP_SERVERS,
    EVENTS_TOPIC,
)
from backend.processing.windowing import FiveMinuteWindow
from backend.state.rocksdb_store import RocksDBStateStore
from backend.analytics.metrics import RealTimeMetrics
from backend.analytics.anomaly_detector import AnomalyDetector


class StreamProcessor:
    def __init__(self):
        # Persistent state
        self.state_store = RocksDBStateStore()

        # Real-time analytics
        self.metrics = RealTimeMetrics()

        # Anomaly detection
        self.anomaly_detector = AnomalyDetector()

        # -----------------------------------------
        # Load previously saved alerts from RocksDB
        # -----------------------------------------

        saved_alerts = self.state_store.get(
            "alerts"
        )

        if saved_alerts is None:
            self.alerts = []
        else:
            self.alerts = saved_alerts

        # -----------------------------------------
        # Kafka Consumer
        # -----------------------------------------

        self.consumer = Consumer(
            {
                "bootstrap.servers":
                    KAFKA_BOOTSTRAP_SERVERS,
                "group.id":
                    "streamforge-processor",
                "auto.offset.reset":
                    "earliest",
                "enable.auto.commit":
                    True,
            }
        )

        self.consumer.subscribe(
            [EVENTS_TOPIC]
        )

        # -----------------------------------------
        # Five-minute window processor
        # -----------------------------------------

        self.window = FiveMinuteWindow(
            self.state_store
        )

    # ==================================================
    # FILTER + MAP
    # ==================================================

    def process_event(
        self,
        event: dict
    ) -> dict | None:
        """
        Processing pipeline:

        Consume → Filter → Map
        """

        temperature = event.get(
            "engine_temperature_c"
        )

        # -----------------------------------------
        # Filter: missing temperature
        # -----------------------------------------

        if temperature is None:
            print(
                "Filtered: missing temperature"
            )
            return None

        # -----------------------------------------
        # Filter: invalid temperature
        # -----------------------------------------

        if temperature <= 0:
            print(
                f"Filtered: "
                f"{event.get('truck_id')} "
                f"temperature={temperature}"
            )
            return None

        # -----------------------------------------
        # Map raw telemetry into processed event
        # -----------------------------------------

        processed_event = {
            "truck_id": event.get(
                "truck_id"
            ),
            "timestamp": event.get(
                "timestamp"
            ),
            "temperature_c": temperature,
            "speed_kmh": event.get(
                "speed_kmh"
            ),
            "fuel_level_percent": event.get(
                "fuel_level_percent"
            ),
            "engine_status": event.get(
                "engine_status"
            ),
        }

        return processed_event

    # ==================================================
    # ANOMALY DETECTION
    # ==================================================

    def detect_anomalies(
        self,
        event: dict
    ):
        """
        Detect abnormal conditions in a
        processed telemetry event.

        Detected alerts are stored in RocksDB.
        """

        detected_alerts = (
            self.anomaly_detector.detect(
                event
            )
        )

        if not detected_alerts:
            return

        for alert in detected_alerts:

            self.alerts.append(
                alert
            )

            # Keep only latest 50 alerts
            if len(self.alerts) > 50:
                self.alerts.pop(0)

            # Persist alerts
            self.state_store.save(
                "alerts",
                self.alerts
            )

            # -----------------------------------------
            # Print alert
            # -----------------------------------------

            print()
            print(
                "!" * 60
            )
            print(
                "                 ALERT DETECTED"
            )
            print(
                "!" * 60
            )

            print(
                f"Truck:     "
                f"{alert['truck_id']}"
            )

            print(
                f"Type:      "
                f"{alert['type']}"
            )

            print(
                f"Severity:  "
                f"{alert['severity']}"
            )

            print(
                f"Message:   "
                f"{alert['message']}"
            )

            print(
                f"Value:     "
                f"{alert['value']}"
            )

            print(
                f"Threshold: "
                f"{alert['threshold']}"
            )

            print(
                "!" * 60
            )
            print()

    # ==================================================
    # ALERT API SUPPORT
    # ==================================================

    def get_alerts(self):
        """
        Return recently detected alerts.

        Alerts are restored from RocksDB when
        the StreamProcessor starts.
        """

        return list(
            reversed(
                self.alerts
            )
        )

    # ==================================================
    # FIVE-MINUTE WINDOW
    # ==================================================

    def add_to_window(
        self,
        event: dict
    ):
        """
        Add processed event to the
        five-minute window.
        """

        timestamp = datetime.fromisoformat(
            event["timestamp"]
        )

        result = self.window.add_event(
            truck_id=event["truck_id"],
            timestamp=timestamp,
            temperature=event[
                "temperature_c"
            ],
        )

        # A result is returned when the
        # previous five-minute window completes.
        if result is not None:
            self.print_window_result(
                result
            )

    # ==================================================
    # ACTIVE WINDOW API SUPPORT
    # ==================================================

    def get_active_windows(self):
        """
        Return currently active
        five-minute windows.
        """

        return self.window.get_active_windows()

    # ==================================================
    # COMPLETED WINDOW API SUPPORT
    # ==================================================

    def get_completed_windows(self):
        """
        Return recently completed
        five-minute windows.
        """

        return (
            self.window.get_completed_windows()
        )

    # ==================================================
    # PRINT WINDOW RESULT
    # ==================================================

    @staticmethod
    def print_window_result(
        result: dict
    ):
        print()
        print(
            "=" * 60
        )

        print(
            "5-MINUTE WINDOW COMPLETED"
        )

        print(
            "=" * 60
        )

        print(
            f"Truck: "
            f"{result['truck_id']}"
        )

        print(
            f"Window Start: "
            f"{result['window_start']}"
        )

        print(
            f"Window End:   "
            f"{result['window_end']}"
        )

        print(
            f"Events: "
            f"{result['event_count']}"
        )

        print(
            f"Average Temperature: "
            f"{result['average_temperature_c']}°C"
        )

        print(
            "=" * 60
        )

        print()

    # ==================================================
    # REAL-TIME METRICS
    # ==================================================

    def print_metrics(self):
        metrics = (
            self.metrics.get_metrics()
        )

        print()
        print(
            "=" * 60
        )

        print(
            "REAL-TIME ANALYTICS"
        )

        print(
            "=" * 60
        )

        print(
            f"Total Events: "
            f"{metrics['total_events']}"
        )

        print(
            f"Events / Sec: "
            f"{metrics['events_per_second']}"
        )

        print(
            f"Active Trucks: "
            f"{metrics['active_trucks']}"
        )

        print(
            f"Average Temperature: "
            f"{metrics['average_temperature_c']}°C"
        )

        print(
            f"Average Speed: "
            f"{metrics['average_speed_kmh']} km/h"
        )

        print(
            f"Average Fuel: "
            f"{metrics['average_fuel_level_percent']}%"
        )

        print(
            f"Active Alerts: "
            f"{len(self.alerts)}"
        )

        print(
            "=" * 60
        )

        print()

    # ==================================================
    # FLUSH WINDOWS
    # ==================================================

    def flush_windows(self):
        """
        Flush active windows when the
        processor is stopped.
        """

        results = self.window.flush()

        if not results:
            print(
                "No active windows to flush."
            )
            return

        print()
        print(
            "=" * 60
        )

        print(
            "FLUSHING ACTIVE WINDOWS"
        )

        print(
            "=" * 60
        )

        for result in results:
            self.print_window_result(
                result
            )

    # ==================================================
    # MAIN STREAM PROCESSING LOOP
    # ==================================================

    def run(self):

        print(
            "=" * 60
        )

        print(
            "          StreamForge Stream Processor"
        )

        print(
            "=" * 60
        )

        print(
            f"Kafka: "
            f"{KAFKA_BOOTSTRAP_SERVERS}"
        )

        print(
            f"Topic: "
            f"{EVENTS_TOPIC}"
        )

        print(
            "Consumer group: "
            "streamforge-processor"
        )

        print(
            "Pipeline: "
            "Consume → Filter → Map → "
            "Anomaly Detection → Analytics → "
            "5-Minute Window → RocksDB"
        )

        print(
            "Press Ctrl+C to stop."
        )

        print()

        try:

            while True:

                # -----------------------------------------
                # Consume Kafka message
                # -----------------------------------------

                message = self.consumer.poll(
                    1.0
                )

                if message is None:
                    continue

                # -----------------------------------------
                # Kafka error
                # -----------------------------------------

                if message.error():
                    raise KafkaException(
                        message.error()
                    )

                try:

                    # -----------------------------------------
                    # Decode JSON
                    # -----------------------------------------

                    event = json.loads(
                        message.value().decode(
                            "utf-8"
                        )
                    )

                    print(
                        f"Consumed | "
                        f"partition="
                        f"{message.partition()} | "
                        f"offset="
                        f"{message.offset()} | "
                        f"truck="
                        f"{event.get('truck_id')}"
                    )

                    # -----------------------------------------
                    # Filter + Map
                    # -----------------------------------------

                    processed_event = (
                        self.process_event(
                            event
                        )
                    )

                    if processed_event is not None:

                        print(
                            f"Processed | "
                            f"truck="
                            f"{processed_event['truck_id']} | "
                            f"temp="
                            f"{processed_event['temperature_c']:.2f}°C | "
                            f"speed="
                            f"{processed_event['speed_kmh']:.2f} km/h | "
                            f"fuel="
                            f"{processed_event['fuel_level_percent']:.2f}%"
                        )

                        # -----------------------------------------
                        # Anomaly Detection
                        # -----------------------------------------

                        self.detect_anomalies(
                            processed_event
                        )

                        # -----------------------------------------
                        # Real-Time Analytics
                        # -----------------------------------------

                        self.metrics.record_event(
                            processed_event
                        )

                        # -----------------------------------------
                        # Five-Minute Window
                        # -----------------------------------------

                        self.add_to_window(
                            processed_event
                        )

                        print(
                            "-" * 60
                        )

                except json.JSONDecodeError:

                    print(
                        "Invalid JSON event received"
                    )

        except KeyboardInterrupt:

            print(
                "\nStopping Stream Processor..."
            )

        finally:

            # -----------------------------------------
            # Print final analytics
            # -----------------------------------------

            self.print_metrics()

            # -----------------------------------------
            # Flush active windows
            # -----------------------------------------

            self.flush_windows()

            # -----------------------------------------
            # Close Kafka consumer
            # -----------------------------------------

            self.consumer.close()

            # -----------------------------------------
            # Close RocksDB
            # -----------------------------------------

            self.state_store.close()

            print(
                "Stream Processor stopped."
            )


# ======================================================
# DIRECT EXECUTION
# ======================================================

if __name__ == "__main__":

    processor = StreamProcessor()

    processor.run()