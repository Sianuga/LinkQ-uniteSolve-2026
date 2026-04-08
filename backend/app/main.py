"""
LinkQ API — FastAPI entry point
================================
Starts the server, loads seed data, registers all route modules,
and configures CORS for the frontend dev servers.
"""

from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import db

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan: startup / shutdown logic
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs on startup (before yield) and shutdown (after yield)."""

    # --- Startup -----------------------------------------------------------
    # 1. Populate the in-memory DB from data/seed/*.json
    db.load_seed_data()
    logger.info(
        "Seed data loaded: %d users, %d events",
        len(db.users),
        len(db.events),
    )

    # 2. Pre-warm the embedding model so the first /match request is fast.
    #    This is best-effort — if sentence-transformers or chromadb aren't
    #    installed the service falls back to random scores anyway.
    try:
        from app.services.matching import get_embedding_service

        get_embedding_service()
        logger.info("Embedding service pre-warmed successfully")
    except Exception:
        logger.warning("Embedding service pre-warm skipped (not available)")

    yield  # ---- app is running ----

    # --- Shutdown ----------------------------------------------------------
    logger.info("LinkQ API shutting down")


# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------

app = FastAPI(
    title="LinkQ API",
    version="0.1.0",
    description="Student Event Connection Platform — backend API",
    lifespan=lifespan,
)


# ---------------------------------------------------------------------------
# CORS — allow the Vite dev server and any secondary dev server
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
# Import order matters: matching.router is included LAST because it defines
# /users/{id}/compare routes that would shadow users.router if placed earlier.

from app.routes import (  # noqa: E402
    auth,
    connections,
    events,
    groups,
    messages,
    notifications,
    users,
    matching,
)

app.include_router(auth.router)
app.include_router(events.router)         # prefix="/events"
app.include_router(connections.router)     # prefix="/connections"
app.include_router(groups.router)          # /groups and /group paths
app.include_router(messages.router)        # /conversations and /messages paths
app.include_router(notifications.router)   # prefix="/notifications"
app.include_router(users.router)           # prefix="/users"
app.include_router(matching.router)        # /match and /users/.../compare — LAST


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health", tags=["health"])
async def health_check():
    """Quick liveness / readiness probe."""
    return {
        "status": "ok",
        "users": len(db.users),
        "events": len(db.events),
    }
