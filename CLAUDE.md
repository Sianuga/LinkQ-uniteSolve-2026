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

### Decisions Made
- **Frontend:** React + Three.js — web app with mobile-responsive capability
- **Build Tool:** Vite (fast HMR, tree-shaking for Three.js, minimal config)
- **Language:** TypeScript (mandatory — 32 screens + matching engine demand type safety)
- **Styling:** Tailwind CSS (rapid design token implementation)
- **3D Engine:** React Three Fiber (R3F) + Drei — declarative Three.js in React
- **Backend:** FastAPI (Python) — async, ChromaDB-compatible
- **Vector Store:** ChromaDB — stores user profile embeddings for similarity matching
- **Similarity:** Cosine similarity on semantic segments + Jaccard on categorical data
- **Embedding Model:** `sentence-transformers/all-MiniLM-L6-v2` (384 dims, free, local, fast — ideal for MVP)
- **User Data:** JSON documents per user (gathered during onboarding)
- **API spec:** `likQ.postman_collection.json` in repo root

### Frontend Libraries
| Concern | Library | Why |
|---------|---------|-----|
| Routing | React Router v6 | Nested layouts, route guards, 32 screens |
| State (UI) | Zustand | Lightweight, modular stores (auth, user, events) |
| State (server) | TanStack Query | Caching, refetching, optimistic updates for API data |
| Animation | Framer Motion | Page transitions, match bar fills, connect animations |
| 3D | React Three Fiber + Drei | Declarative Three.js for avatar lobby |
| Forms | React Hook Form + Zod | Schema validation for onboarding wizard |
| HTTP | Axios | Interceptors for auth token, error handling |

### Project Structure
```
src/
├── pages/              # Route-level components (organized by flow)
│   ├── auth/           # Splash, Register, Login
│   ├── onboarding/     # 6-step wizard
│   ├── app/            # Main tabs (Home, Explore, Events, Messages, Profile)
│   ├── events/         # Event detail, people, groups, create, lobby
│   ├── profile/        # User profiles, comparison, edit, connections
│   └── utility/        # Notifications, Settings
├── components/
│   ├── ui/             # Button, Badge, Tag, Avatar, Input, Card, Modal
│   ├── domain/         # MatchCard, EventCard, ProfileHeader, ConnectionRequest
│   ├── layout/         # BottomNav, Header, WizardShell
│   └── 3d/             # AvatarModel, LobbyScene (R3F wrappers)
├── features/           # Feature-scoped state + logic
│   ├── onboarding/     # Store, hooks, validation
│   ├── events/         # Event API, filters
│   ├── matching/       # Match scoring, group matching
│   ├── messaging/      # Chat state
│   └── profile/        # Profile updates
├── services/           # API client, utilities
│   ├── api.ts          # Axios instance + endpoint wrappers
│   └── matching.ts     # Cosine similarity, Jaccard, weighting
├── store/              # Zustand stores (auth, user, events, notifications)
├── types/              # TypeScript interfaces (User, Event, Connection, Match, Group)
├── hooks/              # Custom hooks (useEvent, useMatches, useAuth)
├── styles/             # Tailwind config, global CSS, design tokens
└── main.tsx
```

## Central Feature: Onboarding (Meta-Style — Maximum Data Extraction)

The onboarding is a **core differentiator**, not just a setup flow. The goal is to **extract as much user data as possible** while making it feel fun, not like filling out forms. Every piece of data feeds the matching engine. The more we know, the better the matches.

The philosophy: **ask for everything**. Courses, hobbies, languages, what they want to learn, what they can teach, when they're free, how they like to study (solo/group/pair), what they struggle with. All of this becomes embedding fuel.

### Onboarding Flow (from `Refs/Onboarding.png`)

Consolidated from 10 steps to **6 steps** to reduce drop-off while keeping data collection. Avatar picker moved early (step 2) as the fun hook.

