import json
from pathlib import Path

from rocksdict import Rdict


class RocksDBStateStore:
    """
    Persistent state store for StreamForge.

    Stores stream-processing state on disk so that
    state can be recovered after a processor restart.
    """

    def __init__(self, database_path="data/streamforge_state"):
        self.database_path = Path(database_path)

        self.database_path.mkdir(
            parents=True,
            exist_ok=True,
        )

        self.db = Rdict(str(self.database_path))

    def save(self, key: str, value: dict):
        """
        Save a dictionary value using a string key.
        """

        self.db[key] = json.dumps(value)

        self.db.flush()

    def get(self, key: str):
        """
        Retrieve a stored value.

        Returns None if the key doesn't exist.
        """

        value = self.db.get(key)

        if value is None:
            return None

        return json.loads(value)

    def delete(self, key: str):
        """
        Delete a stored state entry.
        """

        if key in self.db:
            del self.db[key]
            self.db.flush()

    def keys(self):
        """
        Return all stored keys.
        """

        return list(self.db.keys())

    def close(self):
        """
        Close the RocksDB database.
        """

        self.db.close()