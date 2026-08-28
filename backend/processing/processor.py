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


class StreamProcessor:
    def __init__(self):

        # Persistent state
        self.state_store = RocksDBStateStore()

        # Real-time analytics
        self.metrics = RealTimeMetrics()

        # Kafka consumer
        self.consumer = Consumer(
            {
                "bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS,
                "group.id": "streamforge-processor",
                "auto.offset.reset": "earliest",
                "enable.auto.commit": True,
            }
        )

        self.consumer.subscribe([EVENTS_TOPIC])

        # Persistent 5-minute windows
        self.window = FiveMinuteWindow(
            self.state_store
        )

    def process_event(self, event: dict) -> dict | None:
        """
        Processing pipeline:

        Consume → Filter → Map
        """

        # FILTER
        temperature = event.get(
            "engine_temperature_c"
        )

        if temperature is None:
            print("Filtered: missing temperature")
            return None

        if temperature <= 0:
            print(
                f"Filtered: {event.get('truck_id')} "
                f"temperature={temperature}"
            )
            return None

        # MAP
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

        print(
            f"Truck: {result['truck_id']}"
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

        print("=" * 60)
        print()

    def print_metrics(self):

        metrics = self.metrics.get_metrics()

        print()
        print("=" * 60)
        print("REAL-TIME ANALYTICS")
        print("=" * 60)

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

        print("=" * 60)
        print()

    def flush_windows(self):

        results = self.window.flush()

        if not results:
            print(
                "No active windows to flush."
            )
            return

        print()
        print("=" * 60)
        print("FLUSHING ACTIVE WINDOWS")
        print("=" * 60)

        for result in results:
            self.print_window_result(result)

    def run(self):

        print("=" * 60)
        print(
            "          StreamForge Stream Processor"
        )
        print("=" * 60)

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
            "Analytics → 5-Minute Window → RocksDB"
        )

        print(
            "Press Ctrl+C to stop."
        )

        print()

        try:

            while True:

                message = self.consumer.poll(
                    1.0
                )

                if message is None:
                    continue

                if message.error():
                    raise KafkaException(
                        message.error()
                    )

                try:

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

                        # Update real-time analytics
                        self.metrics.record_event(
                            processed_event
                        )

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

            # Show final analytics
            self.print_metrics()

            # Flush active windows
            self.flush_windows()

            # Close Kafka
            self.consumer.close()

            # Close RocksDB
            self.state_store.close()

            print(
                "Stream Processor stopped."
            )


if __name__ == "__main__":

    processor = StreamProcessor()

    processor.run()