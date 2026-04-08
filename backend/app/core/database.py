"""
Nexus Database — SQLite-backed with in-memory dict cache
=========================================================
Keeps the ``db.users[id]``, ``db.events.values()`` dict interface that all
route modules rely on, but persists every write to a SQLite file so data
survives restarts.

Startup logic:
  1. Open (or create) ``data/nexus.db``
  2. Run ``schema.sql`` to ensure tables exist
  3. If the ``users`` table is empty, import seed JSON (first run)
  4. Load all rows into the dict attributes for fast in-process reads
"""

from __future__ import annotations

import json
import logging
import os
import sqlite3
from pathlib import Path

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# JSON field mapping for the users table
# ---------------------------------------------------------------------------
_USER_JSON_FIELDS = (
    "academic",
    "interests",
    "skills",
    "goals",
    "availability",
    "events",
)

_USER_JSON_DEFAULTS: dict[str, dict] = {
    "academic": {"courses": [], "degree": "", "thesis_topic": ""},
    "interests": {"hobbies": [], "topics": [], "music": "", "sports": ""},
    "skills": {"programming": [], "languages": [], "tools": []},
    "goals": {"learning": [], "career": "", "short_term": "", "here_to": ""},
    "availability": {"preferred_times": [], "study_style": "", "timezone": ""},
    "events": {"attended": [], "interested": [], "categories": []},
}


