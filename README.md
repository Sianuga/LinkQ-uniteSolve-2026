# NEXUS - Network for EXploration, Unity and Study

_Start anywhere. Belong everywhere._ 

A student platform that connects peers through shared academic contexts and events, enabling them to discover who’s attending, connect in advance, and form meaningful study groups. It is designed to support integration, especially for international and new students, by turning everyday campus activities into **opportunities for connection.** Made

## Quick Start

### Frontend (React + Three.js)

Recommended Node version: **Node 22 LTS** (see `.nvmrc`). Using very new Node versions can break native optional dependencies used by the bundler.

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. Use `demo@tu-darmstadt.de` with any password to skip onboarding and see the full app with mock data.

### Backend (FastAPI + ChromaDB)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

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
frontend/           React app (28 screens, 73 source files)
  src/
    components/     UI (11) + Domain (8) + Layout (4)
    pages/          Auth (4) + Onboarding (7) + App (5) + Events (5)
                    + Profile (4) + Messaging (1) + Lobby (1) + Utility (2)
    data/           Mock data (users, events, matches, messages)
    store/          Zustand auth store
    services/       Axios API client
    types/          TypeScript interfaces
    styles/         Tailwind theme + design tokens
backend/            FastAPI server (TODO)
scripts/            Seed data generation (TODO)
data/seed/          Generated mock data JSON (TODO)
Refs/               User flow wireframes (Onboarding, Matchmaking, Connecting)
CLAUDE.md           Full project specification
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