1. **Scan European Student Identifier** — verify student identity. Camera/upload + manual fallback if scan fails.
2. **Avatar Picker** — pick your lobby character. Fun payoff early to hook users. 3D preview, tap to spin.
3. **Module Login (OAuth)** — connect via `POST /oauth` to auto-gather enrolled courses. Shows importing animation, then course list for confirmation. **Fallback:** manual course entry if OAuth fails.
4. **About You** — multi-tab screen combining basics, interests, skills, goals in one place. Tabs: Profile / Interests / Skills / Goals. Tag pickers (pre-built + custom), free text "about me", "I'm here to..." prompt.
5. **Study Preferences** — preferred times (visual time grid), collaboration style (solo/pair/group icons), availability windows, spoken languages.
6. **Event Browser + Done** — browse/select events (scrollable grid, category filters). On submit → celebration screen with confetti, match count preview, CTA → Home.

### 3D Avatar Lobby (Visual-Only)

Inspired by game lobbies like **Valorant** and **Dead by Daylight**. A **visual-only** 3D scene where users pick an avatar and see other event attendees in a shared space rendered with React Three Fiber. **No backend implementation needed** — the lobby uses the event participants list from `GET /events/:id/participants` and renders avatars client-side.

**Lobby Avatar Characters (5 slots):**
1. **Buff Arnold** — a packed, muscular Schwarzenegger-type character
2. **Banana Guy** — a person in a full banana costume
3. **Anime Girl** — Hatsune Miku-style character with twin tails
4. **Bland Normal Guy** — generic, plain, everyday dude
5. **Mystery Silhouette** — dark silhouette with a question mark (user hasn't picked yet / hasn't completed onboarding)

The mix is intentionally absurd and fun — makes the lobby memorable and shareable.

**Art Direction (to be decided before 3D production):**
- **Art style:** Stylized/cartoon low-poly recommended (performant, forgiving, scalable)
- **Proportions:** Consistent across all 5 (e.g., 4-head-tall chibi or 6-head stylized)
- **Format:** GLTF/GLB (standard for Three.js)
- **Polygon budget:** Max 3K triangles per character (mobile-safe)
- **Textures:** 512x512 max, KTX2 compressed
- **Idle animations:** Per-character unique (Arnold flexing, Banana wobbling, Miku head-bobbing, Normal Guy checking phone, Silhouette glitching)
- **Model source:** Asset store (Sketchfab) or Mixamo + custom, or commission from 3D artist
- **Environment:** Simple abstract/stylized space (not realistic campus — keep it light and fast)
- **Camera:** Fixed isometric or slight orbit, not free-roam
- **Interaction:** Tap avatar → name + match % floating label → tap again → their profile

**Performance Strategy:**
- Code-split Three.js — lazy load only on lobby route (`React.lazy()`)
- Scene budget: 15K triangles total (5 avatars)
- Baked lighting only, no real-time shadows
- GPU instancing for duplicate avatar types
- Auto-pause rendering on tab blur / 5min idle
- 2D fallback grid for devices without WebGL
- Proper cleanup in useEffect (dispose geometry, materials, textures)
- Target: 60fps desktop, 30fps mobile

## Matching Engine: ChromaDB + Segmented Embeddings

### Why Segmented (Not One Big Embedding)

A single combined embedding loses signal — academic interests get diluted by hobbies, skills get averaged with event history. Instead, we create **separate embeddings per semantic dimension** and use **Jaccard similarity for categorical data**, then combine with weighted scoring.

### Embedding Segments

| Segment | Type | Source Data | Method |
|---------|------|------------|--------|
| `academic` | **Semantic** | Courses, degree, study field, academic goals → templated into natural language | Cosine similarity on embeddings |
| `interests` | **Semantic** | Hobbies, topics, music, sports, "about me" → templated into natural language | Cosine similarity on embeddings |
| `goals` | **Semantic** | Learning goals, career direction, short-term objectives, "I'm here to..." | Cosine similarity on embeddings |
| `events` | **Semantic** | Event titles attended/interested, event categories | Cosine similarity on embeddings |
| `skills` | **Categorical** | Programming languages, spoken languages, tools | Jaccard similarity (set overlap) |
| `availability` | **Categorical** | Schedule slots, study style, timezone | Slot matching (direct comparison) |

### Document Preparation (Text Templating)
Structured data must become readable text before embedding:
```
Academic: "M.Sc. Computer Science student studying Distributed Systems, Machine Learning, and Computer Vision. Interested in AI research."
Interests: "Enjoys climbing and photography. Follows AI ethics and open source. Listens to j-pop. Plays badminton."
Goals: "Wants to learn Rust and system design. Career goal: ML engineering. Currently looking for a study group for exam prep."
Events: "Attended hackathons and seminars. Been to AI Workshop and Distributed Systems Lecture."
```

