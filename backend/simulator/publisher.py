import time

from backend.kafka.producer import KafkaEventProducer
from backend.simulator.truck import TruckSimulator
from backend.models.telemetry import TruckTelemetry


def main():
    producer = KafkaEventProducer()

    trucks = [
        TruckSimulator("TRUCK-001", 17.3850, 78.4867),
        TruckSimulator("TRUCK-002", 17.4000, 78.4800),
        TruckSimulator("TRUCK-003", 17.3700, 78.4900),
    ]

    print("=" * 60)
    print("        StreamForge Telemetry Publisher")
    print("=" * 60)
    print("Publishing truck telemetry to Kafka...")
    print("Topic: streamforge-events")
    print("Press Ctrl+C to stop.")
    print()

    try:
        while True:
            for truck in trucks:
                telemetry_data = truck.generate_telemetry()

                # Validate telemetry before sending to Kafka
                telemetry = TruckTelemetry(**telemetry_data)

                # Convert validated model to dictionary
                event = telemetry.model_dump(mode="json")

                # Send event to Kafka
                producer.publish(event)

                print(
                    f"Sent | "
                    f"{telemetry.truck_id} | "
                    f"Temp: {telemetry.engine_temperature_c:.2f}°C | "
                    f"Speed: {telemetry.speed_kmh:.2f} km/h | "
                    f"Fuel: {telemetry.fuel_level_percent:.2f}%"
                )

            # Give Kafka time to deliver messages
            producer.producer.flush()

            time.sleep(2)

    except KeyboardInterrupt:
        print("\nStopping telemetry publisher...")

    finally:
        producer.flush()
        print("Telemetry publisher stopped.")


if __name__ == "__main__":
    main()