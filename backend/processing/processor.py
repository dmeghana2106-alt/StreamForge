import json
from datetime import datetime

from confluent_kafka import Consumer, KafkaException

from backend.kafka.topics import KAFKA_BOOTSTRAP_SERVERS, EVENTS_TOPIC
from backend.processing.windowing import FiveMinuteWindow


class StreamProcessor:
    def __init__(self):
        self.consumer = Consumer(
            {
                "bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS,
                "group.id": "streamforge-processor",
                "auto.offset.reset": "earliest",
                "enable.auto.commit": True,
            }
        )

        self.consumer.subscribe([EVENTS_TOPIC])

        self.window = FiveMinuteWindow()

    def process_event(self, event: dict) -> dict | None:
        """
        Processing pipeline:

        Consume → Filter → Map → Window
        """

        # FILTER
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

        # MAP
        processed_event = {
            "truck_id": event.get("truck_id"),
            "timestamp": event.get("timestamp"),
            "temperature_c": temperature,
            "speed_kmh": event.get("speed_kmh"),
            "fuel_level_percent": event.get("fuel_level_percent"),
            "engine_status": event.get("engine_status"),
        }

        return processed_event

    def add_to_window(self, event: dict):
        """
        Add a processed telemetry event to the
        appropriate 5-minute truck window.
        """

        timestamp = datetime.fromisoformat(
            event["timestamp"]
        )

        result = self.window.add_event(
            truck_id=event["truck_id"],
            timestamp=timestamp,
            temperature=event["temperature_c"],
        )

        if result is not None:
            print()
            print("=" * 60)
            print("5-MINUTE WINDOW COMPLETED")
            print("=" * 60)
            print(f"Truck: {result['truck_id']}")
            print(f"Window Start: {result['window_start']}")
            print(f"Window End:   {result['window_end']}")
            print(f"Events:       {result['event_count']}")
            print(
                f"Average Temperature: "
                f"{result['average_temperature_c']}°C"
            )
            print("=" * 60)
            print()

    def run(self):
        print("=" * 60)
        print("          StreamForge Stream Processor")
        print("=" * 60)
        print(f"Kafka: {KAFKA_BOOTSTRAP_SERVERS}")
        print(f"Topic: {EVENTS_TOPIC}")
        print("Consumer group: streamforge-processor")
        print("Pipeline: Consume → Filter → Map → 5-Minute Window")
        print("Press Ctrl+C to stop.")
        print()

        try:
            while True:
                message = self.consumer.poll(1.0)

                if message is None:
                    continue

                if message.error():
                    raise KafkaException(message.error())

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

                    processed_event = self.process_event(event)

                    if processed_event is not None:
                        print(
                            f"Processed | "
                            f"truck={processed_event['truck_id']} | "
                            f"temp={processed_event['temperature_c']:.2f}°C | "
                            f"speed={processed_event['speed_kmh']:.2f} km/h | "
                            f"fuel={processed_event['fuel_level_percent']:.2f}%"
                        )

                        self.add_to_window(processed_event)

                        print("-" * 60)

                except json.JSONDecodeError:
                    print("Invalid JSON event received")

        except KeyboardInterrupt:
            print("\nStopping Stream Processor...")

        finally:
            self.consumer.close()
            print("Stream Processor stopped.")


if __name__ == "__main__":
    processor = StreamProcessor()
    processor.run()