### Matching Flow
1. **Onboarding** → user data collected as JSON → semantic segments templated into text → embedded with `all-MiniLM-L6-v2` → stored in ChromaDB (1 collection, metadata-filtered by segment type + user_id)
2. **Match request** (`POST /match`) → query semantic segments with cosine similarity + compute Jaccard on categorical segments → get per-segment scores
3. **Weighted combination** → `total_score = w1*academic + w2*interests + w3*goals + w4*events + w5*skills + w6*availability`
4. **Context-aware weighting** → weights shift by event category:
   - Seminar/lecture: `{academic: 0.35, interests: 0.15, goals: 0.20, events: 0.15, skills: 0.10, availability: 0.05}`
   - Hackathon: `{academic: 0.15, interests: 0.15, goals: 0.20, events: 0.10, skills: 0.30, availability: 0.10}`
   - Social: `{academic: 0.10, interests: 0.40, goals: 0.10, events: 0.20, skills: 0.05, availability: 0.15}`
5. **Recompute:** Delta-update on profile edit (re-embed only changed segments). Use ChromaDB `upsert()`.

### ChromaDB Design
- **1 collection** with metadata filters (not 6 separate collections)
- Metadata per document: `{user_id, segment_type, event_ids[], avatar_type}`
- Filter: `where: {"segment_type": "academic", "user_id": {"$ne": "current_user"}}`
- Distance metric: cosine
- Deployment: in-process Python for MVP, client-server for production

### Cold-Start Handling
New users with minimal data get poor cosine similarity. Mitigations:
- Bias toward shared event IDs (exact match) before embedding similarity
- Assign new users to clusters by program/university first
- Show "complete your profile for better matches" prompt when data is sparse

### User Data JSON Structure
```json
{
  "id": "user_123",
  "name": "...",
  "email": "...",
  "university": "...",
  "program": "...",
  "semester": 3,
  "avatar": "banana_guy",
  "onboarding_complete": true,
  "academic": {
    "courses": ["Distributed Systems", "Machine Learning"],
    "degree": "M.Sc. Computer Science",
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
    "short_term": "find study group for exam prep",
    "here_to": "meet people in my courses and find study partners"
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
  "bio": "..."
}
```

## User Flows (Reference Diagrams)

Reference wireframes are in `Refs/`:

### Onboarding (`Refs/Onboarding.png`)
Start → Scan European Student Identifier → Avatar Picker → Module OAuth login → About You (multi-tab) → Study Preferences → Event Browser + Celebration

### Matchmaking for Event (`Refs/Matchmaking.png`)
Start → Search for an event → Click "I'm looking for people" → Enter game lobby (visual) → Browse matched people → Connect with button → "My events" tab shows next event

### Connecting with People (`Refs/Connecting.png`)
Start → Search for an event → Browse people on the event → Click Connect (wait for approval) / message for more → Notification that someone accepted

## API Endpoints

Base URL: `{{baseUrl}}` (configurable). Full spec in `likQ.postman_collection.json`.

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | - | Register user `{name, email, password}` |
| POST | `/auth/login` | - | Login → returns `{token}` |
| GET | `/me` | Bearer | Get current user profile |
| POST | `/oauth` | OAuth | OAuth from module — auto-import courses |

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
| GET | `/events/:id` | - | Get event details → `{id, title, description, location, start_time, end_time}` |
| POST | `/events/:id/join` | Bearer | Join event |
| GET | `/events/:id/participants` | - | Get event participants → `[{id, name, university, program, avatar_url}]` |
| GET | `/events/:id/matches` | - | Get match candidates → `[{user_id, name, avatar, match_score, shared{events,interests}}]` |

### Connections
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/connections` | Bearer | Send connection request `{target_user_id}` |
| GET | `/connections` | Bearer | Get connections list → `[{id, requester_id, receiver_id, status}]` |
| PATCH | `/connections/:id` | Bearer | Update connection status `{status: "ACCEPTED"|"REJECTED"}` |

### Groups
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/group/:id` | Bearer | Get group members → `{id, name, university, program, avatar_url}` |
| POST | `/groups?event_id=` | Bearer | Create group from users who participated in event |
| POST | `/group/:group_id` | Bearer | Join a group `{status: "ACCEPTED"|"REJECTED"}` |
| GET | `/group/event/:event_id` | Bearer | Get all groups for event → `{group_id, number_of_member}` |

