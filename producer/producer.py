from kafka import KafkaProducer
import json
import time

producer = KafkaProducer(
    bootstrap_servers="localhost:9092",
    value_serializer=lambda v: json.dumps(v).encode("utf-8")
)

topic = "streamforge-events"

print("StreamForge Producer started...")

while True:
    message = {
        "source": "streamforge",
        "message": "Hello from StreamForge",
        "timestamp": time.time()
    }

    producer.send(topic, value=message)
    producer.flush()

    print("Sent:", message)

    time.sleep(2)