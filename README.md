# LinkQ — Student Event Connection Platform

Turn your calendar into your network. An event-centric platform connecting international students through shared academic events, courses, and interests.

**Competition:** uniteSolve 2026

## Quick Start

### Frontend (React + Three.js)

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`. Use `demo@tu-darmstadt.de` with any password to skip onboarding and see the full app with mock data.

### Backend (FastAPI + ChromaDB) — Coming Soon

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

## Screens

28 screens across 8 flows: Auth, Onboarding (6-step wizard), Home/Explore/Events/Messages/Profile tabs, Event Detail (Overview/People/Groups), Profile Comparison with animated match ring, Chat, 3D Avatar Lobby, Notifications, Settings.

See `CLAUDE.md` for the complete screen map and design system.