### Matching
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/match/:match_id?event_id=&type=&looking_for=` | Bearer | Submit matching request. `type`: "user" or "group" (match_id = user_id or group_id). `event_id`: find matches for this event. `looking_for` (groups only): how many people the group needs. |

### Missing Endpoints (Need to Build)
| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/onboarding` | Bearer | Bulk submit all onboarding data (or PATCH /me) |
| PATCH | `/me` | Bearer | Update user profile (interests, skills, goals, availability, avatar) |
| GET | `/events?title=&category=&start_time_min=&start_time_max=` | - | Event search with filters |
| GET | `/notifications` | Bearer | List notifications |
| PATCH | `/notifications/:id` | Bearer | Mark notification read |
| POST | `/messages` | Bearer | Send message |
| GET | `/conversations` | Bearer | List conversations |
| GET | `/messages/:conversationId` | Bearer | Get message history |

All list endpoints need `?limit=&offset=` pagination.

## Complete Screen Map

Every screen the app needs, organized by flow. Connection via simple **Connect button** (no swipe UI).

### A. Pre-Auth Screens

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| A1 | **Splash / Landing** | `/` | App logo, tagline, animated background. Two CTAs: "Get Started" → Register, "I have an account" → Login |
| A2 | **Register** | `/register` | Form: name, email, password. On success → Onboarding flow |
| A3 | **Login** | `/login` | Form: email, password. On success → Home (if onboarded) or Onboarding (if not) |
| A4 | **Forgot Password** | `/forgot-password` | Email input → reset link |

### B. Onboarding Screens (Sequential, 6 Steps)

Linear wizard with progress bar at top. Each step is a full screen. Back button available on all steps.

| # | Screen | Route | What It Collects | UI Notes |
|---|--------|-------|-----------------|----------|
| B1 | **Student ID Scan** | `/onboarding/verify` | European Student Identifier | Camera viewfinder with scan frame overlay. Upload fallback. Success/failure indicators. Skip option for demo. |
| B2 | **Avatar Picker** | `/onboarding/avatar` | Selected avatar character | 3D preview of all 5 characters in a carousel. Tap to spin/preview. Selected state glow. **Fun hook — placed early to reduce drop-off.** |
| B3 | **Module Login** | `/onboarding/modules` | University module OAuth | University selector → OAuth redirect via `POST /oauth`. Shows "Importing..." animation, then course list for confirmation. **Fallback:** manual course entry form if OAuth fails. |
| B4 | **About You** | `/onboarding/about` | Basics + interests + skills + goals in multi-tab layout | Tabs: Profile (name, program, semester) / Interests (tag picker: hobbies, topics, music, sports + "about me" free text) / Skills (tag picker: programming, languages, tools + "what I struggle with") / Goals (chips + free text: learning, career, "I'm here to...") |
| B5 | **Study Preferences** | `/onboarding/preferences` | Study times, collaboration style, availability | Visual time grid (day × time slot matrix), style icons (solo/pair/group toggle), language selector |
| B6 | **Event Browser + Done** | `/onboarding/events` | Events they want to attend | Scrollable grid with category tabs (Lectures, Seminars, Hackathons, Clubs, Social). Multi-select with counter "3 selected". On submit → confetti celebration + match count preview + CTA → Home |

Progress indicator: fraction format ("2/6") + progress bar at top, animated between steps. Steps transition with slide animation (left/right).

### C. Main App Screens (Bottom Navigation)

