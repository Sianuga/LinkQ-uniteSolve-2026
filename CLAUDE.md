# LinkQ — Student Event Connection Platform

## What Is This

LinkQ is an **event-centric student networking platform** that connects international students through shared academic events, courses, and interests. Unlike profile-first platforms (LinkedIn, Facebook), LinkQ is **event-first → then connection** — events are the nodes in the social graph, and shared attendance is the basis for meaningful peer discovery.

**One-liner:** "LinkedIn + Event Graph + Campus Matching Engine" for university students.

**Competition entry:** uniteSolve 2026

## Problem

International students lack structured ways to find relevant peers, join study groups, and integrate socially. Existing tools fail:
- **LinkedIn** → too career-focused, not campus-contextual
- **Facebook Groups** → fragmented, noisy, low signal
- **Meetup** → not student/academic-centric
- **Discord** → good for communities, but discovery is weak

The key insight: _"We both attend Advanced Distributed Systems seminar next week"_ is a far stronger connection basis than _"We both go to TU Darmstadt."_

## Target Users

1. **International students** — arrive without networks, need to navigate courses, events, and collaboration
2. **Newcomers** — need accelerated integration into academic and social life
3. **Students struggling with integration** — attend classes without forming connections, miss collaborative opportunities

## Core Concept

- Users have: academic profile (courses, interests, skills) + event history (past + upcoming)
- Events become **connection nodes** in the social graph
- Users can: see who else is attending, connect before attending, form study groups organically
- The system provides a **natural excuse** to reach out: _"Hey, I saw you're also attending X event…"_ — solving cold-start social anxiety

## Tech Stack

- **Frontend:** React + Three.js — web app with mobile-responsive capability
- **3D Engine:** Three.js for the avatar lobby experience
- **Backend:** API-first (see API section below)
- **Vector Store:** ChromaDB — stores user profile embeddings for similarity matching
- **Similarity:** Cosine similarity on segmented embeddings
- **User Data:** JSON documents per user (gathered during onboarding)
- **API spec:** `likQ.postman_collection.json` in repo root

## Central Feature: Onboarding (Meta-Style — Maximum Data Extraction)

The onboarding is a **core differentiator**, not just a setup flow. The goal is to **extract as much user data as possible** while making it feel fun, not like filling out forms. Every piece of data feeds the matching engine. The more we know, the better the matches.

### Onboarding Flow (from `Refs/Onboarding.png`)
1. **Scan European Student Identifier** — verify student identity
2. **Provide module login** — connect academic modules to auto-gather enrolled courses
3. **Motivation + phase** — hobbies, interests, skills, goals, "about me" description, study preferences, languages spoken, availability, collaboration style
4. **Choose events** — select events you've attended or want to join ("Explore events" tab)

The philosophy: **ask for everything**. Courses, hobbies, languages, what they want to learn, what they can teach, when they're free, how they like to study (solo/group/pair), what they struggle with. All of this becomes embedding fuel.

### 3D Avatar Lobby (Game-Style)

Inspired by game lobbies like **Valorant** and **Dead by Daylight**. A visual lobby where users pick an avatar and see other event attendees in a shared 3D space rendered with Three.js.

