# LinkQ Backend Implementation Plan

> Full implementation roadmap: SQLite persistence, ChromaDB vector store, seed data, missing endpoints, and frontend wiring.
> Written 2026-04-08. Based on current codebase audit.

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Phase 1 — FastAPI App Entry Point (`main.py`)](#2-phase-1--fastapi-app-entry-point-mainpy)
3. [Phase 2 — SQLite Database Layer](#3-phase-2--sqlite-database-layer)
4. [Phase 3 — Embedding Service Bridge](#4-phase-3--embedding-service-bridge)
5. [Phase 4 — ChromaDB Full Integration](#5-phase-4--chromadb-full-integration)
6. [Phase 5 — Seed Data Generation](#6-phase-5--seed-data-generation)
7. [Phase 6 — Missing Endpoints & Bug Fixes](#7-phase-6--missing-endpoints--bug-fixes)
8. [Phase 7 — Testing](#8-phase-7--testing)
9. [Frontend Connection Guide](#9-frontend-connection-guide)
10. [Deployment Notes](#10-deployment-notes)

---

## 1. Current State Audit

### What Exists and Works

| Component | File(s) | Status |
|-----------|---------|--------|
| **Config** | `app/core/config.py` | Done — Settings via pydantic-settings, env prefix `LINKQ_` |
| **Security/JWT** | `app/core/security.py` | Done — bcrypt hashing, JWT encode/decode, `get_current_user` dependency |
| **Pydantic Schemas** | `app/models/schemas.py` (284 lines) | Done — 30+ models covering all entities |
| **Auth Routes** | `app/routes/auth.py` (322 lines) | Done — register, login, /me, PATCH /me, /oauth, /onboarding |
| **Event Routes** | `app/routes/events.py` (223 lines) | Done — CRUD, join, participants, matches |
| **Connection Routes** | `app/routes/connections.py` (118 lines) | Done — send, list, accept/reject + notifications |
| **Group Routes** | `app/routes/groups.py` (166 lines) | Done — create, join, list by event |
| **Message Routes** | `app/routes/messages.py` (160 lines) | Done — conversations, message history, send |
| **Notification Routes** | `app/routes/notifications.py` (65 lines) | Done — list, mark read |
| **User Routes** | `app/routes/users.py` (61 lines) | Done — get profile, simple compare |
| **Simple Matching** | `app/routes/match.py` (222 lines) | Done — Jaccard-only fallback matching |
| **Enhanced Matching Routes** | `app/routes/matching.py` (259 lines) | Done — ChromaDB+ML matching endpoints |
| **Matching Engine Service** | `app/services/matching.py` (753 lines) | Done — Full segmented embedding pipeline, cosine+Jaccard, context-aware weights |
| **`__init__.py` files** | All packages | Done — all 5 package dirs have empty init files |

### What Is Missing / Broken

| Issue | Severity | Details |
|-------|----------|---------|
| **No `main.py`** | **CRITICAL** | No FastAPI app instance, no router mounting, server cannot start |
| **No `app/services/embedding.py`** | **HIGH** | `auth.py` lines 239 and 314 import `from app.services.embedding import embed_user_segments` — this module does not exist. Currently silently caught by `except ImportError`. |
| **In-memory database** | **HIGH** | `app/core/database.py` uses Python dicts. All data lost on restart. No SQLite. |
| **No seed data** | **HIGH** | `data/seed/` is empty. No users.json, events.json, etc. |
| **No seed generation script** | **MEDIUM** | `scripts/` is empty |
| **Duplicate matching routes** | **MEDIUM** | Both `routes/match.py` and `routes/matching.py` handle `POST /match/{match_id}`. Also both `routes/users.py` and `routes/matching.py` handle `GET /users/{id}/compare/{target_id}`. Need to decide which wins. |
| **`get_current_user` return type mismatch** | **MEDIUM** | `security.py:get_current_user` returns `dict` (the full user object). But `connections.py` and `groups.py` use `user_id: str = Depends(get_current_user)` — they receive a dict, not a string. Will crash at runtime. `events.py` and `auth.py` correctly use `current_user: dict = Depends(get_current_user)`. |
| **Conversation creation missing** | **LOW** | `messages.py:send_message` requires conversation to exist but there's no endpoint to create one. Need `POST /conversations` or auto-create on first message. |
| **`requirements.txt` missing `aiosqlite`** | **LOW** | Will need SQLite async support for the migration |

---

## 2. Phase 1 — FastAPI App Entry Point (`main.py`)

**Goal:** Create the entry point that initializes FastAPI, mounts all routers, loads seed data, and configures CORS.

### Create `backend/app/main.py`

```python
"""LinkQ API — entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: load seed data + init embedding service. Shutdown: cleanup."""
    # Load seed data from JSON files (if they exist)
    db.load_seed_data()

    # Pre-warm the embedding service (loads model + ChromaDB)
    try:
        from app.services.matching import get_embedding_service
        get_embedding_service()
    except Exception:
        pass  # ML libraries optional for dev

    yield
    # Shutdown — nothing to clean up for MVP


app = FastAPI(
    title="LinkQ API",
    description="Event-centric student networking platform",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS — allow the React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Mount routers ---
from app.routes.auth import router as auth_router
from app.routes.events import router as events_router
from app.routes.connections import router as connections_router
from app.routes.groups import router as groups_router
from app.routes.messages import router as messages_router
from app.routes.notifications import router as notifications_router
from app.routes.users import router as users_router
from app.routes.matching import router as matching_router

app.include_router(auth_router)
app.include_router(events_router)
app.include_router(connections_router)
app.include_router(groups_router)
app.include_router(messages_router)
app.include_router(notifications_router)
app.include_router(users_router)
app.include_router(matching_router)

# Health check
@app.get("/health")
def health():
    return {"status": "ok", "users": len(db.users), "events": len(db.events)}
```

**Run with:**
```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Router Conflict Resolution

**Problem:** `routes/match.py` and `routes/matching.py` both define `POST /match/{match_id}`. Similarly, `routes/users.py` and `routes/matching.py` both define `GET /users/{id}/compare/{target_id}`.

**Decision:** Use `routes/matching.py` (enhanced ML-powered) as the primary. Do NOT mount `routes/match.py`. The simple Jaccard matching in `match.py` is already available as a fallback inside `services/matching.py` when ML libraries are unavailable.

For the user compare route: the `routes/matching.py` version is superior (per-segment breakdown, ChromaDB-backed). Mount `matching_router` AFTER `users_router` so that `matching.py`'s `/users/{id}/compare/{target_id}` overrides the simpler one in `users.py`. Or better: **remove the `/compare/` route from `routes/users.py`** to avoid ambiguity.

### Actions

1. Create `backend/app/main.py` with the code above
2. Remove `compare_users` endpoint from `routes/users.py` (lines 28-60) — `routes/matching.py` handles it better
3. Do NOT include `routes/match.py` in the router mount — keep the file for reference but don't mount it

---

## 3. Phase 2 — SQLite Database Layer

**Goal:** Replace the in-memory `dict`-based database with SQLite for persistent storage. Use `aiosqlite` for async compatibility with FastAPI.

### 3.1 Dependencies to Add

Add to `backend/requirements.txt`:
```
aiosqlite==0.20.0
databases==0.9.0
sqlalchemy==2.0.30
```

> **Why SQLAlchemy?** We'll use it only for schema definition (DDL) and migrations, not as an ORM. All queries will be raw SQL via `databases` (async) or `aiosqlite` directly. This keeps it lightweight while giving us proper schema management.
>
> **Alternative (simpler, recommended for MVP):** Skip SQLAlchemy entirely. Use raw `aiosqlite` with a `schema.sql` file. This is simpler and matches the MVP spirit.

### 3.2 Database Schema (`backend/app/core/schema.sql`)

```sql
-- LinkQ SQLite Schema
-- Run once to initialize the database.

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL DEFAULT '',
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    university      TEXT NOT NULL DEFAULT '',
    program         TEXT NOT NULL DEFAULT '',
    semester        INTEGER NOT NULL DEFAULT 0,
    avatar          TEXT NOT NULL DEFAULT '',
    avatar_url      TEXT NOT NULL DEFAULT '',
    onboarding_complete INTEGER NOT NULL DEFAULT 0,  -- 0=false, 1=true
    bio             TEXT NOT NULL DEFAULT '',
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),

    -- Nested JSON blobs (denormalized for MVP simplicity)
    -- These match the Pydantic sub-models exactly.
    academic_json       TEXT NOT NULL DEFAULT '{"courses":[],"degree":"","thesis_topic":""}',
    interests_json      TEXT NOT NULL DEFAULT '{"hobbies":[],"topics":[],"music":"","sports":""}',
    skills_json         TEXT NOT NULL DEFAULT '{"programming":[],"languages":[],"tools":[]}',
    goals_json          TEXT NOT NULL DEFAULT '{"learning":[],"career":"","short_term":"","here_to":""}',
    availability_json   TEXT NOT NULL DEFAULT '{"preferred_times":[],"study_style":"","timezone":""}',
    events_json         TEXT NOT NULL DEFAULT '{"attended":[],"interested":[],"categories":[]}'
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    location        TEXT NOT NULL DEFAULT '',
    start_time      TEXT NOT NULL,
    end_time        TEXT NOT NULL,
    category        TEXT NOT NULL DEFAULT '',
    created_by      TEXT NOT NULL REFERENCES users(id),
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_time);

-- ============================================================
-- EVENT_PARTICIPANTS (join table)
-- ============================================================
CREATE TABLE IF NOT EXISTS event_participants (
    event_id    TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at   TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (event_id, user_id)
);

-- ============================================================
-- CONNECTIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS connections (
    id              TEXT PRIMARY KEY,
    requester_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','ACCEPTED','REJECTED')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(requester_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_connections_requester ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON connections(receiver_id);

-- ============================================================
-- GROUPS
-- ============================================================
CREATE TABLE IF NOT EXISTS groups_ (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    event_id        TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    looking_for     INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Note: table named "groups_" because "groups" is reserved in some SQL dialects.

-- ============================================================
-- GROUP_MEMBERS (join table)
-- ============================================================
CREATE TABLE IF NOT EXISTS group_members (
    group_id    TEXT NOT NULL REFERENCES groups_(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at   TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (group_id, user_id)
);

-- ============================================================
-- CONVERSATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
    id              TEXT PRIMARY KEY,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- CONVERSATION_PARTICIPANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, user_id)
);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id                  TEXT PRIMARY KEY,
    conversation_id     TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content             TEXT NOT NULL,
    timestamp           TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, timestamp);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            TEXT NOT NULL,
    message         TEXT NOT NULL DEFAULT '',
    read            INTEGER NOT NULL DEFAULT 0,  -- 0=false, 1=true
    timestamp       TEXT NOT NULL DEFAULT (datetime('now')),
    reference_id    TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, timestamp);
```

### 3.3 Design Decision: JSON Columns vs. Normalized Tables

**Choice: JSON blobs for nested user data (academic, interests, skills, goals, availability, events).**

Rationale:
- The nested data structures are always read/written as a whole unit (never queried individually in SQL)
- ChromaDB handles all the similarity/search queries — SQLite is just persistence
- Normalized tables would mean 6+ extra tables and complex JOINs for every user fetch
- SQLite supports `json_extract()` if we ever need to query inside these fields
- Matches the existing dict-based code with minimal refactoring

**What stays relational:** events, participants, connections, groups, group_members, messages, conversations, notifications — these have actual relational queries (JOINs, filters, pagination).

### 3.4 New Database Module (`backend/app/core/database.py` — Rewrite)

Replace the current in-memory database with an async SQLite wrapper.

```python
"""
LinkQ Database — async SQLite persistence layer.

Usage:
    from app.core.database import get_db

    @router.get("/users/{id}")
    async def get_user(id: str, db: Database = Depends(get_db)):
        return await db.get_user(id)
"""

import json
import aiosqlite
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "linkq.db"
SCHEMA_PATH = Path(__file__).resolve().parent / "schema.sql"

class Database:
    def __init__(self, conn: aiosqlite.Connection):
        self.conn = conn
        self.conn.row_factory = aiosqlite.Row

    # ---- Users ----

    async def get_user(self, user_id: str) -> dict | None:
        cursor = await self.conn.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = await cursor.fetchone()
        if row is None:
            return None
        return self._row_to_user(row)

    async def get_user_by_email(self, email: str) -> dict | None:
        cursor = await self.conn.execute("SELECT * FROM users WHERE email = ?", (email,))
        row = await cursor.fetchone()
        if row is None:
            return None
        return self._row_to_user(row)

    async def create_user(self, user: dict) -> None:
        await self.conn.execute(
            """INSERT INTO users (id, name, email, password_hash, university, program,
               semester, avatar, avatar_url, onboarding_complete, bio,
               academic_json, interests_json, skills_json, goals_json,
               availability_json, events_json)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                user["id"], user["name"], user["email"], user["password_hash"],
                user.get("university", ""), user.get("program", ""),
                user.get("semester", 0), user.get("avatar", ""),
                user.get("avatar_url", ""), int(user.get("onboarding_complete", False)),
                user.get("bio", ""),
                json.dumps(user.get("academic", {})),
                json.dumps(user.get("interests", {})),
                json.dumps(user.get("skills", {})),
                json.dumps(user.get("goals", {})),
                json.dumps(user.get("availability", {})),
                json.dumps(user.get("events", {})),
            ),
        )
        await self.conn.commit()

    async def update_user(self, user_id: str, updates: dict) -> None:
        """Partial update — only write the fields present in `updates`."""
        # Separate flat fields from JSON blob fields
        json_fields = {"academic", "interests", "skills", "goals", "availability", "events"}
        set_clauses = []
        params = []

        for key, value in updates.items():
            if key in json_fields:
                col = f"{key}_json"
                # Deep-merge: read current, merge, write back
                cursor = await self.conn.execute(
                    f"SELECT {col} FROM users WHERE id = ?", (user_id,)
                )
                row = await cursor.fetchone()
                if row:
                    current = json.loads(row[0])
                    current.update(value if isinstance(value, dict) else {})
                    set_clauses.append(f"{col} = ?")
                    params.append(json.dumps(current))
            elif key == "onboarding_complete":
                set_clauses.append("onboarding_complete = ?")
                params.append(int(value))
            elif key in ("name", "university", "program", "semester", "avatar",
                         "avatar_url", "bio"):
                set_clauses.append(f"{key} = ?")
                params.append(value)

        if set_clauses:
            params.append(user_id)
            sql = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = ?"
            await self.conn.execute(sql, params)
            await self.conn.commit()

    # ---- Events ----

    async def get_event(self, event_id: str) -> dict | None:
        cursor = await self.conn.execute("SELECT * FROM events WHERE id = ?", (event_id,))
        row = await cursor.fetchone()
        if row is None:
            return None
        event = dict(row)
        # Attach participants
        cursor2 = await self.conn.execute(
            "SELECT user_id FROM event_participants WHERE event_id = ?", (event_id,)
        )
        rows = await cursor2.fetchall()
        event["participants"] = [r["user_id"] for r in rows]
        return event

    async def list_events(self, university=None, category=None, title=None,
                          limit=50, offset=0) -> list[dict]:
        sql = "SELECT * FROM events WHERE 1=1"
        params: list[Any] = []
        if university:
            sql += " AND LOWER(university) = LOWER(?)"  # Note: events don't have university col
            # Actually events may not have university — filter via created_by user's university
            # For MVP, skip this filter or add a university column to events
        if category:
            sql += " AND LOWER(category) = LOWER(?)"
            params.append(category)
        if title:
            sql += " AND LOWER(title) LIKE ?"
            params.append(f"%{title.lower()}%")
        sql += " ORDER BY start_time DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        cursor = await self.conn.execute(sql, params)
        rows = await cursor.fetchall()

        events = []
        for row in rows:
            event = dict(row)
            cursor2 = await self.conn.execute(
                "SELECT user_id FROM event_participants WHERE event_id = ?", (event["id"],)
            )
            prows = await cursor2.fetchall()
            event["participants"] = [r["user_id"] for r in prows]
            events.append(event)
        return events

    async def create_event(self, event: dict) -> None:
        await self.conn.execute(
            """INSERT INTO events (id, title, description, location, start_time,
               end_time, category, created_by)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (event["id"], event["title"], event.get("description", ""),
             event.get("location", ""), event["start_time"], event["end_time"],
             event.get("category", ""), event["created_by"]),
        )
        # Add creator as first participant
        await self.conn.execute(
            "INSERT INTO event_participants (event_id, user_id) VALUES (?, ?)",
            (event["id"], event["created_by"]),
        )
        await self.conn.commit()

    async def join_event(self, event_id: str, user_id: str) -> None:
        await self.conn.execute(
            "INSERT OR IGNORE INTO event_participants (event_id, user_id) VALUES (?, ?)",
            (event_id, user_id),
        )
        await self.conn.commit()

    async def get_event_participants(self, event_id: str, limit=50, offset=0) -> list[str]:
        cursor = await self.conn.execute(
            "SELECT user_id FROM event_participants WHERE event_id = ? LIMIT ? OFFSET ?",
            (event_id, limit, offset),
        )
        rows = await cursor.fetchall()
        return [r["user_id"] for r in rows]

    # ---- Connections ----

    async def create_connection(self, conn_data: dict) -> None:
        await self.conn.execute(
            """INSERT INTO connections (id, requester_id, receiver_id, status)
               VALUES (?, ?, ?, ?)""",
            (conn_data["id"], conn_data["requester_id"],
             conn_data["receiver_id"], conn_data.get("status", "PENDING")),
        )
        await self.conn.commit()

    async def get_connection(self, conn_id: str) -> dict | None:
        cursor = await self.conn.execute("SELECT * FROM connections WHERE id = ?", (conn_id,))
        row = await cursor.fetchone()
        return dict(row) if row else None

    async def update_connection_status(self, conn_id: str, status: str) -> None:
        await self.conn.execute(
            "UPDATE connections SET status = ? WHERE id = ?", (status, conn_id)
        )
        await self.conn.commit()

    async def list_connections(self, user_id: str, status=None, limit=50, offset=0) -> list[dict]:
        sql = "SELECT * FROM connections WHERE (requester_id = ? OR receiver_id = ?)"
        params: list[Any] = [user_id, user_id]
        if status:
            sql += " AND status = ?"
            params.append(status)
        sql += " ORDER BY created_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        cursor = await self.conn.execute(sql, params)
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

    async def find_existing_connection(self, user_a: str, user_b: str) -> dict | None:
        cursor = await self.conn.execute(
            """SELECT * FROM connections
               WHERE (requester_id = ? AND receiver_id = ?)
                  OR (requester_id = ? AND receiver_id = ?)""",
            (user_a, user_b, user_b, user_a),
        )
        row = await cursor.fetchone()
        return dict(row) if row else None

    # ---- Groups ----

    async def create_group(self, group: dict) -> None:
        await self.conn.execute(
            "INSERT INTO groups_ (id, name, description, event_id, looking_for) VALUES (?, ?, ?, ?, ?)",
            (group["id"], group["name"], group.get("description", ""),
             group["event_id"], group.get("looking_for", 0)),
        )
        # Add creator as first member
        if group.get("members"):
            for uid in group["members"]:
                await self.conn.execute(
                    "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)",
                    (group["id"], uid),
                )
        await self.conn.commit()

    async def get_group(self, group_id: str) -> dict | None:
        cursor = await self.conn.execute("SELECT * FROM groups_ WHERE id = ?", (group_id,))
        row = await cursor.fetchone()
        if row is None:
            return None
        group = dict(row)
        cursor2 = await self.conn.execute(
            "SELECT user_id FROM group_members WHERE group_id = ?", (group_id,)
        )
        mrows = await cursor2.fetchall()
        group["members"] = [r["user_id"] for r in mrows]
        return group

    async def join_group(self, group_id: str, user_id: str) -> None:
        await self.conn.execute(
            "INSERT INTO group_members (group_id, user_id) VALUES (?, ?)",
            (group_id, user_id),
        )
        await self.conn.commit()

    async def list_groups_for_event(self, event_id: str) -> list[dict]:
        cursor = await self.conn.execute(
            "SELECT * FROM groups_ WHERE event_id = ?", (event_id,)
        )
        rows = await cursor.fetchall()
        results = []
        for row in rows:
            group = dict(row)
            cursor2 = await self.conn.execute(
                "SELECT COUNT(*) as cnt FROM group_members WHERE group_id = ?", (group["id"],)
            )
            count_row = await cursor2.fetchone()
            group["member_count"] = count_row["cnt"] if count_row else 0
            results.append(group)
        return results

    # ---- Messages / Conversations ----

    async def create_conversation(self, conv_id: str, participant_ids: list[str]) -> None:
        await self.conn.execute(
            "INSERT INTO conversations (id) VALUES (?)", (conv_id,)
        )
        for uid in participant_ids:
            await self.conn.execute(
                "INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)",
                (conv_id, uid),
            )
        await self.conn.commit()

    async def get_conversation(self, conv_id: str) -> dict | None:
        cursor = await self.conn.execute(
            "SELECT * FROM conversations WHERE id = ?", (conv_id,)
        )
        row = await cursor.fetchone()
        if row is None:
            return None
        conv = dict(row)
        cursor2 = await self.conn.execute(
            "SELECT user_id FROM conversation_participants WHERE conversation_id = ?", (conv_id,)
        )
        prows = await cursor2.fetchall()
        conv["participants"] = [r["user_id"] for r in prows]
        return conv

    async def list_conversations(self, user_id: str, limit=50, offset=0) -> list[dict]:
        cursor = await self.conn.execute(
            """SELECT c.id, c.created_at
               FROM conversations c
               JOIN conversation_participants cp ON c.id = cp.conversation_id
               WHERE cp.user_id = ?
               ORDER BY c.created_at DESC
               LIMIT ? OFFSET ?""",
            (user_id, limit, offset),
        )
        rows = await cursor.fetchall()
        results = []
        for row in rows:
            conv = dict(row)
            # Get other participants
            cursor2 = await self.conn.execute(
                "SELECT user_id FROM conversation_participants WHERE conversation_id = ? AND user_id != ?",
                (conv["id"], user_id),
            )
            others = await cursor2.fetchall()
            conv["other_user_ids"] = [r["user_id"] for r in others]
            # Get last message
            cursor3 = await self.conn.execute(
                "SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp DESC LIMIT 1",
                (conv["id"],),
            )
            last_msg = await cursor3.fetchone()
            conv["last_message"] = dict(last_msg) if last_msg else None
            results.append(conv)
        return results

    async def send_message(self, msg: dict) -> None:
        await self.conn.execute(
            "INSERT INTO messages (id, conversation_id, sender_id, content) VALUES (?, ?, ?, ?)",
            (msg["id"], msg["conversation_id"], msg["sender_id"], msg["content"]),
        )
        await self.conn.commit()

    async def get_messages(self, conv_id: str, limit=50, offset=0) -> list[dict]:
        cursor = await self.conn.execute(
            "SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC LIMIT ? OFFSET ?",
            (conv_id, limit, offset),
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

    # ---- Notifications ----

    async def create_notification(self, notif: dict) -> None:
        await self.conn.execute(
            """INSERT INTO notifications (id, user_id, type, message, reference_id)
               VALUES (?, ?, ?, ?, ?)""",
            (notif["id"], notif["user_id"], notif["type"],
             notif.get("message", ""), notif.get("reference_id", "")),
        )
        await self.conn.commit()

    async def list_notifications(self, user_id: str, limit=50, offset=0) -> list[dict]:
        cursor = await self.conn.execute(
            """SELECT * FROM notifications WHERE user_id = ?
               ORDER BY timestamp DESC LIMIT ? OFFSET ?""",
            (user_id, limit, offset),
        )
        rows = await cursor.fetchall()
        return [dict(r) for r in rows]

    async def mark_notification_read(self, notif_id: str, user_id: str) -> dict | None:
        cursor = await self.conn.execute(
            "SELECT * FROM notifications WHERE id = ? AND user_id = ?", (notif_id, user_id)
        )
        row = await cursor.fetchone()
        if row is None:
            return None
        await self.conn.execute("UPDATE notifications SET read = 1 WHERE id = ?", (notif_id,))
        await self.conn.commit()
        notif = dict(row)
        notif["read"] = True
        return notif

    # ---- Helpers ----

    @staticmethod
    def _row_to_user(row) -> dict:
        """Convert a SQLite row to the dict format expected by routes and matching engine."""
        user = dict(row)
        # Parse JSON blobs back into dicts
        for field in ("academic", "interests", "skills", "goals", "availability", "events"):
            json_col = f"{field}_json"
            if json_col in user:
                user[field] = json.loads(user[json_col])
                del user[json_col]
        # Convert onboarding_complete from int to bool
        user["onboarding_complete"] = bool(user.get("onboarding_complete", 0))
        return user


# ---------------------------------------------------------------------------
# Database lifecycle — used as a FastAPI dependency
# ---------------------------------------------------------------------------

async def init_db() -> None:
    """Create tables if they don't exist."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    async with aiosqlite.connect(str(DB_PATH)) as conn:
        schema = SCHEMA_PATH.read_text(encoding="utf-8")
        await conn.executescript(schema)


async def get_db():
    """FastAPI dependency — yields a Database instance per request."""
    async with aiosqlite.connect(str(DB_PATH)) as conn:
        conn.row_factory = aiosqlite.Row
        yield Database(conn)
```

### 3.5 Migration Strategy (In-Memory → SQLite)

Since the app has no production data, this is a clean cutover:

1. Create `schema.sql` as shown above
2. Rewrite `database.py` as shown above
3. Update `main.py` lifespan to call `await init_db()` at startup
4. Update every route to:
   - Change `from app.core.database import db` → `from app.core.database import Database, get_db`
   - Add `db: Database = Depends(get_db)` parameter to every endpoint
   - Change sync dict operations to `await db.xxx()` calls
   - Change `def endpoint()` to `async def endpoint()` where needed
5. Update `get_current_user` in `security.py` to accept db dependency
6. Keep `load_seed_data()` method on `Database` class for initial data seeding

### 3.6 Route Migration Checklist

Every route function must be updated. Here's the pattern:

**Before (in-memory):**
```python
@router.get("/{user_id}")
def get_user(user_id: str):
    user = db.users.get(user_id)
    if not user:
        raise HTTPException(404)
    return UserProfile(**user)
```

**After (SQLite):**
```python
@router.get("/{user_id}")
async def get_user(user_id: str, db: Database = Depends(get_db)):
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(404)
    return UserProfile(**user)
```

Files to update (in order of dependency):
1. `core/security.py` — `get_current_user` needs db access
2. `routes/auth.py` — register, login, /me, PATCH /me, /oauth, /onboarding
3. `routes/events.py` — all 6 endpoints
4. `routes/connections.py` — all 3 endpoints
5. `routes/groups.py` — all 4 endpoints
6. `routes/messages.py` — all 3 endpoints
7. `routes/notifications.py` — all 2 endpoints
8. `routes/users.py` — get_user (compare is removed)
9. `routes/matching.py` — both endpoints
10. `services/matching.py` — all functions that take `db` parameter

### 3.7 `get_current_user` Dependency Chain

The trickiest part: `get_current_user` currently imports `db` directly. With SQLite it needs to be an async dependency that itself depends on `get_db`.

```python
# security.py — updated
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Database = Depends(get_db),
) -> dict:
    payload = verify_token(credentials.credentials)
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(401, "Token missing subject claim")
    user = await db.get_user(user_id)
    if user is None:
        raise HTTPException(401, "User not found")
    return user
```

Then routes that need both `current_user` and `db`:
```python
async def some_endpoint(
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    ...
```

FastAPI resolves `get_db` once per request even if both `get_current_user` and the route depend on it (dependency caching).

---

## 4. Phase 3 — Embedding Service Bridge

**Goal:** Create the missing `app/services/embedding.py` that `auth.py` tries to import.

### Problem

`auth.py` lines 239 and 314 do:
```python
from app.services.embedding import embed_user_segments
```

This module does not exist. Currently silently caught by `except ImportError`. The actual embedding logic lives in `services/matching.py` as `ensure_user_embedded()`.

### Solution: Create `backend/app/services/embedding.py`

```python
"""
Thin bridge to the matching engine's embedding functionality.

This module exists because auth.py imports `embed_user_segments` from here.
It delegates to the real implementation in services/matching.py.
"""

from app.services.matching import ensure_user_embedded


def embed_user_segments(user: dict, segments: list[str] | None = None) -> None:
    """Embed (or re-embed) a user's profile into ChromaDB.

    Args:
        user: Full user dict with nested academic, interests, etc.
        segments: Optional list of segment names that changed. Currently
                  the matching engine re-embeds all semantic segments regardless,
                  but this parameter is accepted for API compatibility and
                  future delta-update optimization.
    """
    user_id = user.get("id", "")
    if not user_id:
        return
    ensure_user_embedded(user_id, user)
```

This is a 1-file fix. After this, the `except ImportError` blocks in `auth.py` will no longer fire, and profile updates + onboarding will actually trigger ChromaDB embedding.

---

## 5. Phase 4 — ChromaDB Full Integration

### Current State

The ChromaDB integration in `services/matching.py` is **already complete** and well-implemented:

- `EmbeddingService` class handles model loading + ChromaDB client + collection
- Text templating converts user profiles to natural language
- `embed_user()` generates and upserts 4 semantic embeddings per user
- `cosine_similarity_segment()` queries ChromaDB for similarity
- Graceful fallback to random scores when ML libraries aren't installed
- Context-aware weight presets by event category

### What Needs to Happen

1. **Install dependencies.** Run `pip install -r requirements.txt` to get `chromadb==0.5.0` and `sentence-transformers==3.0.0`. The sentence-transformers model (`all-MiniLM-L6-v2`) downloads automatically on first use (~80MB).

2. **ChromaDB persistence directory.** Config says `./data/chroma`. Relative to the `backend/` directory, this means `backend/data/chroma/`. Ensure this directory is created at startup. Add to `.gitignore`:
   ```
   backend/data/chroma/
   ```

3. **Wire embedding into the SQLite migration.** When routes switch to SQLite, the matching engine still needs user dicts in the same format. The `_row_to_user()` method in the new `database.py` produces the same dict shape, so `services/matching.py` works unchanged.

4. **Embed seed users at startup.** After loading seed data into SQLite, iterate all users and call `ensure_user_embedded(user_id, user_dict)`. This populates ChromaDB with initial embeddings. Do this in the lifespan handler:

   ```python
   # In main.py lifespan, after seed data load:
   from app.services.matching import ensure_user_embedded

   async with aiosqlite.connect(str(DB_PATH)) as conn:
       conn.row_factory = aiosqlite.Row
       db = Database(conn)
       # Embed all users (skip if ChromaDB already populated)
       # This takes ~1-2 seconds for 100 users
       users = await db.list_all_users()  # add this method
       for user in users:
           ensure_user_embedded(user["id"], user)
   ```

5. **Delta re-embedding on profile update.** Already handled: `PATCH /me` and `POST /onboarding` in `auth.py` call `embed_user_segments()`. After Phase 3 (creating `embedding.py`), this works end-to-end.

### ChromaDB Data Flow (Complete Pipeline)

```
User completes onboarding
    ↓
POST /onboarding → auth.py
    ↓
embed_user_segments(user_doc, segments=["academic", "interests", ...])
    ↓ (via embedding.py bridge)
ensure_user_embedded(user_id, user_dict)
    ↓
EmbeddingService.embed_user(user_id, user_dict)
    ↓
profile_to_texts(user) → {"academic": "M.Sc. CS student...", "interests": "Enjoys climbing...", ...}
    ↓
SentenceTransformer.encode(text) → 384-dim float vector (per segment)
    ↓
ChromaDB.upsert(ids=["{user_id}__academic", ...], embeddings=[...], metadatas=[...])
    ↓
Persisted to backend/data/chroma/

--- Later, when matching ---

GET /events/:id/matches → events.py
    ↓
get_matches_for_event(user_id, event_id, db) → services/matching.py
    ↓
For each participant:
    compute_match_score(user_a, user_b, event_category)
        ↓
    Semantic segments: cosine_similarity_segment() → ChromaDB query → distance → similarity
    Categorical segments: jaccard_similarity() → set overlap
        ↓
    Weighted combination (context-aware by event category)
        ↓
    MatchResult(total_score=0.73, per_segment_scores={...}, shared_items={...})
    ↓
Sort by score, return top candidates
```

### Performance Notes

- **Model load time:** ~2-3 seconds on first request (cached after)
- **Embedding time:** ~10ms per user per segment, ~40ms per user (4 segments)
- **100 users initial embed:** ~4 seconds total
- **ChromaDB query time:** <5ms per query
- **Match computation for 50 participants:** ~200ms (4 segments × 50 queries)
- **Memory:** sentence-transformers model uses ~100MB RAM, ChromaDB adds ~50MB

---

## 6. Phase 5 — Seed Data Generation

**Goal:** Create `scripts/generate_seed_data.py` that produces realistic test data.

### Output Files

```
data/seed/
    users.json          — 100+ user profiles
    events.json         — 25 events
    groups.json         — 40 groups
    connections.json    — 150 connections
    messages.json       — 20 conversations, 3-5 messages each
    notifications.json  — Derived from connections + events
```

### Script Structure

```python
# scripts/generate_seed_data.py

"""
Generate seed data for LinkQ.

Usage:
    cd backend
    python -m scripts.generate_seed_data

Or from project root:
    python scripts/generate_seed_data.py
"""

import json
import random
import uuid
import hashlib
from datetime import datetime, timedelta
from pathlib import Path

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "data" / "seed"

# --- Data Pools ---

PROGRAMS = [
    "M.Sc. Computer Science", "M.Sc. Data Science", "B.Sc. Electrical Engineering",
    "M.Sc. Mechanical Engineering", "M.Sc. Information Systems", "B.Sc. Mathematics",
    "M.Sc. Autonomous Systems", "B.Sc. Computer Science", "M.Sc. IT Security",
    "M.Sc. Computational Engineering",
]

COURSES_POOL = [
    "Distributed Systems", "Machine Learning", "Computer Vision", "Software Engineering",
    "Algorithms and Data Structures", "Computer Networks", "Database Systems",
    "Operating Systems", "Artificial Intelligence", "Deep Learning",
    "Natural Language Processing", "Robotics", "Parallel Computing",
    "Systems Security", "Visual Computing", "Data Mining",
    "Statistical Machine Learning", "Compiler Design", "Embedded Systems",
    "Cloud Computing",
]

HOBBIES = [
    "climbing", "photography", "cooking", "gaming", "reading", "cycling",
    "hiking", "music production", "chess", "drawing", "yoga", "swimming",
    "skateboarding", "gardening", "3D printing", "origami",
]

TOPICS = [
    "AI ethics", "open source", "blockchain", "quantum computing", "sustainability",
    "space tech", "biotech", "game design", "UX design", "data privacy",
    "AR/VR", "edge computing", "DevOps culture", "tech startups",
]

PROGRAMMING_LANGS = [
    "Python", "TypeScript", "Java", "C++", "Rust", "Go", "Julia",
    "R", "Kotlin", "Swift", "C#", "Scala", "Haskell", "Ruby",
]

SPOKEN_LANGS = [
    "English", "German", "Hindi", "Mandarin", "Japanese", "Turkish",
    "Portuguese", "Arabic", "Polish", "Italian", "French", "Korean",
    "Spanish", "Russian", "Vietnamese", "Thai",
]

TOOLS = [
    "Docker", "Kubernetes", "Git", "Linux", "AWS", "GCP", "Azure",
    "TensorFlow", "PyTorch", "React", "Node.js", "PostgreSQL",
    "MongoDB", "Redis", "Grafana", "Terraform",
]

AVATARS = ["buff_arnold", "banana_guy", "anime_girl", "bland_normal_guy", "mystery_silhouette"]

FIRST_NAMES_DIVERSE = [
    # Indian
    "Arun", "Priya", "Vikram", "Ananya", "Rahul", "Sneha",
    # Chinese
    "Wei", "Mei", "Jian", "Xiao", "Hao", "Lin",
    # Japanese
    "Akira", "Yuki", "Haruto", "Sakura", "Kenji", "Aoi",
    # Korean
    "Minjun", "Soyeon", "Jihoon", "Yuna",
    # Turkish
    "Emre", "Elif", "Burak", "Zeynep",
    # Brazilian
    "Lucas", "Ana", "Gabriel", "Isabela",
    # Nigerian
    "Chidi", "Amara", "Obinna", "Ngozi",
    # Polish
    "Kacper", "Zofia", "Jakub", "Maja",
    # Italian
    "Marco", "Giulia", "Luca", "Chiara",
    # German
    "Felix", "Hannah", "Leon", "Emma",
]

LAST_NAMES = [
    "Kumar", "Chen", "Tanaka", "Kim", "Yilmaz", "Silva", "Okafor",
    "Nowak", "Rossi", "Mueller", "Park", "Nguyen", "Santos", "Ahmad",
    "Sato", "Li", "Wang", "Patel", "Schmidt", "Kowalski",
]

# --- Archetype definitions ---
# Social Butterfly (15%), Focused Student (30%), New Arrival (25%),
# Active Networker (20%), Lurker (10%)

ARCHETYPES = [
    ("social_butterfly", 15),
    ("focused_student", 30),
    ("new_arrival", 25),
    ("active_networker", 20),
    ("lurker", 10),
]

# ... (implement generate_user, generate_event, etc.)
# ... (full implementation ~300 lines)
```

### Key Generation Rules

1. **Users:** Generate based on archetype distribution. Each archetype has different:
   - Number of events (social_butterfly: 8-10, focused_student: 2-3, new_arrival: 1-2, active_networker: 5-7, lurker: 0-1)
   - Number of interests/skills (social_butterfly: many, focused_student: few but deep)
   - Avatar preference (lurker: mystery_silhouette, others: random)
   - `onboarding_complete` (lurker: sometimes false)

2. **Events:** 25 events across 5 categories with real TU Darmstadt locations:
   - Piloty-Gebäude (S2|02), Audimax (S1|01), Lichtwiese campus
   - Time range: past 3 months to 2 months ahead
   - 8-15 participants per event (intentional clustering)

3. **Demo Account:** `demo@tu-darmstadt.de` / `demo123`:
   - Rich profile (all fields filled)
   - Avatar: `banana_guy`
   - 6+ events, 10+ connections, 5+ conversations
   - `onboarding_complete: true`

4. **Connections:** Create 150 records, mix of PENDING/ACCEPTED/REJECTED:
   - 60% ACCEPTED, 25% PENDING, 15% REJECTED
   - Bias connections between users who share events

5. **Messages:** 20 conversations with template-based messages:
   - Only between ACCEPTED connections
   - 3-5 messages per conversation

6. **Password hashing:** All seed user passwords should be pre-hashed with bcrypt. Use a known password like `"password123"` for all test users and `"demo123"` for the demo account.

### Seed Loading into SQLite

Add a `load_seed_data.py` script or a method on the Database class:

```python
async def load_seed_data(self) -> None:
    """Load JSON seed files into SQLite tables. Idempotent — skips if users exist."""
    cursor = await self.conn.execute("SELECT COUNT(*) FROM users")
    row = await cursor.fetchone()
    if row[0] > 0:
        return  # Already seeded

    seed_dir = Path(__file__).resolve().parent.parent.parent / "data" / "seed"
    if not seed_dir.exists():
        return

    # Load users
    users_file = seed_dir / "users.json"
    if users_file.exists():
        users = json.loads(users_file.read_text())
        if isinstance(users, list):
            for user in users:
                await self.create_user(user)
        elif isinstance(users, dict):
            for user in users.values():
                await self.create_user(user)

    # Load events
    events_file = seed_dir / "events.json"
    if events_file.exists():
        events = json.loads(events_file.read_text())
        # ... similar pattern

    # ... connections, groups, messages, notifications
```

---

## 7. Phase 6 — Missing Endpoints & Bug Fixes

### 7.1 Bug Fixes (Must Fix)

#### Fix 1: `get_current_user` Return Type Mismatch

**Files affected:** `routes/connections.py`, `routes/groups.py`, `routes/messages.py`

**Problem:** `get_current_user()` returns the full user `dict`, but these routes assign it to `user_id: str`:
```python
# connections.py line 16
def send_connection_request(body: ConnectionRequest, user_id: str = Depends(get_current_user)):
```

This receives a `dict`, not a `str`. Every `user_id` comparison/usage will fail.

**Fix:** Change to:
```python
def send_connection_request(body: ConnectionRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    ...
```

Apply this pattern to all 8 affected endpoints in connections.py (3), groups.py (2), messages.py (3).

#### Fix 2: Event Matches Endpoint Passes Wrong Args

**File:** `routes/events.py` line 214

```python
candidates = get_matches_for_event(user_id=user_id, event_id=event_id)
```

But `get_matches_for_event` signature requires 3 args: `(user_id, event_id, db)`. Missing `db` argument.

**Fix:** Pass `db`:
```python
candidates = get_matches_for_event(user_id=user_id, event_id=event_id, db=db)
```

(In the current in-memory version, `db` is the global singleton imported inside the matching service. But it should be passed explicitly for consistency and for the SQLite migration.)

#### Fix 3: Event Matches Return Type Mismatch

**File:** `routes/events.py` line 220

```python
candidates.sort(key=lambda c: c.match_score, reverse=True)
```

But `get_matches_for_event` returns `list[MatchCandidate]` which are `TypedDict` objects (from `services/matching.py`), not Pydantic models. TypedDicts use `c["match_score"]` not `c.match_score`.

**Fix:** Either change the sort key:
```python
candidates.sort(key=lambda c: c["match_score"], reverse=True)
```
Or convert the service return type to Pydantic models.

### 7.2 Missing Endpoints

#### A. `POST /conversations` — Create a Conversation

Currently there's no way to create a conversation. `POST /messages` requires an existing `conversation_id`.

```python
# Add to routes/messages.py

class CreateConversationBody(BaseModel):
    other_user_id: str

@router.post("/conversations", status_code=201)
async def create_conversation(
    body: CreateConversationBody,
    current_user: dict = Depends(get_current_user),
    db: Database = Depends(get_db),
):
    """Create a 1:1 conversation. Returns existing if already exists."""
    user_id = current_user["id"]

    # Check if conversation already exists between these two users
    existing = await db.find_conversation(user_id, body.other_user_id)
    if existing:
        return existing

    conv_id = f"conv_{uuid.uuid4().hex[:12]}"
    await db.create_conversation(conv_id, [user_id, body.other_user_id])
    return {"conversation_id": conv_id, "participants": [user_id, body.other_user_id]}
```

#### B. Event University Filter

The `GET /events?university=` filter doesn't work because events don't have a `university` column. Two options:

**Option A (simple):** Add a `university` field to the events table and EventCreate schema. Set it from the creator's university when creating an event.

**Option B (query-time):** Join through `event_participants` → `users` to find events where any participant is from the given university. More complex query but no schema change.

**Recommendation:** Option A. Add `university TEXT NOT NULL DEFAULT ''` to events table. Set from `current_user["university"]` in `create_event`.

#### C. Full-Text Event Search

Current `title` filter uses substring match (`LIKE %query%`). For MVP this is fine. If needed later, SQLite supports FTS5:

```sql
CREATE VIRTUAL TABLE events_fts USING fts5(title, description, content='events', content_rowid='rowid');
```

This is a post-MVP enhancement. Not needed now.

### 7.3 Route Prefix Cleanup

Current router prefixes are inconsistent:
- `auth.py` — no prefix (routes are `/auth/register`, `/me`, `/oauth`, `/onboarding`)
- `events.py` — prefix `/events`
- `connections.py` — prefix `/connections`
- `groups.py` — no prefix (routes are `/groups`, `/group/{id}`, `/group/event/{id}`)
- `messages.py` — no prefix (routes are `/conversations`, `/messages`, `/messages/{id}`)
- `notifications.py` — prefix `/notifications`
- `users.py` — prefix `/users`
- `matching.py` — no prefix (routes are `/match/{id}`, `/users/{id}/compare/{target_id}`)

This is fine for MVP — just be aware that route order matters when including routers in `main.py`. Include `matching.py` router last since it overlaps with `users.py` prefix.

---

## 8. Phase 7 — Testing

### 8.1 Test Structure

```
backend/
    tests/
        __init__.py
        conftest.py          — shared fixtures (test client, test db, auth helpers)
        test_auth.py         — register, login, /me, onboarding
        test_events.py       — CRUD, join, participants
        test_connections.py  — send, accept, reject
        test_groups.py       — create, join, list
        test_messages.py     — conversations, send message
        test_matching.py     — matching engine unit tests
        test_seed.py         — validate seed data integrity
```

### 8.2 Test Dependencies

Add to `requirements.txt`:
```
pytest==8.2.0
pytest-asyncio==0.23.0
httpx==0.27.0
```

### 8.3 Test Fixtures (`conftest.py`)

```python
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import init_db, DB_PATH

@pytest.fixture(autouse=True)
async def clean_db():
    """Use a fresh in-memory SQLite for each test."""
    # Override DB_PATH to ":memory:" or a temp file
    ...

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def auth_headers(client):
    """Register a test user and return auth headers."""
    resp = await client.post("/auth/register", json={
        "name": "Test User", "email": "test@test.com", "password": "test123"
    })
    token = resp.json()["token"]
    return {"Authorization": f"Bearer {token}"}
```

### 8.4 Key Test Scenarios

| Test | Validates |
|------|-----------|
| Register → Login → Get /me | Auth flow end-to-end |
| Register → Onboarding → Verify onboarding_complete=true | Onboarding persistence |
| Create event → Join → List participants | Event flow |
| Two users join same event → Get matches | Matching engine integration |
| Send connection → Accept → Verify notification | Connection + notification flow |
| Create conversation → Send message → List messages | Messaging flow |
| Create group → Join → Verify member count | Group flow |
| Seed data load → Verify all FK constraints | Seed data integrity |

### 8.5 Matching Engine Unit Tests

```python
# test_matching.py

from app.services.matching import (
    jaccard_similarity,
    compute_match_score,
    EmbeddingService,
)

def test_jaccard_empty():
    assert jaccard_similarity(set(), set()) == 0.0

def test_jaccard_identical():
    assert jaccard_similarity({"a", "b"}, {"a", "b"}) == 1.0

def test_jaccard_partial():
    assert jaccard_similarity({"a", "b", "c"}, {"b", "c", "d"}) == 0.5

def test_text_templating():
    svc = EmbeddingService()
    user = {
        "program": "M.Sc. CS",
        "academic": {"courses": ["ML", "CV"], "degree": "M.Sc. CS", "thesis_topic": ""},
        "interests": {"hobbies": ["climbing"], "topics": ["AI"], "music": "", "sports": ""},
        "goals": {"learning": ["Rust"], "career": "ML eng", "short_term": "", "here_to": ""},
        "events": {"attended": ["e1"], "interested": [], "categories": ["hackathon"]},
    }
    texts = svc.profile_to_texts(user)
    assert "ML" in texts["academic"]
    assert "climbing" in texts["interests"]
    assert "Rust" in texts["goals"]

def test_context_aware_weights():
    """Hackathon should weight skills higher than seminar."""
    user_a = {
        "id": "a", "academic": {"courses": [], "degree": "", "thesis_topic": ""},
        "interests": {"hobbies": [], "topics": [], "music": "", "sports": ""},
        "goals": {"learning": [], "career": "", "short_term": "", "here_to": ""},
        "events": {"attended": [], "interested": [], "categories": []},
        "skills": {"programming": ["Python", "Rust"], "languages": ["English"], "tools": ["Docker"]},
        "availability": {"preferred_times": ["evenings"], "study_style": "pair", "timezone": "CET"},
    }
    user_b = {**user_a, "id": "b"}

    result_hack = compute_match_score(user_a, user_b, "hackathon")
    result_social = compute_match_score(user_a, user_b, "social")
    # Identical users with only skills → hackathon should score higher (skills weight 0.30 vs 0.05)
    assert result_hack["total_score"] >= result_social["total_score"]
```

---

## 9. Frontend Connection Guide

> **Note:** This section is for future reference. No frontend files should be modified during backend implementation.

### 9.1 API Client Setup

The frontend should have an Axios instance at `frontend/src/services/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('linkq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 → redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('linkq_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### 9.2 Auth Flow

```typescript
// Register
const { data } = await api.post('/auth/register', { name, email, password });
localStorage.setItem('linkq_token', data.token);

// Login
const { data } = await api.post('/auth/login', { email, password });
localStorage.setItem('linkq_token', data.token);

// Get current user
const { data: user } = await api.get('/me');
// user.onboarding_complete → route to /home or /onboarding/verify
```

### 9.3 Onboarding Flow (6 Steps → Single Submit)

Collect data across all 6 onboarding screens in a Zustand store, then submit everything at once:

```typescript
// After step 6 (event browser):
await api.post('/onboarding', {
  university: store.university,
  program: store.program,
  semester: store.semester,
  avatar: store.selectedAvatar,
  academic: { courses: store.courses, degree: store.degree },
  interests: { hobbies: store.hobbies, topics: store.topics, music: store.music, sports: store.sports },
  skills: { programming: store.programming, languages: store.languages, tools: store.tools },
  goals: { learning: store.learning, career: store.career, short_term: store.shortTerm, here_to: store.hereTo },
  availability: { preferred_times: store.times, study_style: store.style, timezone: store.timezone },
  events: { interested: store.selectedEventIds },
  bio: store.bio,
});
```

### 9.4 Event + Matching Flow

```typescript
// List events
const { data: events } = await api.get('/events', { params: { category: 'hackathon', limit: 20 } });

// Join event
await api.post(`/events/${eventId}/join`);

// Get matches at event
const { data: matches } = await api.post(`/match/${userId}`, null, {
  params: { event_id: eventId, type: 'user' }
});
// matches.candidates[0].match_score = 87.3 (0-100 scale)
// matches.candidates[0].per_segment_scores = { academic: 92.1, interests: 71.0, ... }
// matches.candidates[0].shared = { courses: ["ML"], hobbies: ["climbing"] }
```

### 9.5 3D Lobby Data

The lobby is visual-only — it renders avatars from the participants list:

```typescript
// Get participants for lobby rendering
const { data: participants } = await api.get(`/events/${eventId}/participants`);
// Each participant has: { id, name, avatar, avatar_url, university, program }

// On avatar tap → get profile comparison
const { data: comparison } = await api.get(`/users/${myId}/compare/${theirId}`, {
  params: { event_id: eventId }
});
// comparison.match_score, comparison.shared, comparison.differences
```

### 9.6 TanStack Query Integration

```typescript
// hooks/useEventMatches.ts
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useEventMatches(eventId: string, userId: string) {
  return useQuery({
    queryKey: ['matches', eventId, userId],
    queryFn: () => api.post(`/match/${userId}`, null, {
      params: { event_id: eventId, type: 'user' }
    }).then(r => r.data),
    staleTime: 5 * 60 * 1000, // 5 min cache
    enabled: !!eventId && !!userId,
  });
}
```

### 9.7 Environment Variable

Add to `frontend/.env`:
```
VITE_API_URL=http://localhost:8000
```

---

## 10. Deployment Notes

### 10.1 Local Development

```bash
# Terminal 1 — Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python -m scripts.generate_seed_data   # generate seed data first
uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev   # Vite at http://localhost:5173
```

### 10.2 File Structure After All Phases

```
backend/
    app/
        __init__.py
        main.py                      ← Phase 1 (NEW)
        core/
            __init__.py
            config.py                 (existing)
            database.py               ← Phase 2 (REWRITE)
            schema.sql                ← Phase 2 (NEW)
            security.py               (existing, minor update for async)
        models/
            __init__.py
            schemas.py                (existing)
        routes/
            __init__.py
            auth.py                   (existing, update for SQLite)
            connections.py            (existing, FIX user_id bug + SQLite)
            events.py                 (existing, FIX db arg + SQLite)
            groups.py                 (existing, FIX user_id bug + SQLite)
            match.py                  (existing, NOT mounted — kept for reference)
            matching.py               (existing, update for SQLite)
            messages.py               (existing, FIX user_id bug + SQLite + add POST /conversations)
            notifications.py          (existing, update for SQLite)
            users.py                  (existing, REMOVE compare route)
        services/
            __init__.py
            embedding.py              ← Phase 3 (NEW — bridge module)
            matching.py               (existing — the beast, 753 lines, mostly unchanged)
    tests/                            ← Phase 7 (NEW)
        __init__.py
        conftest.py
        test_auth.py
        test_events.py
        test_connections.py
        test_groups.py
        test_messages.py
        test_matching.py
        test_seed.py
    data/
        linkq.db                      ← Created at runtime by SQLite
        chroma/                       ← Created at runtime by ChromaDB
    requirements.txt                  (existing, add aiosqlite + test deps)
    .gitignore                        ← Add data/linkq.db, data/chroma/

scripts/
    generate_seed_data.py             ← Phase 5 (NEW)

data/
    seed/
        users.json                    ← Phase 5 (GENERATED)
        events.json
        groups.json
        connections.json
        messages.json
        notifications.json

Docs/
    backendImplementation.md          ← This file
```

### 10.3 Implementation Order (Recommended)

| Order | Phase | Effort | Blocked By |
|-------|-------|--------|------------|
| 1 | **Phase 1: main.py** | 30 min | Nothing |
| 2 | **Phase 3: embedding.py bridge** | 15 min | Nothing |
| 3 | **Phase 6: Bug fixes** (user_id, db arg, sort key) | 1 hr | Nothing |
| 4 | **Phase 5: Seed data generation** | 2-3 hrs | Nothing |
| 5 | **Phase 2: SQLite migration** | 4-6 hrs | Phase 1 |
| 6 | **Phase 4: ChromaDB wiring** | 1 hr | Phase 2 + 5 |
| 7 | **Phase 7: Tests** | 3-4 hrs | Phase 2 |

**Total estimated effort: 12-16 hours of implementation.**

Phases 1, 3, and 6 can be done immediately and independently — they make the existing in-memory backend actually runnable and correct.

Phase 5 (seed data) can be done in parallel with everything else.

Phase 2 (SQLite) is the largest change and touches every file — do it as a single focused session.

### 10.4 `.gitignore` Additions

```gitignore
# Backend data (generated at runtime)
backend/data/linkq.db
backend/data/chroma/

# Python
__pycache__/
*.pyc
*.pyo
.venv/
venv/

# sentence-transformers model cache
.cache/

# IDE
.vscode/
.idea/
```

---

## Appendix A: Complete API Endpoint Matrix

After all phases are implemented, these are all the available endpoints:

| Method | Route | Auth | Handler | Description |
|--------|-------|------|---------|-------------|
| POST | `/auth/register` | - | auth.py | Register new user |
| POST | `/auth/login` | - | auth.py | Login → JWT |
| GET | `/me` | Bearer | auth.py | Current user profile |
| PATCH | `/me` | Bearer | auth.py | Update profile (partial) |
| POST | `/oauth` | - | auth.py | Simulate module OAuth |
| POST | `/onboarding` | Bearer | auth.py | Submit all onboarding data |
| GET | `/events` | - | events.py | List/search events |
| POST | `/events` | Bearer | events.py | Create event |
| GET | `/events/:id` | - | events.py | Event details |
| POST | `/events/:id/join` | Bearer | events.py | Join event |
| GET | `/events/:id/participants` | - | events.py | List participants |
| GET | `/events/:id/matches` | Bearer | events.py | Match candidates at event |
| POST | `/connections` | Bearer | connections.py | Send connection request |
| GET | `/connections` | Bearer | connections.py | List connections |
| PATCH | `/connections/:id` | Bearer | connections.py | Accept/reject |
| POST | `/groups?event_id=` | Bearer | groups.py | Create group |
| GET | `/group/:id` | Bearer | groups.py | Group details |
| POST | `/group/:id` | Bearer | groups.py | Join group |
| GET | `/group/event/:event_id` | - | groups.py | Groups for event |
| POST | `/conversations` | Bearer | messages.py | Create conversation (NEW) |
| GET | `/conversations` | Bearer | messages.py | List conversations |
| GET | `/messages/:conv_id` | Bearer | messages.py | Message history |
| POST | `/messages` | Bearer | messages.py | Send message |
| GET | `/notifications` | Bearer | notifications.py | List notifications |
| PATCH | `/notifications/:id` | Bearer | notifications.py | Mark read |
| GET | `/users/:id` | - | users.py | Get user profile |
| POST | `/match/:id?event_id=&type=` | Bearer | matching.py | Full matching pipeline |
| GET | `/users/:id/compare/:target_id` | - | matching.py | Profile comparison |
| GET | `/health` | - | main.py | Health check |

**Total: 29 endpoints (28 + health check)**