| # | Screen | Route | Tab | Description |
|---|--------|-------|-----|-------------|
| C1 | **Home** | `/home` | Home | Personalized greeting ("Good morning, Akira"). Upcoming events (horizontal scroll cards). Match summary card ("5 people match with you" + CTA). Suggested events (vertical cards). Pull-to-refresh. Top bar: search field + avatar (links to profile) + notification bell with badge. |
| C2 | **Explore** | `/explore` | Explore | **Discovery** — search bar (live search) + segmented toggle: Events / People. Filter chips per view. Events: category browse row (icons), card grid with title/time/location/attendee count/category badge. People: cards with avatar, name, match %, interest tags, Connect button. Sorting: by match score, date, popularity. |
| C3 | **Events List** | `/events` | Events | **Personal** — "My Events" (joined/upcoming) + "All Events" toggle. Cards with title, location, time, attendee count. FAB to create event. Distinct from Explore: this is your calendar, Explore is discovery. |
| C4 | **Messages** | `/messages` | Messages | Conversation list: avatar (40px), name (semibold), last message (truncated, 60 chars), relative timestamp ("2h ago"), unread dot indicator. 1:1 only for MVP. |
| C5 | **My Profile** | `/profile` | Profile | Own avatar (80px), name, program, interest tags, event timeline (vertical dots), events joined grid (2 columns). Edit button → Edit Profile. |

### D. Event Screens

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| D1 | **Event Detail — Overview** | `/events/:id` | Header image (optional), title (H1), location, time, attendee count, description. Buttons: "Join Event" / "Enter Lobby". Tab bar: Overview / People / Groups. |
| D2 | **Event Detail — People** | `/events/:id/people` | Filter chips (Same Program, Same Interests, Top Match). List: avatar (40px), name (H3), interest tags, match % bar (animated), **Connect button**. 12px spacing between items. |
| D3 | **Event Detail — Groups** | `/events/:id/groups` | List of groups for this event (from `GET /group/event/:event_id`). Each card: group name, member count, "Join" button. "+ Create Group" FAB at top. |
| D4 | **Create Event** | `/events/create` | Form: title, description, location, date/time picker, category select. Submit → event created. |
| D5 | **Create Group** | `/events/:id/groups/create` | Form: group name, description, looking_for count. Creates via `POST /groups?event_id=`. |

### E. Profile & Connection Screens

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| E1 | **Other User Profile** | `/users/:id` | Their avatar (80px), name, program, interest tags, event timeline, events joined. Action bar: **Connect** / Message / Compare. |
| E2 | **Profile Comparison** | `/users/:id/compare` | Side-by-side (stacked on mobile): You vs Them — avatars, names, programs. Center: animated match % ring. Shared section: events, courses, interests (Accent Blue). Differences: "Only You" / "Only Them" (subtle gray). Actions: Connect, Message. Sticky header with avatars + ring, scrollable shared/differences below. Zero-overlap state: "Nothing in common yet — attend the same events to build your match!" |
| E3 | **Edit Profile** | `/profile/edit` | Edit all onboarding fields: interests, skills, goals, availability, avatar. Same multi-tab UI as B4. Save → `PATCH /me` → re-embed changed segments in ChromaDB. |
| E4 | **Connection Requests** | `/connections` | Two tabs: "Received" (pending with Accept/Reject buttons) and "My Connections" (accepted list). Badge count drives here from notifications. |

### F. Messaging Screens

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| F1 | **Chat** | `/messages/:conversationId` | Top bar: avatar + name + match %. Shared context chip at top ("You're both attending Advanced Systems" — tappable → event). Message bubbles: own (Primary Blue bg, white text) / theirs (gray bg). Input bar + send button. Suggested first-message starters for new conversations. |

### G. 3D Lobby Screen

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| G1 | **Event Lobby** | `/events/:id/lobby` | **Visual-only** Three.js scene. Loads participants from `GET /events/:id/participants`, renders their chosen avatars in the 3D space. Tap avatar → floating label (name + match %) → tap again → E1 (their profile). Entry: "Enter Lobby" button on D1. No backend needed — purely client-side rendering of existing participant data. |

### H. Utility Screens

| # | Screen | Route | Description |
|---|--------|-------|-------------|
| H1 | **Notifications** | `/notifications` | Types: connection request received, connection accepted, event reminder, new message, new match, group invite. Each: icon + avatar + text + relative timestamp. Read/unread states. Tap → relevant screen. Empty: "You're all caught up!" |
| H2 | **Settings** | `/settings` | Account, notification preferences (per-type toggles), privacy, logout, delete account. |

### Screen Count Summary
- Pre-Auth: 4
- Onboarding: 6
- Main Tabs: 5
- Event: 5
- Profile/Connection: 4
- Messaging: 1
- 3D Lobby: 1
- Utility: 2
- **Total: 28 screens**

