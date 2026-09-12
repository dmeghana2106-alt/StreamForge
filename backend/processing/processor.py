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
        self.state_store = RocksDBStateStore()
        self.metrics = RealTimeMetrics()
        self.anomaly_detector = AnomalyDetector()

        # Load previously saved alerts from RocksDB
        saved_alerts = self.state_store.get("alerts")

        if saved_alerts is None:
            self.alerts = []
        else:
            self.alerts = saved_alerts

        self.consumer = Consumer(
            {
                "bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS,
                "group.id": "streamforge-processor",
                "auto.offset.reset": "earliest",
                "enable.auto.commit": True,
            }
        )

        self.consumer.subscribe([EVENTS_TOPIC])

        self.window = FiveMinuteWindow(
            self.state_store
        )

    def process_event(self, event: dict) -> dict | None:
        """
        Processing pipeline:

        Consume → Filter → Map
        """

        temperature = event.get("engine_temperature_c")

        if temperature is None:
            print("Filtered: missing temperature")
            return None

        if temperature <= 0:
            print(
                f"Filtered: {event.get('truck_id')} "
                f"temperature={temperature}"
            )
            return None

        processed_event = {
            "truck_id": event.get("truck_id"),
            "timestamp": event.get("timestamp"),
            "temperature_c": temperature,
            "speed_kmh": event.get("speed_kmh"),
            "fuel_level_percent": event.get(
                "fuel_level_percent"
            ),
            "engine_status": event.get(
                "engine_status"
            ),
        }

        return processed_event

    def detect_anomalies(self, event: dict):
        """
        Detect abnormal conditions in a processed event
        and persist the resulting alerts in RocksDB.
        """

        detected_alerts = self.anomaly_detector.detect(
            event
        )

        if not detected_alerts:
            return

        for alert in detected_alerts:
            self.alerts.append(alert)

            # Keep only the latest 50 alerts
            if len(self.alerts) > 50:
                self.alerts.pop(0)

            # Persist alerts in RocksDB
            self.state_store.save(
                "alerts",
                self.alerts
            )

            print()
            print("!" * 60)
            print("                 ALERT DETECTED")
            print("!" * 60)
            print(f"Truck:     {alert['truck_id']}")
            print(f"Type:      {alert['type']}")
            print(f"Severity:  {alert['severity']}")
            print(f"Message:   {alert['message']}")
            print(f"Value:     {alert['value']}")
            print(f"Threshold: {alert['threshold']}")
            print("!" * 60)
            print()

    def get_alerts(self):
        """
        Return recently detected alerts.

        Alerts are loaded from the in-memory copy that
        was restored from RocksDB during initialization.
        """

        return list(reversed(self.alerts))

    def add_to_window(self, event: dict):
        timestamp = datetime.fromisoformat(
            event["timestamp"]
        )

        result = self.window.add_event(
            truck_id=event["truck_id"],
            timestamp=timestamp,
            temperature=event["temperature_c"],
        )

        if result is not None:
            self.print_window_result(result)

    @staticmethod
    def print_window_result(result: dict):
        print()
        print("=" * 60)
        print("5-MINUTE WINDOW COMPLETED")
        print("=" * 60)
        print(f"Truck: {result['truck_id']}")
        print(f"Window Start: {result['window_start']}")
        print(f"Window End:   {result['window_end']}")
        print(f"Events: {result['event_count']}")
        print(
            f"Average Temperature: "
            f"{result['average_temperature_c']}°C"
        )
        print("=" * 60)
        print()

    def print_metrics(self):
        metrics = self.metrics.get_metrics()

        print()
        print("=" * 60)
        print("REAL-TIME ANALYTICS")
        print("=" * 60)
        print(f"Total Events: {metrics['total_events']}")
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
        print("=" * 60)
        print()

    def flush_windows(self):
        results = self.window.flush()

        if not results:
            print("No active windows to flush.")
            return

        print()
        print("=" * 60)
        print("FLUSHING ACTIVE WINDOWS")
        print("=" * 60)

        for result in results:
            self.print_window_result(result)

    def run(self):
        print("=" * 60)
        print("          StreamForge Stream Processor")
        print("=" * 60)
        print(f"Kafka: {KAFKA_BOOTSTRAP_SERVERS}")
        print(f"Topic: {EVENTS_TOPIC}")
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
        print("Press Ctrl+C to stop.")
        print()

        try:
            while True:
                message = self.consumer.poll(1.0)

                if message is None:
                    continue

                if message.error():
                    raise KafkaException(
                        message.error()
                    )

                try:
                    event = json.loads(
                        message.value().decode("utf-8")
                    )

                    print(
                        f"Consumed | "
                        f"partition={message.partition()} | "
                        f"offset={message.offset()} | "
                        f"truck={event.get('truck_id')}"
                    )

                    processed_event = self.process_event(
                        event
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

                        # Detect anomalies
                        self.detect_anomalies(
                            processed_event
                        )

                        # Update real-time analytics
                        self.metrics.record_event(
                            processed_event
                        )

                        # Add event to five-minute window
                        self.add_to_window(
                            processed_event
                        )

                        print("-" * 60)

                except json.JSONDecodeError:
                    print(
                        "Invalid JSON event received"
                    )

        except KeyboardInterrupt:
            print(
                "\nStopping Stream Processor..."
            )

        finally:
            self.print_metrics()
            self.flush_windows()
            self.consumer.close()
            self.state_store.close()
            print(
                "Stream Processor stopped."
            )


if __name__ == "__main__":
    processor = StreamProcessor()
    processor.run()