**Lobby Avatar Characters (5 slots):**
1. **Buff Arnold** — a packed, muscular Schwarzenegger-type character
2. **Banana Guy** — a person in a full banana costume
3. **Anime Girl** — Hatsune Miku-style character with twin tails
4. **Bland Normal Guy** — generic, plain, everyday dude
5. **Mystery Silhouette** — dark silhouette with a question mark (represents "you haven't picked yet" / undecided / the user who hasn't completed onboarding)

The mix is intentionally absurd and fun — it makes the lobby memorable and shareable. Users see these characters standing in the lobby space, representing real attendees of an event.

This transforms a utility app into an **experience** — users want to open the app, not just use it.

## Matching Engine: ChromaDB + Segmented Embeddings

### Why Segmented (Not One Big Embedding)

A single combined embedding for a user's entire profile loses signal — academic interests get diluted by hobbies, skills get averaged with event history. Instead, we create **separate embeddings per dimension** and compute cosine similarity on each independently, then combine with weighted scoring.

### Embedding Segments

Each user's JSON profile is split into these independent embedding vectors stored in ChromaDB:

| Segment | Source Data | Why Separate |
|---------|------------|--------------|
| `academic` | Enrolled courses, degree program, study field, academic goals | Core matching — "same course" is the strongest signal |
| `interests` | Hobbies, personal interests, topics they follow | Social compatibility — what they do outside class |
| `skills` | Technical skills, languages (programming + spoken), tools | Collaboration fit — what they can teach/learn |
| `goals` | What they want to learn, career direction, short-term objectives | Intent matching — aligned ambitions |
| `availability` | Schedule, preferred study times, collaboration style (solo/group/pair) | Practical compatibility — can they actually meet? |
| `events` | Event history (attended + interested), event categories | Behavioral signal — what they actually show up to |

### Matching Flow
1. **Onboarding** → user data collected as JSON → split into segments → each segment embedded → stored in ChromaDB as separate collections (or metadata-filtered)
2. **Match request** (e.g., for an event) → query each segment independently against other attendees → get per-segment cosine similarity scores
3. **Weighted combination** → `total_score = w1*academic + w2*interests + w3*skills + w4*goals + w5*availability + w6*events`
4. **Context-aware weighting** → weights shift based on context (e.g., for a study group match, `academic` weight is higher; for a social event, `interests` weight is higher)

### User Data JSON Structure
```json
{
  "id": "user_123",
  "name": "...",
  "university": "...",
  "program": "...",
  "academic": {
    "courses": ["Distributed Systems", "Machine Learning"],
    "degree": "M.Sc. Computer Science",
    "semester": 3,
    "thesis_topic": "..."
  },
  "interests": {
    "hobbies": ["climbing", "photography"],
    "topics": ["AI ethics", "open source"],
    "music": "...",
    "sports": "..."
  },
  "skills": {
    "programming": ["Python", "TypeScript", "Go"],
    "languages": ["English", "German", "Polish"],
    "tools": ["Docker", "Kubernetes"]
  },
  "goals": {
    "learning": ["Rust", "system design"],
    "career": "ML engineering",
    "short_term": "find study group for exam prep"
  },
  "availability": {
    "preferred_times": ["evenings", "weekends"],
    "study_style": "pair",
    "timezone": "CET"
  },
  "events": {
    "attended": ["event_001", "event_002"],
    "interested": ["event_003"],
    "categories": ["hackathon", "seminar"]
  },
  "avatar": "banana_guy"
}

## MVP Scope (Sharp Entry Point)

**"Find people attending the same academic events and courses as you"**

MVP features:
- Event page with attendee list
- Filter by degree, interests
- Simple "connect" button
- Smart matching: "People you should meet at this event"

**Delay until post-MVP:** study group auto-formation, academic timeline/portfolio.

## User Flows (Reference Diagrams)

Reference wireframes are in `Refs/`:

### Onboarding (`Refs/Onboarding.png`)
Start → Scan European Student Identifier → Provide module login → Motivation + hobbies/interests/skills/goals/about me → Choose events you've attended/want to join → Explore events tab

### Matchmaking for Event (`Refs/Matchmaking.png`)
Start → Search for an event → Click "I'm looking for people" → Get assigned to "game lobby" and complete form → Filter to connect and start pairing → "My events" tab/page shows the next event you signed up for

### Connecting with People (`Refs/Connecting.png`)
Start → Search for an event → Search people on the event → Click connect (wait for approval) / message for more → Notification that someone accepted

## API Endpoints (from Postman Collection)

Base URL: `{{baseUrl}}` (configurable)

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | - | Register user `{name, email, password}` |
| POST | `/auth/login` | - | Login → returns `{token}` |
| GET | `/me` | Bearer | Get current user profile |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/:id` | - | Get user profile → `{id, name, university, program, avatar_url}` |
| GET | `/users/:id/compare/:targetId?event_id=` | - | Compare two profiles → `{match_score, shared{events,interests}, differences{only_me,only_them}}` |

### Events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/events?university=` | - | List events (filter by university) |
| POST | `/events` | Bearer | Create event |
| GET | `/events/:id` | - | Get event details → `{id, title, description, location, start_time, end_time, parent_event_id}` |
| POST | `/events/:id/join` | Bearer | Join event |
| GET | `/events/:id/participants` | - | Get event participants → `[{id, name, university, program, avatar_url}]` |
| GET | `/events/:id/matches` | - | Get swipe candidates → `[{user_id, name, avatar, match_score, shared{events,interests}}]` |

### Sub-events
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/events/:id/subevents` | - | List sub-events |
| POST | `/events/:id/subevents` | Bearer | Create sub-event |

### Connections
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/connections` | Bearer | Send connection request `{target_user_id}` |
| GET | `/connections` | Bearer | Get connections list → `[{id, requester_id, receiver_id, status}]` |
| PATCH | `/connections/:id` | Bearer | Update connection status `{status: "ACCEPTED"|"REJECTED"}` |

### Swipes
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/swipes` | Bearer | Record swipe action `{target_user_id, event_id, action: "LIKE"|"PASS"}` |

## Complete Screen Map

Every screen the app needs, organized by flow. Each screen listed with its route, what it shows, and what actions are available.

### A. Pre-Auth Screens

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| A1 | **Splash / Landing** | `/` | App logo, tagline, animated background. Two CTAs: "Get Started" → Register, "I have an account" → Login |
| A2 | **Register** | `/register` | Form: name, email, password. On success → Onboarding flow |
| A3 | **Login** | `/login` | Form: email, password. On success → Home (if onboarded) or Onboarding (if not) |

### B. Onboarding Screens (Sequential, Must Complete All)

The onboarding is a **linear wizard** — each step is a full screen with progress indicator at top. Users cannot skip steps. Every field feeds the matching engine.

| # | Screen | Route | What It Collects | UI Notes |
|---|--------|-------|-----------------|----------|
| B1 | **Student ID Scan** | `/onboarding/verify` | European Student Identifier scan/upload | Camera integration or file upload. Validates student status. Skip option for demo? |
| B2 | **Module Login** | `/onboarding/modules` | University module credentials | Auto-imports enrolled courses. Shows "Importing..." animation, then list of detected courses for confirmation |
| B3 | **About You — Basics** | `/onboarding/basics` | Name display, program, semester, university (pre-filled from ID if possible) | Quick confirmation step, light edits |
| B4 | **About You — Interests** | `/onboarding/interests` | Hobbies, personal topics, music, sports, "about me" free text | Tag picker (pre-built list + custom), multi-select chips. Make it feel like a quiz, not a form |
| B5 | **About You — Skills** | `/onboarding/skills` | Programming languages, spoken languages, tools, "what I can teach" | Tag picker with categories. Separate section for "what I struggle with / want help on" |
| B6 | **About You — Goals** | `/onboarding/goals` | What they want to learn, career direction, short-term goal (free text), why they're here | Mix of chips + free text. "I'm here to..." prompt |
| B7 | **Study Preferences** | `/onboarding/preferences` | Preferred study times, collaboration style (solo/pair/group), availability windows | Visual time grid selector + style picker (icons for solo/pair/group) |
| B8 | **Avatar Picker** | `/onboarding/avatar` | Selected avatar character | 3D preview of all 5 characters (Buff Arnold, Banana Guy, Anime Girl, Bland Normal Guy, Mystery Silhouette). Tap to spin/preview. Pick one. This is the fun payoff moment |
| B9 | **Event Browser** | `/onboarding/events` | Events they've attended or want to attend | Scrollable list/grid of seeded events. Multi-select. Categories: lectures, seminars, hackathons, clubs. "Explore more" CTA |
| B10 | **Onboarding Complete** | `/onboarding/done` | Nothing — celebration screen | Confetti/animation, "You're ready!", shows match count preview ("12 people match with you"), CTA → Home |

### C. Main App Screens (Bottom Navigation)

| # | Screen | Route | Tab | Description |
|---|--------|-------|-----|-------------|
| C1 | **Home** | `/home` | Home | Dashboard: upcoming events (horizontal scroll cards), match summary ("5 new matches"), suggested events (vertical cards), quick actions |
| C2 | **Explore** | `/explore` | Explore | Search bar + filter chips. Browse events by category, discover people. Two sub-views: "Events" and "People" toggle |
| C3 | **Events List** | `/events` | Events | "My Events" (joined/upcoming) + "All Events" toggle. Cards with title, location, time, attendee count. FAB to create event |
| C4 | **Messages** | `/messages` | Messages | Conversation list: avatar, name, last message, timestamp, unread badge. Tap → Chat screen |
| C5 | **My Profile** | `/profile` | Profile | Own avatar (80px), name, program, interest tags, event timeline (vertical dots), events joined grid (2 columns). Edit button → Edit Profile |

### D. Event Screens

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| D1 | **Event Detail — Overview** | `/events/:id` | Header image (optional), title (H1), location, time, attendee count, description. Buttons: "Join Event" / "Message". Tab bar below: Overview / People / Sub-events / Matches |
| D2 | **Event Detail — People** | `/events/:id/people` | Filter chips (Same Program, Same Interests, Top Match). List: avatar (40px), name (H3), interest tags, match progress bar (0-100% animated), Connect button. 12px spacing between items |
| D3 | **Event Detail — Sub-events** | `/events/:id/subevents` | "+ Create Sub-event" button at top. List of sub-event cards: title, description, attendee count, chevron →. Tap → Sub-event detail (reuses D1 layout) |
| D4 | **Event Detail — Matches (Swipe)** | `/events/:id/matches` | **Full-screen takeover.** Tinder-style card stack. Top card interactive, next card peeking behind. Card: avatar image (tappable), name, program, "87% Match" badge, shared highlights (events/courses/interests count), interest tags. Bottom overlay: Pass (X) / Save (star) / Connect (heart). Swipe right → connect, left → skip. Empty state when deck exhausted |
| D5 | **Create Event** | `/events/create` | Form: title, description, location, date/time picker, category select. Submit → event created |
| D6 | **Create Sub-event** | `/events/:id/subevents/create` | Same as D5 but linked to parent event |

### E. Profile & Connection Screens

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| E1 | **Other User Profile** | `/users/:id` | Their avatar (80px), name, program, interest tags, event timeline, events joined. Action bar: Connect / Message / Compare |
| E2 | **Profile Comparison** | `/users/:id/compare` | Side-by-side: You (left) vs Them (right) — avatars, names, programs. Center: animated match % ring. Shared section: events, courses, interests (Accent Blue highlight). Differences: "Only You" / "Only Them" (subtle gray). Actions: Connect, Message, Invite to Sub-event |
| E3 | **Edit Profile** | `/profile/edit` | Edit all onboarding fields: interests, skills, goals, availability, avatar. Same UI as onboarding steps but pre-filled. Save → update embeddings in ChromaDB |
| E4 | **Connection Requests** | `/connections` | Two tabs: "Received" (pending requests with Accept/Reject) and "My Connections" (accepted list). Notification badge drives here |

### F. Messaging Screens

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| F1 | **Chat** | `/messages/:id` | Top bar: avatar + name + match %. Message bubbles. Input bar with send button. Shows shared context chip at top ("You're both attending Advanced Systems") |

### G. 3D Lobby Screen

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| G1 | **Event Lobby** | `/events/:id/lobby` | Three.js rendered 3D space. Avatar characters standing around representing real event attendees. Tap an avatar → shows name + match % overlay → tap again → E1 (their profile). Entry point: from Event Detail "Enter Lobby" button. Shows who's "here" for the event in a visual, game-like way |

### H. Utility Screens

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| H1 | **Notifications** | `/notifications` | List: connection accepted, new match, event reminder, message received. Tap → relevant screen |
| H2 | **Settings** | `/settings` | Account, notification preferences, privacy, logout, delete account |

### Screen Count Summary
- Pre-Auth: 3
- Onboarding: 10
- Main Tabs: 5
- Event: 6
- Profile/Connection: 4
- Messaging: 1
- 3D Lobby: 1
- Utility: 2
- **Total: 32 screens**

## Seed Data Generation Plan

The app is useless without populated data. For development, demos, and the competition, we need a **realistic dataset** of fake users, events, and interactions that exercises every screen and the matching engine.

### What We Need to Generate

#### 1. Users (50-100 fake profiles)
Each user needs a **complete JSON profile** matching the schema (see User Data JSON Structure above). Generated data must be:
- **Diverse:** mix of nationalities, programs, semesters, interests, skills, languages
- **Realistic to TU Darmstadt:** real course names, real program names, plausible combinations
- **Overlapping:** users must share courses, interests, and events with each other — otherwise matching produces nothing. Aim for clusters of 5-10 users with high overlap per event
- **Avatar distributed:** spread across all 5 avatar types

Each user JSON includes:
```json
{
  "id": "user_001",
  "name": "Akira Tanaka",
  "email": "akira.tanaka@stud.tu-darmstadt.de",
  "university": "TU Darmstadt",
  "program": "M.Sc. Computer Science",
  "semester": 2,
  "avatar": "anime_girl",
  "academic": {
    "courses": ["Distributed Systems", "Machine Learning", "Computer Vision"],
    "degree": "M.Sc. Computer Science",
    "semester": 2,
    "thesis_topic": null
  },
  "interests": {
    "hobbies": ["anime", "gaming", "cooking"],
    "topics": ["generative AI", "robotics"],
    "music": "j-pop",
    "sports": "badminton"
  },
  "skills": {
    "programming": ["Python", "C++", "Julia"],
    "languages": ["Japanese", "English", "German (A2)"],
    "tools": ["PyTorch", "ROS2", "Docker"]
  },
  "goals": {
    "learning": ["Rust", "embedded systems"],
    "career": "robotics research",
    "short_term": "find study partner for ML exam"
  },
  "availability": {
    "preferred_times": ["afternoons", "evenings"],
    "study_style": "pair",
    "timezone": "CET"
  },
  "events": {
    "attended": ["event_001", "event_005"],
    "interested": ["event_008", "event_012"],
    "categories": ["seminar", "hackathon"]
  }
}
```

#### 2. Events (20-30 events)
Mix of real-feeling academic and social events:

| Category | Examples | Count |
|----------|----------|-------|
| **Lectures/Courses** | "Distributed Systems Lecture", "ML Lab Session" | 8-10 |
| **Seminars** | "Advanced Topics in NLP", "Systems Security Seminar" | 5-6 |
| **Hackathons** | "TU Darmstadt HackaTUM", "AI for Good Hack" | 3-4 |
| **Student Clubs** | "International Students Meetup", "Robotics Club Workshop" | 4-5 |
| **Social** | "Welcome Week Pub Quiz", "Language Exchange Café" | 3-4 |

Each event needs: id, title, description, location (real TU Darmstadt buildings: S1|01, S2|02, Piloty building, Lichtwiese), start_time, end_time, category, attendee list (user IDs).

Some events should have **sub-events** (e.g., a hackathon with "Team Formation", "Workshop: Intro to APIs", "Final Demos").

#### 3. Connections & Swipes (interaction history)
- ~100-200 connection records (mix of PENDING, ACCEPTED, REJECTED)
- ~300-500 swipe records (LIKE/PASS per event context)
- Some mutual likes (both users swiped LIKE on each other) → auto-accepted connections
- Ensures the Messages screen and Connection Requests screen have data

#### 4. Messages (conversation stubs)
- 15-20 conversations between connected users
- 3-5 messages each, realistic opener: "Hey, saw you're also in Distributed Systems!"
- Shows the messaging screen isn't empty

#### 5. Pre-computed Match Scores
- For each event, pre-compute match scores between all attendee pairs
- Store alongside the swipe candidate data so the match % displays immediately
- Scores should reflect actual overlap in the generated data (not random)

### Generation Approach
- Write a **Python script** (`scripts/generate_seed_data.py`) that:
  1. Generates user profiles from templates + randomization (use pools of real course names, hobby lists, skill lists, nationalities)
  2. Creates events with realistic details
  3. Assigns users to events (with intentional clustering for overlap)
  4. Generates connections and swipe history
  5. Generates message stubs
  6. Computes match scores per segment using the same cosine similarity logic the app will use
  7. Outputs everything as JSON files to `data/seed/`
  8. Optionally loads into ChromaDB for embedding generation

### Output Files
```
data/seed/
  users.json          — all user profiles
  events.json         — all events with sub-events
  connections.json    — connection records
  swipes.json         — swipe history
  messages.json       — conversation stubs
  match_scores.json   — pre-computed pairwise scores per event
```

### Data Pools (for realistic generation)
The script should draw from curated pools:
- **Programs:** M.Sc. Computer Science, M.Sc. Data Science, B.Sc. Electrical Engineering, M.Sc. Mechanical Engineering, M.Sc. Information Systems, B.Sc. Mathematics, etc.
- **Courses:** real TU Darmstadt CS/engineering course names
- **Nationalities/Names:** diverse international mix (Indian, Chinese, Japanese, Korean, Turkish, Brazilian, Nigerian, Polish, Italian, German, etc.)
- **Hobbies:** climbing, photography, cooking, gaming, reading, cycling, hiking, music production, chess, etc.
- **Programming languages:** Python, TypeScript, Java, C++, Rust, Go, Julia, R, Kotlin, etc.
- **Spoken languages:** English, German, Hindi, Mandarin, Japanese, Turkish, Portuguese, Arabic, Polish, etc.
- **Avatar types:** buff_arnold, banana_guy, anime_girl, bland_normal_guy, mystery_silhouette

## Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| Primary Blue | `#1E3A8A` | Buttons, active states, tags |
| Secondary Blue | `#3B82F6` | Highlights, links |
| Accent Blue | `#93C5FD` | Shared items highlight, badges |
| Background | `#F8FAFC` | Page background |
| Surface | `#FFFFFF` | Cards, modals |
| Border | `#E5E7EB` | Dividers, secondary buttons |
| Text Primary | `#111827` | Headings, body text |
| Text Secondary | `#6B7280` | Captions, metadata |
| Success | `#10B981` | Confirmations |

### Typography (Inter / SF Pro)
- H1: 24px / Bold
- H2: 20px / Semibold
- H3: 16px / Semibold
- Body: 14px / Regular
- Caption: 12px / Medium

### Spacing (8pt grid)
XS: 4px, SM: 8px, MD: 16px, LG: 24px, XL: 32px

### Components
- **Button Primary:** bg `#1E3A8A`, text white, radius 12px, padding 12x16
- **Button Secondary:** border 1px `#E5E7EB`, bg white
- **Card:** bg white, radius 16px, shadow `0 4px 12px rgba(0,0,0,0.05)`, padding 16px
- **Match Card:** radius 20px, stronger shadow, match badge top-right (blue gradient), bottom gradient overlay
- **Tag:** bg `#EFF6FF`, text `#1E3A8A`, radius 999px, padding 4x10

### Micro-interactions
- Button press → scale 0.97
- Connect → checkmark animation + fade
- Match bar → animate 0 → %
- Card hover → subtle lift
- Swipe → smooth rotation + opacity fade
- Match % → animated on card appear
- Card stack → slight parallax
- Connect → heart animation + subtle vibration (mobile)

### Empty States
Minimal illustration + "No one here yet" + `[Invite classmates]` CTA

### Design Principle
> "People don't browse. They scan."
> UI must instantly show: who is attending, who matches them, what to do next. Everything else is secondary.

## Key Differentiators

1. **Contextual networking** — high-intent matching based on shared events/courses
2. **Event-centric identity** — event-first, not profile-first
3. **Cold-start anxiety solver** — events provide natural conversation openers
4. **3D avatar lobby** — game-like social presence (Valorant/DBD-inspired), makes the platform feel alive
5. **Fun onboarding** — Meta-style data gathering that feels like play, not a form

## Future Features (Post-MVP)

- **Event Graph** — visualize who attended what, shared history
- **Study Group Auto-Formation** — 5 students in same course → auto-suggest group
- **Academic Timeline** — courses + events + projects as lightweight portfolio
- **Campus Layer** — identity, collaboration, discovery, networking for universities

## Known Risks

- **Scope creep** — profiles + events + networking + study groups = 4 products. Stay focused on MVP.
- **Chicken-and-egg** — needs users to create value, needs events to attract users. Seed with real events (lectures, seminars, hackathons, student clubs).
- **Existing tool overlap** — must clearly answer "why switch from Moodle / WhatsApp / Discord?"

## Development Guidelines

- Keep profiles lightweight: name, program, interests (tags), events joined
- Matching intelligence is the **moat** — invest here
- Seed real events early — if events are empty, the product dies
- Mobile-first design, follow the Figma spec closely
