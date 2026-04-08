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
        env_seed = os.environ.get("NEXUS_SEED_DIR", "")
        candidates = [
            *([] if not env_seed else [Path(env_seed)]),   # explicit env var (only if set)
            Path(os.getcwd()).parent / "data" / "seed",    # run from backend/
            Path(os.getcwd()) / "data" / "seed",           # run from project root
            Path("../data/seed"),                          # relative fallback
            Path("/data/seed"),                            # Docker mount
        ]
        seed_dir = None
        for p in candidates:
            if p.is_dir() and (p / "users.json").exists():
                seed_dir = p
                break
        if seed_dir is None:
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
                        # Notifications: remap field names from seed format to schema format
                        if attr == "notifications":
                            for uid, nlist in data.items():
                                for n in nlist:
                                    n.setdefault("user_id", uid)
                                    if "text" in n and "message" not in n:
                                        n["message"] = n.pop("text")
                                    if "link" in n and "reference_id" not in n:
                                        n["reference_id"] = n.pop("link")
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