### Routing Architecture

**Route guards:**
- Unauthenticated → redirect to `/login`
- Authenticated but not onboarded (`onboarding_complete: false`) → redirect to `/onboarding/verify`
- Authenticated + onboarded → `/home`
- Deep links: store intended URL, redirect after auth, then navigate

**Nested routes:**
- Event tabs (Overview/People/Groups) as nested routes under `/events/:id` for deep-link support
- Bottom nav persists on C1-C5 screens; hides on event detail, chat, lobby, onboarding

**Back navigation:**
- Onboarding: each step is a separate route (supports browser back button)
- Profile Comparison: back returns to the referring screen (event people list or user profile)

## Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| Primary Blue | `#1E3A8A` | Buttons, active nav, primary actions |
| Secondary Blue | `#3B82F6` | Links, highlights, secondary actions |
| Accent Blue | `#93C5FD` | Shared items highlight, match badges |
| Background | `#F8FAFC` | Page backgrounds |
| Surface | `#FFFFFF` | Cards, modals, bottom sheets |
| Border | `#E5E7EB` | Dividers, secondary button borders, input borders |
| Text Primary | `#111827` | Headings, body text |
| Text Secondary | `#6B7280` | Captions, metadata, placeholders |
| Success | `#10B981` | Connection accepted, confirmations |
| Error | `#EF4444` | Form errors, destructive actions, reject |
| Warning | `#F59E0B` | Warnings, incomplete profile prompts |
| Disabled | `#D1D5DB` | Disabled buttons, inactive states |
| Overlay | `rgba(0,0,0,0.5)` | Modal/bottom sheet scrim |
| Highlight BG | `#EFF6FF` | Tag backgrounds, light blue surfaces |

### Typography (Inter / SF Pro)
| Level | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| H1 | 24px | Bold (700) | 32px | Screen titles |
| H2 | 20px | Semibold (600) | 28px | Section headers |
| H3 | 16px | Semibold (600) | 24px | Card titles, names |
| Body | 14px | Regular (400) | 20px | General text |
| Caption | 12px | Medium (500) | 16px | Timestamps, metadata |
| Small | 10px | Medium (500) | 14px | Badges, tiny labels |

### Spacing (8pt grid)
XS: 4px, SM: 8px, MD: 16px, LG: 24px, XL: 32px, 2XL: 48px

### Responsive Breakpoints
| Name | Width | Layout Changes |
|------|-------|---------------|
| Mobile | < 768px | Single column, bottom nav, stacked cards |
| Tablet | 768-1023px | Two-column event grid, side-by-side chat list + conversation |
| Desktop | >= 1024px | Sidebar nav (replaces bottom nav), three-column where appropriate |

Mobile-first design. Primary target: 390x844 (iPhone). All touch targets minimum 44x44px.

### Elevation / Shadows
| Level | Value | Usage |
|-------|-------|-------|
| sm | `0 1px 3px rgba(0,0,0,0.08)` | Subtle: tags, chips |
| md | `0 4px 12px rgba(0,0,0,0.05)` | Cards, list items |
| lg | `0 8px 24px rgba(0,0,0,0.10)` | Modals, floating elements |
| xl | `0 12px 36px rgba(0,0,0,0.15)` | Match cards in lobby overlay |

### Components
- **Button Primary:** bg `#1E3A8A`, text white, radius 12px, padding 12x16, min-height 44px
- **Button Secondary:** border 1px `#E5E7EB`, bg white, text `#111827`
- **Button Danger:** bg `#EF4444`, text white (for reject/delete)
- **Card:** bg white, radius 16px, shadow md, padding 16px
- **Tag:** bg `#EFF6FF`, text `#1E3A8A`, radius 999px, padding 4x10
- **Input:** bg white, border 1px `#E5E7EB`, radius 8px, padding 12px, focus border `#3B82F6`
- **Avatar:** sizes: 40px (list), 56px (card), 80px (profile). Circular, border 2px white
- **Modal:** bg white, radius 16px, shadow lg, scrim overlay, max-width 400px
- **Bottom Sheet:** bg white, top radius 16px, drag handle, shadow lg
- **Toast:** fixed top-center, bg `#111827`, text white, radius 8px, auto-dismiss 3s
- **Skeleton:** bg `#E5E7EB`, animated shimmer, matches component shapes
- **Progress Bar:** bg `#E5E7EB`, fill Primary Blue, height 4px, radius 2px
- **Icon set:** Lucide Icons (consistent, tree-shakeable, React-native)

