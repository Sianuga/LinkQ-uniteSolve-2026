# LinkQ — Student Event Connection Platform

Turn your calendar into your network. An event-centric platform connecting international students through shared academic events, courses, and interests.

**Competition:** uniteSolve 2026

## Quick Start

### Docker (Easiest)

```bash
docker compose up --build
```

That's it. Backend at `http://localhost:8000`, frontend at `http://localhost:5173`.

### Run Everything (Without Docker)

**Windows (PowerShell):**
```powershell
# Terminal 1 — Backend
cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

**Mac / Linux (Bash):**
```bash
# Terminal 1 — Backend
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm install && npm run dev
```

Backend runs at `http://localhost:8000` (Swagger docs at `/docs`).
Frontend runs at `http://localhost:5173`.

### Demo Account

- **Email:** `demo@tu-darmstadt.de`
- **Password:** `demo123`
- Pre-filled profile, 6 events, 10+ connections, messages, notifications.
- All other seed users use password `password123`.

### Backend Only

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Loads 100 users, 25 events, and full seed data automatically on startup. API docs at `http://localhost:8000/docs`.

### Frontend Only

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. Works with mock data if the backend isn't running.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| 3D Lobby | Three.js via React Three Fiber + Drei |
| Animation | Framer Motion |
| State | Zustand + TanStack Query |
| Backend | FastAPI (Python) |
| Matching | ChromaDB + sentence-transformers (cosine similarity) |
| API Spec | `likQ.postman_collection.json` |

## Project Structure

```
frontend/               React app (28 screens)
  src/
    components/         UI (11) + Domain (8) + Layout (4) + 3D
    pages/              Auth (4) + Onboarding (7) + App (5) + Events (5)
                        + Profile (4) + Messaging (1) + Lobby (1) + Utility (2)
    data/               Mock data (users, events, matches, messages)
    store/              Zustand auth store
    services/           Axios API client
    types/              TypeScript interfaces
    styles/             Tailwind theme + design tokens
backend/                FastAPI server (29 endpoints)
  app/
    main.py             Entry point — routers, CORS, lifespan
    core/
      config.py         Settings (env vars, JWT, ChromaDB paths)
      database.py       In-memory DB with seed data loading
      schema.sql        SQLite schema (ready for migration)
      security.py       JWT auth + bcrypt password hashing
    models/
      schemas.py        30+ Pydantic models
    routes/
      auth.py           Register, login, /me, /oauth, /onboarding
      events.py         CRUD, join, participants, matches
      connections.py    Send, list, accept/reject
      groups.py         Create, join, list by event
      messages.py       Conversations, message history, send
      matching.py       ChromaDB matching + profile comparison
      notifications.py  List, mark read
      users.py          Get user profile
    services/
      matching.py       Matching engine (753 lines) — cosine + Jaccard + context-aware weights
      embedding.py      Bridge to ChromaDB embedding pipeline
scripts/
  generate_seed_data.py Generates all seed data (100 users, 25 events, etc.)
data/seed/              Generated JSON seed files (6 files)
Docs/                   Implementation plans
Refs/                   User flow wireframes
CLAUDE.md               Full project specification
```

## All Screens & Routes (28 total)

Login with `demo@tu-darmstadt.de` (any password) to skip onboarding and access all screens.

### Pre-Auth

| # | Screen | Route |
|---|--------|-------|
| A1 | Splash | `/` |
| A2 | Register | `/register` |
| A3 | Login | `/login` |
| A4 | Forgot Password | `/forgot-password` |

### Onboarding (register first → auto-redirects)

| # | Screen | Route |
|---|--------|-------|
| B1 | Student ID Scan | `/onboarding/verify` |
| B2 | Avatar Picker | `/onboarding/avatar` |
| B3 | Module Login | `/onboarding/modules` |
| B4 | About You | `/onboarding/about` |
| B5 | Study Preferences | `/onboarding/preferences` |
| B6 | Event Browser + Done | `/onboarding/events` |

### Main Tabs (bottom navigation)

| # | Screen | Route |
|---|--------|-------|
| C1 | Home | `/home` |
| C2 | Explore | `/explore` |
| C3 | Events List | `/events` |
| C4 | Messages | `/messages` |
| C5 | My Profile | `/profile` |

### Event Screens

| # | Screen | Route | Example |
|---|--------|-------|---------|
| D1 | Event Detail | `/events/:id` | `/events/e-001` |
| D2 | Event People | `/events/:id/people` | `/events/e-001/people` |
| D3 | Event Groups | `/events/:id/groups` | `/events/e-001/groups` |
| D4 | Create Event | `/events/create` | |
| D5 | Create Group | `/events/:id/groups/create` | `/events/e-001/groups/create` |

### 3D Lobby

| # | Screen | Route | Example |
|---|--------|-------|---------|
| G1 | Event Lobby | `/events/:id/lobby` | `/events/e-001/lobby` |

### Profile & Connections

| # | Screen | Route | Example |
|---|--------|-------|---------|
| E1 | User Profile | `/users/:id` | `/users/u-002` |
| E2 | Profile Comparison | `/users/:id/compare` | `/users/u-002/compare` |
| E3 | Edit Profile | `/profile/edit` | |
| E4 | Connections | `/connections` | |

### Messaging

| # | Screen | Route | Example |
|---|--------|-------|---------|
| F1 | Chat | `/messages/:conversationId` | `/messages/conv-001` |

### Utility

| # | Screen | Route |
|---|--------|-------|
| H1 | Notifications | `/notifications` |
| H2 | Settings | `/settings` |

### Available Mock Data IDs

- **Events:** `e-001` through `e-008`
- **Users:** `u-001` (you) through `u-006`
- **Conversations:** `conv-001` through `conv-004`
- **Groups:** `g-001` through `g-004`

See `CLAUDE.md` for the complete design system and project specification.
