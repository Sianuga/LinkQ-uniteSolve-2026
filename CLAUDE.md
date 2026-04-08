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
- **API spec:** `likQ.postman_collection.json` in repo root

## Central Feature: Onboarding (Meta/Zuckerberg-Style)

The onboarding is a **core differentiator**, not just a setup flow. It's designed to be fun and engaging, gathering rich profile data through an interactive experience:

### Onboarding Flow (from `Refs/Onboarding.png`)
1. **Scan European Student Identifier** — verify student identity
2. **Provide module login** — connect academic modules to auto-gather enrolled courses
3. **Motivation + phase** — hobbies/interests, skills, goals ("about me" description)
4. **Choose events** — select events you've attended or want to join ("Explore events" tab)

### 3D Avatar Lobby (Game-Style)

Inspired by game lobbies like **Valorant** and **Dead by Daylight**:
- Users get a **3D avatar** rendered with Three.js
- A visual lobby/hangout space where you can see other attendees
- Creates a sense of presence and community before events
- Makes the platform feel alive — not just a list of profiles
- Avatar customization tied to onboarding (pick your look as part of setup)

This transforms a utility app into an **experience** — users want to open the app, not just use it.

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

## App Structure (from Figma)

**5 main screens** via bottom navigation:
1. **Home** — feed/dashboard with upcoming events, match count, suggested events
2. **Explore** — discover events and peers
3. **Events** — browse/join events
4. **Messages** — conversations with connections
5. **Profile** — user profile with courses/interests/event timeline

### Event Detail Page (Flagship Screen)
Tabs: **Overview | People | Sub-events | Matches**

**People tab:** filter chips (Same Program, Same Interests, Top Match), list with avatars, tags, match progress bars, connect buttons.

**Matches tab — Tinder-style swipe:**
- Full-screen card stack, only top card interactive
- Swipe right → connect, left → skip
- Card shows: avatar, name, program, match % badge, shared highlights (events/courses/interests), interest tags
- Actions: Pass / Save / Connect
- Micro-interactions: rotation + opacity on swipe, animated match %, card parallax, heart animation on connect
- Safeguards: limit daily swipes, prioritize high-match first, no repeat profiles

**Sub-events tab:** create button + list of sub-event cards with attendee counts.

### Profile Comparison Screen (Key Feature)
- Side-by-side: You vs Other User (avatars, names, programs)
- Center: animated match % ring
- Shared section: events, courses, interests (highlighted in Accent Blue)
- Differences: "Only You" / "Only Them" (subtle gray)
- Actions: Connect, Message, Invite to Sub-event

### Profile Page
- Avatar (80px), name, program, interest tags
- Event timeline (vertical dots: courses, hackathons, seminars)
- Events joined grid (2 columns)

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
