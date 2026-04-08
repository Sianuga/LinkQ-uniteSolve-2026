import json
import os
from pathlib import Path


class Database:
    """Simple in-memory database for MVP. Data is lost on restart unless seed files exist."""

    def __init__(self) -> None:
        self.users: dict[str, dict] = {}          # keyed by user_id
        self.events: dict[str, dict] = {}          # keyed by event_id
        self.connections: list[dict] = []
        self.groups: dict[str, dict] = {}          # keyed by group_id
        self.messages: dict[str, list[dict]] = {}  # keyed by conversation_id
        self.notifications: dict[str, list[dict]] = {}  # keyed by user_id

    def load_seed_data(self) -> None:
        """Load seed data from data/seed/*.json if files exist."""
        seed_dir = Path(os.getcwd()).parent / "data" / "seed"
        if not seed_dir.exists():
            # Also try relative to project root
            seed_dir = Path(os.getcwd()).parent / "data" / "seed"
            if not seed_dir.exists():
                # Try from backend dir directly
                seed_dir = Path("../data/seed")
                if not seed_dir.exists():
                    return

        mapping = {
            "users.json": "users",
            "events.json": "events",
            "connections.json": "connections",
            "groups.json": "groups",
            "messages.json": "messages",
            "notifications.json": "notifications",
        }

        for filename, attr in mapping.items():
            filepath = seed_dir / filename
            if filepath.exists():
                with open(filepath, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list) and attr == "connections":
                        self.connections = data
                    elif isinstance(data, dict):
                        setattr(self, attr, data)
                    elif isinstance(data, list):
                        # Convert list of dicts with "id" key into dict keyed by id
                        converted = {}
                        for item in data:
                            key = item.get("id", str(len(converted)))
                            converted[key] = item
                        setattr(self, attr, converted)


# Global singleton
db = Database()
