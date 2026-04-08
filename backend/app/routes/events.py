"""Event routes for Nexus API."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.security import get_current_user
from app.core.database import db
from app.models.schemas import EventCreate, EventResponse, UserSummary, MatchCandidate
from app.services.matching import get_matches_for_event

router = APIRouter(prefix="/events", tags=["events"])


# ---------------------------------------------------------------------------
# GET /events — list / search events
# ---------------------------------------------------------------------------
@router.get("", response_model=list[EventResponse])
def list_events(
    university: Optional[str] = Query(None, description="Filter by university"),
    category: Optional[str] = Query(None, description="Filter by event category"),
    title: Optional[str] = Query(None, description="Search events by title (substring match)"),
    limit: int = Query(50, ge=1, le=200, description="Max number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
) -> list[EventResponse]:
    """Return a paginated, optionally filtered list of events."""

    events = list(db.events.values())

    # --- Apply filters ---
    filtered = events

    if university is not None:
        filtered = [
            e for e in filtered
            if e.get("university", "").lower() == university.lower()
        ]

    if category is not None:
        filtered = [
            e for e in filtered
            if e.get("category", "").lower() == category.lower()
        ]

    if title is not None:
        query = title.lower()
        filtered = [
            e for e in filtered
            if query in e.get("title", "").lower()
        ]

    # --- Paginate ---
    page = filtered[offset : offset + limit]

    return [EventResponse(**e) for e in page]


# ---------------------------------------------------------------------------
# POST /events — create a new event (auth required)
# ---------------------------------------------------------------------------
@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    body: EventCreate,
    current_user: dict = Depends(get_current_user),
) -> EventResponse:
    """Create a new event and persist it."""

    user_id = current_user["id"]
    event_id = f"event_{uuid.uuid4().hex[:12]}"

    event = {
        "id": event_id,
        "title": body.title,
        "description": body.description,
        "location": body.location,
        "start_time": body.start_time.isoformat(),
        "end_time": body.end_time.isoformat(),
        "category": body.category,
        "created_by": user_id,
        "participants": [user_id],
    }

    db.events[event_id] = event
    db.save_event(event_id)

    return EventResponse(**event)


# ---------------------------------------------------------------------------
# GET /events/{id} — event details
# ---------------------------------------------------------------------------
@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: str) -> EventResponse:
    """Return the details of a single event. 404 if not found."""

    event = db.events.get(event_id)

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found",
        )

    return EventResponse(**event)


# ---------------------------------------------------------------------------
# POST /events/{id}/join — join an event (auth required)
# ---------------------------------------------------------------------------
@router.post("/{event_id}/join")
def join_event(
    event_id: str,
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Add the authenticated user to the event's participants list."""

    event = db.events.get(event_id)

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found",
        )

    user_id: str = current_user["id"]

    if user_id in event.get("participants", []):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User has already joined this event",
        )

    event.setdefault("participants", []).append(user_id)
    db.save_event(event_id)

    return {"message": "Successfully joined the event", "event_id": event_id}


# ---------------------------------------------------------------------------
# GET /events/{id}/participants — list participants with pagination
# ---------------------------------------------------------------------------
@router.get("/{event_id}/participants", response_model=list[UserSummary])
def get_event_participants(
    event_id: str,
    limit: int = Query(50, ge=1, le=200, description="Max number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
) -> list[UserSummary]:
    """Return a paginated list of UserSummary for all event participants."""

    event = db.events.get(event_id)

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found",
        )

    participant_ids: list[str] = event.get("participants", [])

    summaries: list[UserSummary] = []
    for uid in participant_ids:
        user = db.users.get(uid)
        if user is not None:
            summaries.append(
                UserSummary(
                    id=user["id"],
                    name=user.get("name", ""),
                    university=user.get("university", ""),
                    program=user.get("program", ""),
                    avatar=user.get("avatar", ""),
                    avatar_url=user.get("avatar_url", user.get("avatar", "")),
                )
            )

    # Paginate
    page = summaries[offset : offset + limit]
    return page


# ---------------------------------------------------------------------------
# GET /events/{id}/matches — match candidates for current user (auth required)
# ---------------------------------------------------------------------------
@router.get("/{event_id}/matches", response_model=list[MatchCandidate])
def get_event_matches(
    event_id: str,
    current_user: dict = Depends(get_current_user),
) -> list[MatchCandidate]:
    """
    Compute and return match candidates for the current user at this event.

    Delegates to the matching service which calculates weighted similarity
    scores (cosine on semantic segments + Jaccard on categorical data) against
    other event participants.  Results are sorted by score descending.
    """

    event = db.events.get(event_id)

    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found",
        )

    user_id: str = current_user["id"]

    if user_id not in event.get("participants", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must join this event before viewing matches",
        )

    candidates = get_matches_for_event(
        user_id=user_id,
        event_id=event_id,
        db=db,
    )

    return candidates
