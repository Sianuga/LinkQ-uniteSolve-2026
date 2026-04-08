#!/usr/bin/env python3
"""
LinkQ Seed Data Generator
=========================
Generates realistic seed data for the LinkQ student event connection platform.

Usage:
    cd backend && python ../scripts/generate_seed_data.py
    python scripts/generate_seed_data.py          # from project root

Output: data/seed/*.json  (6 files)
"""

import json
import os
import random
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import bcrypt

# ---------------------------------------------------------------------------
# Reproducibility
# ---------------------------------------------------------------------------
random.seed(42)

# ---------------------------------------------------------------------------
# Password hashing (compute once)
# ---------------------------------------------------------------------------

def hash_password(plain: str) -> str:
    """Hash a password with bcrypt. Compatible with passlib verification."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

print("Hashing default passwords (this may take a moment) ...")
DEFAULT_HASH = hash_password("password123")
DEMO_HASH = hash_password("demo123")

# ---------------------------------------------------------------------------
# Reference date — "now" for generation
# ---------------------------------------------------------------------------
NOW = datetime(2026, 4, 8, 10, 0, 0, tzinfo=timezone.utc)

# ---------------------------------------------------------------------------
# Data pools
# ---------------------------------------------------------------------------
PROGRAMS = [
    "M.Sc. Computer Science", "M.Sc. Data Science", "B.Sc. Electrical Engineering",
    "M.Sc. Mechanical Engineering", "M.Sc. Information Systems", "B.Sc. Mathematics",
    "M.Sc. Autonomous Systems", "B.Sc. Computer Science", "M.Sc. IT Security",
    "M.Sc. Computational Engineering",
]

COURSES = [
    "Distributed Systems", "Machine Learning", "Computer Vision", "Software Engineering",
    "Algorithms and Data Structures", "Computer Networks", "Database Systems",
    "Operating Systems", "Artificial Intelligence", "Deep Learning",
    "Natural Language Processing", "Robotics", "Parallel Computing",
    "Systems Security", "Visual Computing", "Data Mining",
    "Statistical Machine Learning", "Compiler Design", "Embedded Systems", "Cloud Computing",
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

PROGRAMMING = [
    "Python", "TypeScript", "Java", "C++", "Rust", "Go", "Julia", "R",
    "Kotlin", "Swift", "C#", "Scala", "Haskell", "Ruby",
]

SPOKEN_LANGS = [
    "English", "German", "Hindi", "Mandarin", "Japanese", "Turkish",
    "Portuguese", "Arabic", "Polish", "Italian", "French", "Korean",
    "Spanish", "Russian", "Vietnamese",
]

TOOLS = [
    "Docker", "Kubernetes", "Git", "Linux", "AWS", "GCP", "Azure",
    "TensorFlow", "PyTorch", "React", "Node.js", "PostgreSQL",
    "MongoDB", "Redis", "Grafana", "Terraform",
]

AVATARS = ["buff_arnold", "banana_guy", "anime_girl", "bland_normal_guy", "mystery_silhouette"]

FIRST_NAMES = [
    "Arun", "Priya", "Vikram", "Ananya", "Rahul", "Sneha",
    "Wei", "Mei", "Jian", "Xiao", "Hao", "Lin",
    "Akira", "Yuki", "Haruto", "Sakura", "Kenji", "Aoi",
    "Minjun", "Soyeon", "Jihoon", "Yuna",
    "Emre", "Elif", "Burak", "Zeynep",
    "Lucas", "Ana", "Gabriel", "Isabela",
    "Chidi", "Amara", "Obinna", "Ngozi",
    "Kacper", "Zofia", "Jakub", "Maja",
    "Marco", "Giulia", "Luca", "Chiara",
    "Felix", "Hannah", "Leon", "Emma",
    "Tomas", "Sofia", "David", "Nadia",
]

LAST_NAMES = [
    "Kumar", "Chen", "Tanaka", "Kim", "Yilmaz", "Silva", "Okafor",
    "Nowak", "Rossi", "Mueller", "Park", "Nguyen", "Santos", "Ahmad",
    "Sato", "Li", "Wang", "Patel", "Schmidt", "Kowalski",
]

STUDY_STYLES = ["solo", "pair", "group"]
PREFERRED_TIMES = ["mornings", "afternoons", "evenings", "weekends", "late nights"]
MUSIC_GENRES = ["j-pop", "hip hop", "classical", "EDM", "rock", "jazz", "K-pop", "indie", "lo-fi", "metal"]
SPORTS = ["badminton", "soccer", "basketball", "tennis", "volleyball", "table tennis", "running", "swimming"]
CAREER_GOALS = [
    "ML engineering", "software architecture", "data science", "cybersecurity",
    "DevOps", "research/academia", "product management", "startup founder",
    "game development", "embedded systems",
]
LEARNING_GOALS = [
    "Rust", "system design", "Kubernetes", "machine learning", "web3",
    "mobile dev", "cloud architecture", "data engineering", "compiler design",
    "graphics programming",
]
HERE_TO = [
    "meet people in my courses and find study partners",
    "find a hackathon team",
    "expand my professional network",
    "learn from peers with different backgrounds",
    "find collaborators for side projects",
    "make friends in a new city",
    "discover interesting events on campus",
    "find study groups for exam prep",
]

SHORT_TERMS = [
    "find study group for exam prep", "finish thesis proposal",
    "get an internship for summer", "improve German to B2",
    "publish a conference paper", "build a portfolio project",
    "prepare for coding interviews", "learn a new framework",
]

BIO_TEMPLATES = [
    "International {program} student at TU Darmstadt. Passionate about {topic} and {hobby}.",
    "{program} student exploring {topic}. Outside class you'll find me {hobby}.",
    "Studying {program} at TU Darmstadt. Interests include {topic} and {hobby}.",
    "Enthusiastic {program} student. Love {hobby} and learning about {topic}.",
    "{program} @ TU Darmstadt. Into {topic}, {hobby}, and good coffee.",
    "Curious {program} student. Currently diving into {topic}. Also enjoy {hobby}.",
]

# ---------------------------------------------------------------------------
# Archetype definitions
# ---------------------------------------------------------------------------
ARCHETYPES = {
    "social_butterfly":  {"pct": 0.15, "events": (8, 10), "hobbies": (5, 8), "topics": (4, 6), "prog": (3, 5), "tools": (3, 5), "langs": (2, 4), "onboarding": 1.0},
    "focused_student":   {"pct": 0.30, "events": (2, 3),  "hobbies": (2, 3), "topics": (1, 2), "prog": (2, 4), "tools": (2, 3), "langs": (1, 3), "onboarding": 1.0},
    "new_arrival":       {"pct": 0.25, "events": (1, 2),  "hobbies": (1, 2), "topics": (0, 1), "prog": (1, 2), "tools": (0, 2), "langs": (1, 2), "onboarding": 0.7},
    "active_networker":  {"pct": 0.20, "events": (5, 7),  "hobbies": (3, 5), "topics": (2, 4), "prog": (2, 4), "tools": (2, 4), "langs": (2, 3), "onboarding": 1.0},
    "lurker":            {"pct": 0.10, "events": (0, 1),  "hobbies": (0, 2), "topics": (0, 1), "prog": (0, 2), "tools": (0, 1), "langs": (1, 2), "onboarding": 0.5},
}

# ---------------------------------------------------------------------------
# Event definitions (25 events)
# ---------------------------------------------------------------------------
EVENT_DEFS = [
    # Lectures / Courses (8)
    {"title": "Distributed Systems Lecture",       "cat": "lecture",   "desc": "Weekly lecture covering consensus protocols, replication, and fault tolerance."},
    {"title": "Machine Learning Lab Session",      "cat": "lecture",   "desc": "Hands-on lab implementing ML models with real-world datasets."},
    {"title": "Computer Vision Seminar Series",    "cat": "lecture",   "desc": "Weekly seminar on image recognition, segmentation, and 3D reconstruction."},
    {"title": "Software Engineering Workshop",     "cat": "lecture",   "desc": "Agile methodologies, CI/CD, and collaborative software development."},
    {"title": "Deep Learning Lecture",             "cat": "lecture",   "desc": "Neural network architectures from CNNs to Transformers."},
    {"title": "Natural Language Processing Lab",   "cat": "lecture",   "desc": "Building NLP pipelines: tokenization, embeddings, and sequence models."},
    {"title": "Database Systems Tutorial",         "cat": "lecture",   "desc": "Query optimization, transactions, and distributed databases."},
    {"title": "Cloud Computing Lecture",           "cat": "lecture",   "desc": "Virtualization, containers, and cloud-native application design."},
    # Seminars (5)
    {"title": "Advanced Topics in NLP",            "cat": "seminar",   "desc": "One-day deep dive into large language models and prompt engineering."},
    {"title": "Systems Security Seminar",          "cat": "seminar",   "desc": "Presentations on current security research and vulnerability analysis."},
    {"title": "Quantum Computing Introduction",    "cat": "seminar",   "desc": "An accessible introduction to quantum gates, circuits, and algorithms."},
    {"title": "Ethics in AI Panel Discussion",     "cat": "seminar",   "desc": "Panel with faculty and industry guests on responsible AI development."},
    {"title": "Research Methods Bootcamp",         "cat": "seminar",   "desc": "Crash course on academic writing, experiment design, and statistics."},
    # Hackathons (4)
    {"title": "TU Darmstadt HackaTUM",             "cat": "hackathon", "desc": "48-hour hackathon — build innovative solutions for urban mobility."},
    {"title": "AI for Good Hack",                  "cat": "hackathon", "desc": "Use AI to tackle social and environmental challenges in 24 hours."},
    {"title": "Climate Tech Hackathon",            "cat": "hackathon", "desc": "Sustainable tech solutions for climate change — prizes from industry sponsors."},
    {"title": "Open Source Sprint",                "cat": "hackathon", "desc": "Contribute to open-source projects with mentorship from maintainers."},
    # Student Clubs (4)
    {"title": "International Students Meetup",     "cat": "club",      "desc": "Monthly gathering for international students to connect and share experiences."},
    {"title": "Robotics Club Workshop",            "cat": "club",      "desc": "Build and program robots — open to all skill levels."},
    {"title": "Photography Walk Darmstadt",        "cat": "club",      "desc": "Explore the city with fellow photographers. All cameras welcome."},
    {"title": "Coding Dojo",                       "cat": "club",      "desc": "Weekly kata sessions — pair programming and test-driven development."},
    # Social (4)
    {"title": "Welcome Week Pub Quiz",             "cat": "social",    "desc": "Kick off the semester with trivia, prizes, and new friends."},
    {"title": "Language Exchange Café",             "cat": "social",    "desc": "Practice languages over coffee — matched by language pairs."},
    {"title": "Board Game Night",                  "cat": "social",    "desc": "Bring your favourites or try something new. Snacks provided."},
    {"title": "Campus Movie Night",                "cat": "social",    "desc": "Outdoor screening on Lichtwiese — vote for the movie online."},
]

LOCATIONS = [
    "Piloty-Gebäude (S2|02)", "Audimax (S1|01)", "Lichtwiese Mensa",
    "Hörsaalzentrum (S1|08)", "Altes Hauptgebäude (S1|03)", "Maschinenhaus (S1|05)",
]

PARTICIPANT_RANGE = {
    "lecture": (15, 25), "seminar": (10, 18), "hackathon": (12, 22),
    "club": (8, 16), "social": (10, 20),
}

GROUP_NAME_PREFIXES = [
    "Study Group", "Team", "Lab Partners", "Project Squad", "Prep Crew",
    "Review Circle", "Hack Team", "Research Group", "Collab Team", "Focus Group",
]
GROUP_NAME_SUFFIXES = [
    "Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta",
    "Theta", "Iota", "Kappa", "A", "B", "C", "1", "2", "3",
]

MSG_TEMPLATES = [
    "Hey, saw you're also in {course}! How are you finding it?",
    "Are you going to {event} tomorrow?",
    "I noticed we both code in {lang} — want to pair on the assignment?",
    "How did you find the hackathon?",
    "Looking for a study partner for the exam — interested?",
    "Great presentation today! Would love to chat more about your approach.",
    "Do you know any good resources for {topic}?",
    "Want to grab coffee before the next lecture?",
    "I'm working on a side project related to {topic}, interested in collaborating?",
    "Thanks for the help with the assignment!",
    "Hey! I think we're in the same program. Which semester are you in?",
    "Just saw the event page — looks like we have a lot in common!",
    "Would you be up for forming a study group?",
    "That was a great talk. Did you take notes on the second half?",
    "I'm new here — any tips for settling in at TU Darmstadt?",
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def uid(n: int) -> str:
    return f"user_{n:03d}"

def eid(n: int) -> str:
    return f"event_{n:03d}"

def gid(n: int) -> str:
    return f"group_{n:03d}"

def cid(n: int) -> str:
    return f"conn_{n:03d}"

def cvid(n: int) -> str:
    return f"conv_{n:03d}"

def mid(n: int) -> str:
    return f"msg_{n:03d}"

def nid(n: int) -> str:
    return f"notif_{n:03d}"

def iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%S+00:00")

def pick(pool, lo, hi):
    """Return a random sample from *pool* with size in [lo, hi]."""
    n = min(random.randint(lo, hi), len(pool))
    return random.sample(pool, n) if n > 0 else []

# ---------------------------------------------------------------------------
# 1. Generate users
# ---------------------------------------------------------------------------

def generate_users(count: int = 100):
    print(f"  Generating {count} users ...")
    users: dict[str, dict] = {}
    used_names: set[str] = set()

    # Build archetype assignment list
    arch_list: list[str] = []
    for name, cfg in ARCHETYPES.items():
        arch_list.extend([name] * round(cfg["pct"] * count))
    # Pad or trim to exact count (minus 1 for demo)
    while len(arch_list) < count - 1:
        arch_list.append(random.choice(list(ARCHETYPES.keys())))
    arch_list = arch_list[: count - 1]
    random.shuffle(arch_list)

    def unique_name():
        for _ in range(200):
            fn = random.choice(FIRST_NAMES)
            ln = random.choice(LAST_NAMES)
            full = f"{fn} {ln}"
            if full not in used_names:
                used_names.add(full)
                return full
        # fallback — append a number
        fn = random.choice(FIRST_NAMES)
        ln = random.choice(LAST_NAMES)
        full = f"{fn} {ln} {random.randint(2,99)}"
        used_names.add(full)
        return full

    def make_user(user_id: str, archetype: str):
        cfg = ARCHETYPES[archetype]
        name = unique_name()
        email = name.lower().replace(" ", ".") + "@tu-darmstadt.de"
        program = random.choice(PROGRAMS)
        semester = random.randint(1, 6)
        onboarded = random.random() < cfg["onboarding"]
        avatar = "mystery_silhouette" if archetype == "lurker" else random.choice(AVATARS)

        hobbies = pick(HOBBIES, *cfg["hobbies"])
        topics = pick(TOPICS, *cfg["topics"])
        prog_langs = pick(PROGRAMMING, *cfg["prog"])
        tools = pick(TOOLS, *cfg["tools"])
        spoken = pick(SPOKEN_LANGS, *cfg["langs"])
        if "English" not in spoken:
            spoken.insert(0, "English")
        courses = pick(COURSES, 1, 5) if archetype != "lurker" else pick(COURSES, 0, 2)

        topic_str = topics[0] if topics else "technology"
        hobby_str = hobbies[0] if hobbies else "exploring the city"
        bio = random.choice(BIO_TEMPLATES).format(program=program, topic=topic_str, hobby=hobby_str)

        return {
            "id": user_id,
            "name": name,
            "email": email,
            "password_hash": DEFAULT_HASH,
            "university": "TU Darmstadt",
            "program": program,
            "semester": semester,
            "avatar": avatar,
            "avatar_url": "",
            "onboarding_complete": onboarded,
            "academic": {
                "courses": courses,
                "degree": program,
                "thesis_topic": "",
            },
            "interests": {
                "hobbies": hobbies,
                "topics": topics,
                "music": random.choice(MUSIC_GENRES),
                "sports": random.choice(SPORTS) if hobbies else "",
            },
            "skills": {
                "programming": prog_langs,
                "languages": spoken,
                "tools": tools,
            },
            "goals": {
                "learning": pick(LEARNING_GOALS, 1, 3),
                "career": random.choice(CAREER_GOALS),
                "short_term": random.choice(SHORT_TERMS),
                "here_to": random.choice(HERE_TO),
            },
            "availability": {
                "preferred_times": pick(PREFERRED_TIMES, 1, 3),
                "study_style": random.choice(STUDY_STYLES),
                "timezone": "CET",
            },
            "events": {
                "attended": [],   # filled during event assignment
                "interested": [],
                "categories": [],
            },
            "bio": bio,
            "_archetype": archetype,  # internal — stripped before output
        }

    # Generate regular users
    for i, arch in enumerate(arch_list, start=1):
        u = make_user(uid(i), arch)
        users[u["id"]] = u

    # Demo user
    demo = {
        "id": "user_demo",
        "name": "Demo User",
        "email": "demo@tu-darmstadt.de",
        "password_hash": DEMO_HASH,
        "university": "TU Darmstadt",
        "program": "M.Sc. Computer Science",
        "semester": 3,
        "avatar": "banana_guy",
        "avatar_url": "",
        "onboarding_complete": True,
        "academic": {
            "courses": ["Distributed Systems", "Machine Learning", "Deep Learning", "Cloud Computing"],
            "degree": "M.Sc. Computer Science",
            "thesis_topic": "Event-based social graph matching",
        },
        "interests": {
            "hobbies": ["climbing", "photography", "gaming", "cooking", "hiking"],
            "topics": ["AI ethics", "open source", "sustainability", "tech startups"],
            "music": "lo-fi",
            "sports": "badminton",
        },
        "skills": {
            "programming": ["Python", "TypeScript", "Rust", "Go"],
            "languages": ["English", "German", "Polish"],
            "tools": ["Docker", "Git", "PyTorch"],
        },
        "goals": {
            "learning": ["system design", "Kubernetes", "machine learning"],
            "career": "ML engineering",
            "short_term": "find study group for exam prep",
            "here_to": "meet people in my courses and find study partners",
        },
        "availability": {
            "preferred_times": ["evenings", "weekends"],
            "study_style": "pair",
            "timezone": "CET",
        },
        "events": {"attended": [], "interested": [], "categories": []},
        "bio": "International CS student at TU Darmstadt. Love hackathons, climbing, and building things.",
        "_archetype": "active_networker",
    }
    users["user_demo"] = demo

    return users

# ---------------------------------------------------------------------------
# 2. Generate events and assign participants
# ---------------------------------------------------------------------------

def generate_events(users: dict):
    print("  Generating 25 events ...")
    events: dict[str, dict] = {}
    all_user_ids = [u for u in users if u != "user_demo"]

    # Group users by program for clustering
    by_program: dict[str, list[str]] = {}
    for u_id, u in users.items():
        by_program.setdefault(u["program"], []).append(u_id)

    # Track how many events each user attends (for archetype limits)
    user_event_count: dict[str, int] = {u: 0 for u in users}
    archetype_max = {
        "social_butterfly": 10, "focused_student": 3, "new_arrival": 2,
        "active_networker": 7, "lurker": 1,
    }

    for idx, edef in enumerate(EVENT_DEFS, start=1):
        cat = edef["cat"]
        lo, hi = PARTICIPANT_RANGE[cat]
        target_size = random.randint(lo, hi)

        # Start date: lectures are recurring (past), others scatter
        if cat == "lecture":
            start = NOW - timedelta(days=random.randint(14, 60))
        elif cat in ("seminar", "hackathon"):
            start = NOW + timedelta(days=random.randint(-30, 45))
        elif cat == "club":
            start = NOW + timedelta(days=random.randint(-14, 30))
        else:  # social
            start = NOW + timedelta(days=random.randint(-20, 40))

        # Set a reasonable hour
        start = start.replace(hour=random.choice([9, 10, 14, 16, 18]), minute=0, second=0)
        duration_h = {"lecture": 2, "seminar": 3, "hackathon": 24, "club": 2, "social": 3}[cat]
        end = start + timedelta(hours=duration_h)

        # Pick participants with program clustering for lectures
        eligible = [u for u in all_user_ids
                    if user_event_count[u] < archetype_max.get(users[u]["_archetype"], 5)]

        participants: list[str] = []
        if cat == "lecture":
            # 50% of slots from users in a common program
            dominant_prog = random.choice(PROGRAMS)
            prog_users = [u for u in eligible if users[u]["program"] == dominant_prog]
            cluster_take = min(len(prog_users), target_size // 2)
            participants.extend(random.sample(prog_users, cluster_take))

        # Fill remaining with random eligible users
        remaining = [u for u in eligible if u not in participants]
        fill = min(len(remaining), target_size - len(participants))
        participants.extend(random.sample(remaining, fill))

        event_id = eid(idx)
        creator = random.choice(participants) if participants else "user_demo"
        events[event_id] = {
            "id": event_id,
            "title": edef["title"],
            "description": edef["desc"],
            "location": random.choice(LOCATIONS),
            "start_time": iso(start),
            "end_time": iso(end),
            "category": cat,
            "created_by": creator,
            "participants": participants,
        }

        # Update user records
        for p in participants:
            user_event_count[p] += 1
            is_past = start < NOW
            if is_past:
                users[p]["events"]["attended"].append(event_id)
            else:
                users[p]["events"]["interested"].append(event_id)
            if cat not in users[p]["events"]["categories"]:
                users[p]["events"]["categories"].append(cat)

    # Ensure demo user is in at least 6 events
    demo_events = users["user_demo"]["events"]["attended"] + users["user_demo"]["events"]["interested"]
    event_ids_list = list(events.keys())
    random.shuffle(event_ids_list)
    for ev_id in event_ids_list:
        if len(demo_events) >= 6:
            break
        if ev_id not in demo_events:
            events[ev_id]["participants"].append("user_demo")
            is_past = datetime.fromisoformat(events[ev_id]["start_time"]) < NOW
            if is_past:
                users["user_demo"]["events"]["attended"].append(ev_id)
            else:
                users["user_demo"]["events"]["interested"].append(ev_id)
            cat = events[ev_id]["category"]
            if cat not in users["user_demo"]["events"]["categories"]:
                users["user_demo"]["events"]["categories"].append(cat)
            demo_events.append(ev_id)

    return events

# ---------------------------------------------------------------------------
# 3. Generate groups
# ---------------------------------------------------------------------------

def generate_groups(events: dict, users: dict, count: int = 40):
    print(f"  Generating {count} groups ...")
    groups: dict[str, dict] = {}
    # Distribute groups across events that have enough participants
    eligible_events = [e for e in events.values() if len(e["participants"]) >= 4]
    random.shuffle(eligible_events)

    g_idx = 0
    while g_idx < count and eligible_events:
        ev = eligible_events[g_idx % len(eligible_events)]
        size = random.randint(3, min(6, len(ev["participants"])))
        members = random.sample(ev["participants"], size)
        looking = random.choice([0, 0, 0, 1, 2, 3])  # bias toward full

        prefix = random.choice(GROUP_NAME_PREFIXES)
        suffix = random.choice(GROUP_NAME_SUFFIXES)
        cat_label = ev["category"].title()
        g_name = f"{ev['title'].split()[0]} {prefix} {suffix}"

        g_idx += 1
        group_id = gid(g_idx)
        groups[group_id] = {
            "id": group_id,
            "name": g_name,
            "event_id": ev["id"],
            "members": members,
            "looking_for": looking,
            "description": f"{prefix} for {ev['title']}",
        }

    return groups

# ---------------------------------------------------------------------------
# 4. Generate connections
# ---------------------------------------------------------------------------

def generate_connections(users: dict, events: dict, count: int = 150):
    print(f"  Generating {count} connections ...")
    connections: list[dict] = []
    seen_pairs: set[tuple[str, str]] = set()

    # Build co-attendance map for biasing
    coattend: dict[tuple[str, str], int] = {}
    for ev in events.values():
        parts = ev["participants"]
        for i in range(len(parts)):
            for j in range(i + 1, len(parts)):
                pair = tuple(sorted((parts[i], parts[j])))
                coattend[pair] = coattend.get(pair, 0) + 1

    # 70% from co-attendees, 30% random
    coattend_pairs = list(coattend.keys())
    random.shuffle(coattend_pairs)
    all_ids = list(users.keys())

    def add_conn(a: str, b: str, status: str, idx: int) -> dict:
        dt = NOW - timedelta(days=random.randint(0, 60), hours=random.randint(0, 23))
        return {
            "id": cid(idx),
            "requester_id": a,
            "receiver_id": b,
            "status": status,
            "created_at": iso(dt),
        }

    statuses = (["ACCEPTED"] * 60 + ["PENDING"] * 25 + ["REJECTED"] * 15)

    c_idx = 0
    # co-attendance based
    for pair in coattend_pairs:
        if c_idx >= int(count * 0.7):
            break
        if pair in seen_pairs:
            continue
        seen_pairs.add(pair)
        c_idx += 1
        status = random.choice(statuses)
        connections.append(add_conn(pair[0], pair[1], status, c_idx))

    # random connections
    while c_idx < count:
        a, b = random.sample(all_ids, 2)
        pair = tuple(sorted((a, b)))
        if pair in seen_pairs:
            continue
        seen_pairs.add(pair)
        c_idx += 1
        status = random.choice(statuses)
        connections.append(add_conn(a, b, status, c_idx))

    # Ensure demo user has 10+ accepted connections
    demo_accepted = [c for c in connections if
                     c["status"] == "ACCEPTED" and
                     ("user_demo" in (c["requester_id"], c["receiver_id"]))]
    needed = 10 - len(demo_accepted)
    others = [u for u in all_ids if u != "user_demo"]
    random.shuffle(others)
    oi = 0
    while needed > 0 and oi < len(others):
        partner = others[oi]
        oi += 1
        pair = tuple(sorted(("user_demo", partner)))
        if pair in seen_pairs:
            continue
        seen_pairs.add(pair)
        c_idx += 1
        connections.append(add_conn("user_demo", partner, "ACCEPTED", c_idx))
        needed -= 1

    return connections

# ---------------------------------------------------------------------------
# 5. Generate messages
# ---------------------------------------------------------------------------

def generate_messages(connections: list[dict], users: dict, events: dict, count: int = 20):
    print(f"  Generating {count} conversations ...")
    messages: dict[str, list[dict]] = {}

    accepted = [c for c in connections if c["status"] == "ACCEPTED"]
    random.shuffle(accepted)

    # Ensure demo user conversations come first
    demo_conns = [c for c in accepted if "user_demo" in (c["requester_id"], c["receiver_id"])]
    other_conns = [c for c in accepted if "user_demo" not in (c["requester_id"], c["receiver_id"])]
    ordered = demo_conns[:7] + other_conns  # at least 5+ demo conversations

    msg_global_idx = 0
    for conv_idx, conn in enumerate(ordered[:count], start=1):
        conv_id = cvid(conv_idx)
        a = conn["requester_id"]
        b = conn["receiver_id"]

        # Gather context for templates
        a_courses = users[a]["academic"]["courses"]
        b_courses = users[b]["academic"]["courses"]
        shared_courses = list(set(a_courses) & set(b_courses))
        a_prog = users[a]["skills"]["programming"]
        b_prog = users[b]["skills"]["programming"]
        shared_langs = list(set(a_prog) & set(b_prog))
        a_topics = users[a]["interests"]["topics"]

        all_event_titles = [events[e]["title"] for e in events]

        def fill_template(tmpl: str) -> str:
            return (tmpl
                    .replace("{course}", random.choice(shared_courses) if shared_courses else random.choice(COURSES))
                    .replace("{event}", random.choice(all_event_titles))
                    .replace("{lang}", random.choice(shared_langs) if shared_langs else random.choice(PROGRAMMING))
                    .replace("{topic}", random.choice(a_topics) if a_topics else random.choice(TOPICS)))

        n_msgs = random.randint(3, 5)
        base_time = NOW - timedelta(days=random.randint(1, 30))
        conv_messages: list[dict] = []
        sender = a  # first message from requester
        for m in range(n_msgs):
            msg_global_idx += 1
            tmpl = random.choice(MSG_TEMPLATES)
            content = fill_template(tmpl)
            ts = base_time + timedelta(minutes=m * random.randint(5, 120))
            conv_messages.append({
                "id": mid(msg_global_idx),
                "sender_id": sender,
                "content": content,
                "timestamp": iso(ts),
            })
            sender = b if sender == a else a  # alternate

        messages[conv_id] = conv_messages

    return messages

# ---------------------------------------------------------------------------
# 6. Generate notifications
# ---------------------------------------------------------------------------

def generate_notifications(connections: list[dict], events: dict, users: dict):
    print("  Generating notifications ...")
    notifications: dict[str, list[dict]] = {}
    n_idx = 0

    def add_notif(user_id: str, ntype: str, text: str, link: str, ts: str):
        nonlocal n_idx
        n_idx += 1
        entry = {
            "id": nid(n_idx),
            "type": ntype,
            "text": text,
            "link": link,
            "read": random.random() < 0.4,
            "timestamp": ts,
        }
        notifications.setdefault(user_id, []).append(entry)

    # Connection-based notifications
    for c in connections:
        if c["status"] == "PENDING":
            receiver = c["receiver_id"]
            requester_name = users[c["requester_id"]]["name"]
            add_notif(receiver, "connection_request",
                      f"{requester_name} wants to connect with you.",
                      f"/connections", c["created_at"])
        elif c["status"] == "ACCEPTED":
            requester = c["requester_id"]
            receiver_name = users[c["receiver_id"]]["name"]
            add_notif(requester, "connection_accepted",
                      f"{receiver_name} accepted your connection request!",
                      f"/users/{c['receiver_id']}", c["created_at"])

    # Event reminders for upcoming events
    for ev in events.values():
        ev_start = datetime.fromisoformat(ev["start_time"])
        if ev_start > NOW:
            reminder_time = ev_start - timedelta(hours=24)
            for p in random.sample(ev["participants"], min(5, len(ev["participants"]))):
                add_notif(p, "event_reminder",
                          f"Reminder: {ev['title']} starts tomorrow!",
                          f"/events/{ev['id']}", iso(reminder_time))

    # Sort each user's notifications by timestamp descending
    for user_id in notifications:
        notifications[user_id].sort(key=lambda n: n["timestamp"], reverse=True)

    return notifications

# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

def resolve_output_dir() -> Path:
    """Find the project root and return data/seed/ path."""
    # Try common launch locations
    candidates = [
        Path.cwd() / "data" / "seed",                      # project root
        Path.cwd().parent / "data" / "seed",                # from backend/
        Path(__file__).resolve().parent.parent / "data" / "seed",  # relative to script
    ]
    for c in candidates:
        if (c.parent.parent / "CLAUDE.md").exists():
            c.mkdir(parents=True, exist_ok=True)
            return c
    # Fallback: relative to script
    out = Path(__file__).resolve().parent.parent / "data" / "seed"
    out.mkdir(parents=True, exist_ok=True)
    return out

def strip_internal(users: dict) -> dict:
    """Remove internal-only keys before serialisation."""
    cleaned = {}
    for uid_key, u in users.items():
        cleaned[uid_key] = {k: v for k, v in u.items() if not k.startswith("_")}
    return cleaned

def save(path: Path, name: str, data):
    filepath = path / name
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    size_kb = filepath.stat().st_size / 1024
    print(f"    {name:25s} {size_kb:7.1f} KB")

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    print("=" * 60)
    print("  LinkQ Seed Data Generator")
    print("=" * 60)

    users = generate_users(100)
    events = generate_events(users)
    groups = generate_groups(events, users, 40)
    connections = generate_connections(users, events, 150)
    messages = generate_messages(connections, users, events, 20)
    notifications = generate_notifications(connections, events, users)

    out = resolve_output_dir()
    print(f"\n  Writing to: {out}")

    clean_users = strip_internal(users)
    save(out, "users.json", clean_users)
    save(out, "events.json", events)
    save(out, "groups.json", groups)
    save(out, "connections.json", connections)
    save(out, "messages.json", messages)
    save(out, "notifications.json", notifications)

    # Summary
    demo_conns = sum(1 for c in connections
                     if c["status"] == "ACCEPTED"
                     and "user_demo" in (c["requester_id"], c["receiver_id"]))
    demo_events = len(users["user_demo"]["events"]["attended"]) + len(users["user_demo"]["events"]["interested"])
    demo_convs = sum(1 for msgs in messages.values()
                     if any(m["sender_id"] == "user_demo" for m in msgs))

    print("\n  Summary")
    print("  " + "-" * 40)
    print(f"    Users:          {len(clean_users)}")
    print(f"    Events:         {len(events)}")
    print(f"    Groups:         {len(groups)}")
    print(f"    Connections:    {len(connections)}")
    print(f"    Conversations:  {len(messages)}")
    print(f"    Notifications:  {sum(len(v) for v in notifications.values())} (across {len(notifications)} users)")
    print(f"    Demo events:    {demo_events}")
    print(f"    Demo accepted:  {demo_conns}")
    print(f"    Demo convos:    {demo_convs}")
    print("\n  Done!")

if __name__ == "__main__":
    main()