### Motion System
| Animation | Duration | Easing | Trigger |
|-----------|----------|--------|---------|
| Button press | 100ms | ease-out | On press |
| Button scale | to 0.97 | spring(300, 20) | On press |
| Connect success | 300ms | ease-in-out | Checkmark + fade to "Connected" |
| Match bar fill | 600ms | ease-out | On mount/appear |
| Card hover lift | 150ms | ease-out | On hover (desktop) |
| Page transition | 250ms | ease-in-out | Slide left/right between routes |
| Onboarding step | 300ms | ease-in-out | Slide direction based on forward/back |
| Modal enter | 200ms | ease-out | Fade + scale from 0.95 |
| Toast enter | 200ms | ease-out | Slide down from top |
| Match % ring | 800ms | spring(400, 30) | On profile comparison mount |
| Confetti (B6) | 2000ms | linear | On onboarding complete |

Library: **Framer Motion** for all animations. Respect `prefers-reduced-motion` — disable all non-essential animations when set.

### Empty States (Per Screen)
| Screen | Empty State | CTA |
|--------|------------|-----|
| C1 Home (new user) | "Your journey starts here" | "Browse events" |
| C2 Explore (no results) | "No matches found" | "Try different filters" |
| C3 Events (none joined) | "You haven't joined any events yet" | "Explore events" |
| C4 Messages (no convos) | "No conversations yet" | "Connect with someone" |
| D2 Event People (no attendees) | "Be the first one here!" | "Invite classmates" |
| D3 Event Groups (none) | "No groups yet" | "Create a group" |
| E4 Connections (none) | "No connections yet" | "Explore events to meet people" |
| F1 Chat (new convo) | Suggested starters | "Ask about their course", "Share study plans" |
| G1 Lobby (alone) | Single avatar in empty space | "Share this event to invite others" |
| H1 Notifications (empty) | "You're all caught up!" | - |
| E2 Comparison (no overlap) | "Nothing in common yet" | "Attend the same events to build your match" |

### Error States
- **Network failure:** Inline error card with retry button
- **Server error (500):** Full-screen error illustration + "Something went wrong" + retry
- **Timeout:** Skeleton → error after 10s with retry
- **Permission denied (camera):** Explanation + settings link + manual fallback

## Key Differentiators

1. **Contextual networking** — high-intent matching based on shared events/courses
2. **Event-centric identity** — event-first, not profile-first
3. **Cold-start anxiety solver** — events provide natural conversation openers
4. **3D avatar lobby** — game-like visual presence (Valorant/DBD-inspired), makes the platform feel alive
5. **Fun onboarding** — Meta-style data gathering that feels like play, not a form
6. **Group matching** — find or form study groups for events, not just 1:1 connections

## Seed Data Generation Plan

### What We Need to Generate

#### 1. Users (100+ fake profiles)
Each user needs a complete JSON profile. Design around **archetypes**:
- **Social Butterfly** (15%): attends 8-10 events, broad interests, high match potential
- **Focused Student** (30%): 2-3 courses deep, narrow skills, fewer but high-quality matches
- **New Arrival** (25%): 1-2 events, minimal profile, testing cold-start matching
- **Active Networker** (20%): moderate events, lots of connections, message history
- **Lurker** (10%): completed onboarding, joined 0-1 events, mystery silhouette avatar

Overlap targets: **40-60% of users per major course**, 8-15 users clustered per event.

Include a **demo account**: `demo@tu-darmstadt.de` / `demo123` — pre-connected, has messages, rich profile.

#### 2. Events (20-30 events)
| Category | Examples | Count |
|----------|----------|-------|
| **Lectures/Courses** (multi-week) | "Distributed Systems Lecture", "ML Lab Session" | 8-10 |
| **Seminars** (one-time) | "Advanced Topics in NLP", "Systems Security Seminar" | 5-6 |
| **Hackathons** (one-time) | "TU Darmstadt HackaTUM", "AI for Good Hack" | 3-4 |
| **Student Clubs** (recurring) | "International Students Meetup", "Robotics Club Workshop" | 4-5 |
| **Social** (one-time) | "Welcome Week Pub Quiz", "Language Exchange Cafe" | 3-4 |

