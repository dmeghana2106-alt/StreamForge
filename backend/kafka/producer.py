import json

from confluent_kafka import Producer

from backend.kafka.topics import KAFKA_BOOTSTRAP_SERVERS, EVENTS_TOPIC


class KafkaEventProducer:
    def __init__(self):
        self.producer = Producer(
            {
                "bootstrap.servers": KAFKA_BOOTSTRAP_SERVERS,
                "client.id": "streamforge-producer",
            }
        )

    @staticmethod
    def _delivery_report(err, message):
        if err is not None:
            print(f"Kafka delivery failed: {err}")
        else:
            print(
                f"Kafka event delivered: "
                f"topic={message.topic()}, "
                f"partition={message.partition()}, "
                f"offset={message.offset()}"
            )

    def publish(self, event: dict) -> None:
        payload = json.dumps(event).encode("utf-8")

        self.producer.produce(
            topic=EVENTS_TOPIC,
            value=payload,
            callback=self._delivery_report,
        )

        self.producer.poll(0)

    def flush(self) -> None:
        self.producer.flush()