class Database:
    """SQLite-backed database with in-memory dict cache."""

    def __init__(self) -> None:
        # In-memory dicts (backward-compat with all route files)
        self.users: dict[str, dict] = {}
        self.events: dict[str, dict] = {}
        self.connections: list[dict] = []
        self.groups: dict[str, dict] = {}
        self.messages: dict[str, list[dict]] = {}
        self.notifications: dict[str, list[dict]] = {}

        # Conversations registry (used by messages route)
        self._conversation_registry: dict[str, dict] = {}

        # SQLite connection
        self._db_path = self._resolve_db_path()
        self._db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(
            str(self._db_path),
            check_same_thread=False,
        )
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA journal_mode=WAL")
        self.conn.execute("PRAGMA foreign_keys=ON")
        self._init_schema()
        logger.info("SQLite database ready at %s", self._db_path)

    # ------------------------------------------------------------------
    # Init helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _resolve_db_path() -> Path:
        """Find the best location for nexus.db."""
        env = os.environ.get("NEXUS_DB_PATH", "")
        if env:
            return Path(env)
        # Prefer project-root/data/
        for candidate in [
            Path(os.getcwd()).parent / "data",   # run from backend/
            Path(os.getcwd()) / "data",           # run from project root
            Path("../data"),                      # relative fallback
        ]:
            if candidate.is_dir():
                return candidate / "nexus.db"
        return Path("data/nexus.db")

    def _init_schema(self) -> None:
        """Execute schema.sql to create tables if they don't exist."""
        schema_path = Path(__file__).parent / "schema.sql"
        if schema_path.exists():
            self.conn.executescript(schema_path.read_text(encoding="utf-8"))
            self.conn.commit()

    # ==================================================================
    # Seed data loading
    # ==================================================================

    def load_seed_data(self) -> None:
        """If SQLite is empty, import seed JSON. Then load into dicts."""
        count = self.conn.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        if count == 0:
            self._import_seed_json()
        self._load_from_sqlite()

    def _find_seed_dir(self) -> Path | None:
        env = os.environ.get("NEXUS_SEED_DIR", "")
        candidates = [
            *([] if not env else [Path(env)]),
            Path(os.getcwd()).parent / "data" / "seed",
            Path(os.getcwd()) / "data" / "seed",
            Path("../data/seed"),
            Path("/data/seed"),
        ]
        for p in candidates:
            if p.is_dir() and (p / "users.json").exists():
                return p
        return None

    def _import_seed_json(self) -> None:
        """Import seed JSON files into SQLite (first-run only)."""
        seed_dir = self._find_seed_dir()
        if seed_dir is None:
            logger.warning("No seed data directory found — starting with empty DB.")
            return

        logger.info("Importing seed data from %s ...", seed_dir)

        # --- Users ---
        self._import_users(seed_dir / "users.json")

        # --- Events ---
        self._import_events(seed_dir / "events.json")

        # --- Connections ---
        self._import_connections(seed_dir / "connections.json")

        # --- Groups ---
        self._import_groups(seed_dir / "groups.json")

        # --- Messages ---
        self._import_messages(seed_dir / "messages.json")

        # --- Notifications ---
        self._import_notifications(seed_dir / "notifications.json")

        self.conn.commit()
        logger.info("Seed data imported successfully.")

    def _import_users(self, path: Path) -> None:
        if not path.exists():
            return
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        users = data.values() if isinstance(data, dict) else data
        for u in users:
            self.conn.execute(
                """INSERT OR IGNORE INTO users
                   (id, name, email, password_hash, university, program,
                    semester, avatar, avatar_url, onboarding_complete, bio,
                    academic_json, interests_json, skills_json,
                    goals_json, availability_json, events_json)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    u.get("id", ""),
                    u.get("name", ""),
                    u.get("email", ""),
                    u.get("password_hash", ""),
                    u.get("university", ""),
                    u.get("program", ""),
                    u.get("semester", 0),
                    u.get("avatar", ""),
                    u.get("avatar_url", ""),
                    1 if u.get("onboarding_complete") else 0,
                    u.get("bio", ""),
                    json.dumps(u.get("academic", {})),
                    json.dumps(u.get("interests", {})),
                    json.dumps(u.get("skills", {})),
                    json.dumps(u.get("goals", {})),
                    json.dumps(u.get("availability", {})),
                    json.dumps(u.get("events", {})),
                ),
            )

    def _import_events(self, path: Path) -> None:
        if not path.exists():
            return
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        events = data.values() if isinstance(data, dict) else data
        for e in events:
            # Insert event row
            created_by = e.get("created_by", "")
            # If created_by references a user that doesn't exist, use empty
            self.conn.execute(
                """INSERT OR IGNORE INTO events
                   (id, title, description, location, start_time, end_time,
                    category, university, created_by)
                   VALUES (?,?,?,?,?,?,?,?,?)""",
                (
                    e.get("id", ""),
                    e.get("title", ""),
                    e.get("description", ""),
                    e.get("location", ""),
                    e.get("start_time", ""),
                    e.get("end_time", ""),
                    e.get("category", ""),
                    e.get("university", ""),
                    created_by,
                ),
            )
            # Insert participants
            for uid in e.get("participants", []):
                self.conn.execute(
                    "INSERT OR IGNORE INTO event_participants (event_id, user_id) VALUES (?,?)",
                    (e["id"], uid),
                )

    def _import_connections(self, path: Path) -> None:
        if not path.exists():
            return
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        conns = data if isinstance(data, list) else list(data.values())
        for c in conns:
            self.conn.execute(
                """INSERT OR IGNORE INTO connections
                   (id, requester_id, receiver_id, status, created_at)
                   VALUES (?,?,?,?,?)""",
                (
                    c.get("id", ""),
                    c.get("requester_id", ""),
                    c.get("receiver_id", ""),
                    c.get("status", "PENDING"),
                    c.get("created_at", ""),
                ),
            )

    def _import_groups(self, path: Path) -> None:
        if not path.exists():
            return
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        groups = data.values() if isinstance(data, dict) else data
        for g in groups:
            self.conn.execute(
                """INSERT OR IGNORE INTO groups_
                   (id, name, description, event_id, looking_for)
                   VALUES (?,?,?,?,?)""",
                (
                    g.get("id", ""),
                    g.get("name", ""),
                    g.get("description", ""),
                    g.get("event_id", ""),
                    g.get("looking_for", 0),
                ),
            )
            for uid in g.get("members", []):
                self.conn.execute(
                    "INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?,?)",
                    (g["id"], uid),
                )

    def _import_messages(self, path: Path) -> None:
        if not path.exists():
            return
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, dict):
            return
        for conv_id, messages in data.items():
            # Create conversation
            self.conn.execute(
                "INSERT OR IGNORE INTO conversations (id) VALUES (?)",
                (conv_id,),
            )
            # Collect unique participants from messages
            participants: set[str] = set()
            for msg in messages:
                participants.add(msg.get("sender_id", ""))
                self.conn.execute(
                    """INSERT OR IGNORE INTO messages
                       (id, conversation_id, sender_id, content, timestamp)
                       VALUES (?,?,?,?,?)""",
                    (
                        msg.get("id", ""),
                        conv_id,
                        msg.get("sender_id", ""),
                        msg.get("content", ""),
                        msg.get("timestamp", ""),
                    ),
                )
            # Add participants
            for uid in participants:
                if uid:
                    self.conn.execute(
                        "INSERT OR IGNORE INTO conversation_participants (conversation_id, user_id) VALUES (?,?)",
                        (conv_id, uid),
                    )

    def _import_notifications(self, path: Path) -> None:
        if not path.exists():
            return
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, dict):
            return
        for user_id, notifs in data.items():
            for n in notifs:
                # Remap seed field names
                msg = n.get("message", n.get("text", ""))
                ref = n.get("reference_id", n.get("link", ""))
                self.conn.execute(
                    """INSERT OR IGNORE INTO notifications
                       (id, user_id, type, message, read, timestamp, reference_id)
                       VALUES (?,?,?,?,?,?,?)""",
                    (
                        n.get("id", ""),
                        user_id,
                        n.get("type", ""),
                        msg,
                        1 if n.get("read") else 0,
                        n.get("timestamp", ""),
                        ref,
                    ),
                )

    # ==================================================================
    # Load from SQLite → in-memory dicts
    # ==================================================================

    def _load_from_sqlite(self) -> None:
        """Populate all dict attributes from SQLite tables."""
        self._load_users()
        self._load_events()
        self._load_connections()
        self._load_groups()
        self._load_messages()
        self._load_notifications()

    def _load_users(self) -> None:
        rows = self.conn.execute("SELECT * FROM users").fetchall()
        self.users = {}
        for r in rows:
            user = {
                "id": r["id"],
                "name": r["name"],
                "email": r["email"],
                "password_hash": r["password_hash"],
                "university": r["university"],
                "program": r["program"],
                "semester": r["semester"],
                "avatar": r["avatar"],
                "avatar_url": r["avatar_url"],
                "onboarding_complete": bool(r["onboarding_complete"]),
                "bio": r["bio"],
            }
            for field in _USER_JSON_FIELDS:
                col = f"{field}_json"
                raw = r[col]
                try:
                    user[field] = json.loads(raw) if raw else dict(_USER_JSON_DEFAULTS[field])
                except (json.JSONDecodeError, TypeError):
                    user[field] = dict(_USER_JSON_DEFAULTS[field])
            self.users[r["id"]] = user

    def _load_events(self) -> None:
        rows = self.conn.execute("SELECT * FROM events").fetchall()
        self.events = {}
        for r in rows:
            event = {
                "id": r["id"],
                "title": r["title"],
                "description": r["description"],
                "location": r["location"],
                "start_time": r["start_time"],
                "end_time": r["end_time"],
                "category": r["category"],
                "university": r["university"],
                "created_by": r["created_by"],
            }
            # Load participants from junction table
            parts = self.conn.execute(
                "SELECT user_id FROM event_participants WHERE event_id = ?",
                (r["id"],),
            ).fetchall()
            event["participants"] = [p["user_id"] for p in parts]
            self.events[r["id"]] = event

    def _load_connections(self) -> None:
        rows = self.conn.execute(
            "SELECT * FROM connections ORDER BY created_at DESC"
        ).fetchall()
        self.connections = [
            {
                "id": r["id"],
                "requester_id": r["requester_id"],
                "receiver_id": r["receiver_id"],
                "status": r["status"],
                "created_at": r["created_at"],
            }
            for r in rows
        ]

    def _load_groups(self) -> None:
        rows = self.conn.execute("SELECT * FROM groups_").fetchall()
        self.groups = {}
        for r in rows:
            group = {
                "id": r["id"],
                "name": r["name"],
                "description": r["description"],
                "event_id": r["event_id"],
                "looking_for": r["looking_for"],
            }
            members = self.conn.execute(
                "SELECT user_id FROM group_members WHERE group_id = ?",
                (r["id"],),
            ).fetchall()
            group["members"] = [m["user_id"] for m in members]
            self.groups[r["id"]] = group

    def _load_messages(self) -> None:
        # Load conversations into registry + messages dict
        self._conversation_registry = {}
        self.messages = {}

        convs = self.conn.execute("SELECT * FROM conversations").fetchall()
        for c in convs:
            cid = c["id"]
            # Participants
            parts = self.conn.execute(
                "SELECT user_id FROM conversation_participants WHERE conversation_id = ?",
                (cid,),
            ).fetchall()
            participant_ids = [p["user_id"] for p in parts]
            self._conversation_registry[cid] = {
                "id": cid,
                "participants": participant_ids,
            }
            # Messages
            msgs = self.conn.execute(
                "SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp",
                (cid,),
            ).fetchall()
            self.messages[cid] = [
                {
                    "id": m["id"],
                    "sender_id": m["sender_id"],
                    "content": m["content"],
                    "timestamp": m["timestamp"],
                }
                for m in msgs
            ]

    def _load_notifications(self) -> None:
        rows = self.conn.execute(
            "SELECT * FROM notifications ORDER BY timestamp DESC"
        ).fetchall()
        self.notifications = {}
        for r in rows:
            uid = r["user_id"]
            notif = {
                "id": r["id"],
                "user_id": uid,
                "type": r["type"],
                "message": r["message"],
                "read": bool(r["read"]),
                "timestamp": r["timestamp"],
                "reference_id": r["reference_id"],
            }
            self.notifications.setdefault(uid, []).append(notif)

    # ==================================================================
    # Write-through methods — update dict + SQLite
    # ==================================================================

    def save_user(self, user_id: str) -> None:
        """Persist a user dict to SQLite."""
        u = self.users.get(user_id)
        if u is None:
            return
        self.conn.execute(
            """INSERT OR REPLACE INTO users
               (id, name, email, password_hash, university, program,
                semester, avatar, avatar_url, onboarding_complete, bio,
                academic_json, interests_json, skills_json,
                goals_json, availability_json, events_json)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                u.get("id", user_id),
                u.get("name", ""),
                u.get("email", ""),
                u.get("password_hash", ""),
                u.get("university", ""),
                u.get("program", ""),
                u.get("semester", 0),
                u.get("avatar", ""),
                u.get("avatar_url", ""),
                1 if u.get("onboarding_complete") else 0,
                u.get("bio", ""),
                json.dumps(u.get("academic", {})),
                json.dumps(u.get("interests", {})),
                json.dumps(u.get("skills", {})),
                json.dumps(u.get("goals", {})),
                json.dumps(u.get("availability", {})),
                json.dumps(u.get("events", {})),
            ),
        )
        self.conn.commit()

    def save_event(self, event_id: str) -> None:
        """Persist an event dict + its participants to SQLite."""
        e = self.events.get(event_id)
        if e is None:
            return
        self.conn.execute(
            """INSERT OR REPLACE INTO events
               (id, title, description, location, start_time, end_time,
                category, university, created_by)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            (
                e.get("id", event_id),
                e.get("title", ""),
                e.get("description", ""),
                e.get("location", ""),
                e.get("start_time", ""),
                e.get("end_time", ""),
                e.get("category", ""),
                e.get("university", ""),
                e.get("created_by", ""),
            ),
        )
        # Re-sync participants
        self.conn.execute(
            "DELETE FROM event_participants WHERE event_id = ?", (event_id,)
        )
        for uid in e.get("participants", []):
            self.conn.execute(
                "INSERT OR IGNORE INTO event_participants (event_id, user_id) VALUES (?,?)",
                (event_id, uid),
            )
        self.conn.commit()

    def save_connection(self, connection: dict) -> None:
        """Persist a connection dict to SQLite."""
        self.conn.execute(
            """INSERT OR REPLACE INTO connections
               (id, requester_id, receiver_id, status, created_at)
               VALUES (?,?,?,?,?)""",
            (
                connection.get("id", ""),
                connection.get("requester_id", ""),
                connection.get("receiver_id", ""),
                connection.get("status", "PENDING"),
                connection.get("created_at", ""),
            ),
        )
        self.conn.commit()

    def save_group(self, group_id: str) -> None:
        """Persist a group dict + its members to SQLite."""
        g = self.groups.get(group_id)
        if g is None:
            return
        self.conn.execute(
            """INSERT OR REPLACE INTO groups_
               (id, name, description, event_id, looking_for)
               VALUES (?,?,?,?,?)""",
            (
                g.get("id", group_id),
                g.get("name", ""),
                g.get("description", ""),
                g.get("event_id", ""),
                g.get("looking_for", 0),
            ),
        )
        self.conn.execute(
            "DELETE FROM group_members WHERE group_id = ?", (group_id,)
        )
        for uid in g.get("members", []):
            self.conn.execute(
                "INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?,?)",
                (group_id, uid),
            )
        self.conn.commit()

    def save_conversation(self, conv_id: str) -> None:
        """Persist a conversation + its participants to SQLite."""
        reg = self._conversation_registry.get(conv_id)
        if reg is None:
            return
        self.conn.execute(
            "INSERT OR IGNORE INTO conversations (id) VALUES (?)",
            (conv_id,),
        )
        for uid in reg.get("participants", []):
            self.conn.execute(
                "INSERT OR IGNORE INTO conversation_participants (conversation_id, user_id) VALUES (?,?)",
                (conv_id, uid),
            )
        self.conn.commit()

    def save_message(self, conv_id: str, message: dict) -> None:
        """Persist a single message to SQLite."""
        self.conn.execute(
            """INSERT OR IGNORE INTO messages
               (id, conversation_id, sender_id, content, timestamp)
               VALUES (?,?,?,?,?)""",
            (
                message.get("id", ""),
                conv_id,
                message.get("sender_id", ""),
                message.get("content", ""),
                message.get("timestamp", ""),
            ),
        )
        self.conn.commit()

    def save_notification(self, notification: dict) -> None:
        """Persist a single notification to SQLite."""
        self.conn.execute(
            """INSERT OR REPLACE INTO notifications
               (id, user_id, type, message, read, timestamp, reference_id)
               VALUES (?,?,?,?,?,?,?)""",
            (
                notification.get("id", ""),
                notification.get("user_id", ""),
                notification.get("type", ""),
                notification.get("message", ""),
                1 if notification.get("read") else 0,
                notification.get("timestamp", ""),
                notification.get("reference_id", ""),
            ),
        )
        self.conn.commit()


# Global singleton
db = Database()
