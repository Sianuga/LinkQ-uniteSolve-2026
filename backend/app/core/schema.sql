-- Nexus SQLite Schema

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

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
    onboarding_complete INTEGER NOT NULL DEFAULT 0,
    bio             TEXT NOT NULL DEFAULT '',
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    academic_json       TEXT NOT NULL DEFAULT '{"courses":[],"degree":"","thesis_topic":""}',
    interests_json      TEXT NOT NULL DEFAULT '{"hobbies":[],"topics":[],"music":"","sports":""}',
    skills_json         TEXT NOT NULL DEFAULT '{"programming":[],"languages":[],"tools":[]}',
    goals_json          TEXT NOT NULL DEFAULT '{"learning":[],"career":"","short_term":"","here_to":""}',
    availability_json   TEXT NOT NULL DEFAULT '{"preferred_times":[],"study_style":"","timezone":""}',
    events_json         TEXT NOT NULL DEFAULT '{"attended":[],"interested":[],"categories":[]}'
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS events (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    location        TEXT NOT NULL DEFAULT '',
    start_time      TEXT NOT NULL,
    end_time        TEXT NOT NULL,
    category        TEXT NOT NULL DEFAULT '',
    university      TEXT NOT NULL DEFAULT '',
    created_by      TEXT NOT NULL REFERENCES users(id),
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_time);

CREATE TABLE IF NOT EXISTS event_participants (
    event_id    TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at   TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (event_id, user_id)
);

CREATE TABLE IF NOT EXISTS connections (
    id              TEXT PRIMARY KEY,
    requester_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status          TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','ACCEPTED','REJECTED')),
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(requester_id, receiver_id)
);
CREATE INDEX IF NOT EXISTS idx_conn_requester ON connections(requester_id);
CREATE INDEX IF NOT EXISTS idx_conn_receiver ON connections(receiver_id);

CREATE TABLE IF NOT EXISTS groups_ (
    id              TEXT PRIMARY KEY,
    name            TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    event_id        TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    looking_for     INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS group_members (
    group_id    TEXT NOT NULL REFERENCES groups_(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at   TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS conversations (
    id          TEXT PRIMARY KEY,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS conversation_participants (
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id                  TEXT PRIMARY KEY,
    conversation_id     TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id           TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content             TEXT NOT NULL,
    timestamp           TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON messages(conversation_id, timestamp);

CREATE TABLE IF NOT EXISTS notifications (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type            TEXT NOT NULL,
    message         TEXT NOT NULL DEFAULT '',
    read            INTEGER NOT NULL DEFAULT 0,
    timestamp       TEXT NOT NULL DEFAULT (datetime('now')),
    reference_id    TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id, timestamp);
