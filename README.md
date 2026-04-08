# NEXUS - Network for EXploration, Unity and Study

_Start anywhere. Belong everywhere._ 

NEXUS is a student platform designed to facilitate meaningful academic and social connections by leveraging shared context: **courses**, **events**, and **study goals**.
Instead of disconnected tools and random networking, NEXUS creates a structured environment where events become connection points and interactions happen before, during, and after participation.

This is especially relevant for:
- International students
- Newcomers to campus
- Students struggling with integration

## Features (V1)
NEXUS transforms campus life into a context-aware network:
- Context-based peer matching
- Event-centric networking
- Study group formation
- Messaging / Chat system
- 3D interactive event lobby
- Onboarding tailored to academic identity

## Quick Start
### Frontend (React + Three.js)

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`.
Use `demo@tu-darmstadt.de` with any password to skip onboarding and see the full app with mock data.

### Backend (FastAPI + ChromaDB)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```


_Developed as part of the **Solve&Unite! Hackathon 2026**._