Locations: real TU Darmstadt buildings (S1|01, S2|02, Piloty building, Lichtwiese).

#### 3. Groups (30-50 groups)
- Study groups formed from event participants
- 3-6 members each
- Some groups "looking for" 1-2 more members

#### 4. Connections (100-200 records)
- Mix of PENDING, ACCEPTED, REJECTED
- Ensures Connection Requests and Messages screens have data

#### 5. Messages (15-20 conversations)
3-5 messages each. **10-15 templates:**
- "Hey, saw you're also in Distributed Systems!"
- "Are you going to the ML Lab Session tomorrow?"
- "I noticed we both code in Python — want to pair on the assignment?"
- "How did you find the hackathon?"
- "Looking for a study partner for the exam — interested?"

#### 6. Pre-computed Match Scores
Compute from actual data overlap using the same cosine + Jaccard logic the app uses. Store in `match_scores.json`.

### Generation Script
`scripts/generate_seed_data.py`:
1. Generate users from archetype templates + randomization (curated pools)
2. Create events with realistic details
3. Assign users to events (intentional clustering)
4. Create groups from event participants
5. Generate connections and messages
6. Compute match scores using matching engine logic
7. **Validate:** all user IDs in events exist, all event IDs in profiles exist, match scores 0-100, no orphaned connections
8. Output to `data/seed/`

### Output Files
```
data/seed/
  users.json          — all user profiles
  events.json         — all events
  groups.json         — study groups per event
  connections.json    — connection records
  messages.json       — conversation stubs
  match_scores.json   — pre-computed pairwise scores per event
```

### Data Pools
- **Programs:** M.Sc. Computer Science, M.Sc. Data Science, B.Sc. Electrical Engineering, M.Sc. Mechanical Engineering, M.Sc. Information Systems, B.Sc. Mathematics, etc.
- **Courses:** real TU Darmstadt CS/engineering course names
- **Nationalities/Names:** diverse international mix (Indian, Chinese, Japanese, Korean, Turkish, Brazilian, Nigerian, Polish, Italian, German, etc.)
- **Hobbies:** climbing, photography, cooking, gaming, reading, cycling, hiking, music production, chess, etc.
- **Programming languages:** Python, TypeScript, Java, C++, Rust, Go, Julia, R, Kotlin, etc.
- **Spoken languages:** English, German, Hindi, Mandarin, Japanese, Turkish, Portuguese, Arabic, Polish, etc.
- **Avatar types:** buff_arnold, banana_guy, anime_girl, bland_normal_guy, mystery_silhouette

## Future Features (Post-MVP)

- **Event Graph** — visualize who attended what, shared history
- **Study Group Auto-Formation** — 5 students in same course → auto-suggest group
- **Academic Timeline** — courses + events + projects as lightweight portfolio
- **Campus Layer** — identity, collaboration, discovery, networking for universities
- **Real-time chat** — WebSocket messaging (MVP uses polling)
- **Push notifications** — Web Push API + service worker
- **PWA** — service worker, app manifest, offline support, install prompt

## Known Risks

- **Scope creep** — profiles + events + networking + groups = 4 products. Stay focused on MVP.
- **Chicken-and-egg** — needs users to create value, needs events to attract users. Seed with real events.
- **Existing tool overlap** — must clearly answer "why switch from Moodle / WhatsApp / Discord?"
- **3D lobby on projector** — #1 demo risk. Have 2D fallback grid ready. Test on stage equipment.

## Development Guidelines

- Keep profiles lightweight: name, program, interests (tags), events joined
- Matching intelligence is the **moat** — invest here
- Seed real events early — if events are empty, the product dies
- Mobile-first design, follow the Figma spec closely
- Connect via **button click**, not swipe — simple, accessible, clear
- Lobby is **visual-only** — no backend infra needed, renders from participant data
- All list endpoints must have pagination
- Respect `prefers-reduced-motion` for all animations
- WCAG AA target for color contrast and touch targets
