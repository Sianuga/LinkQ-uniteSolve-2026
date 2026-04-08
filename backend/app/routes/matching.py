"""
LinkQ Matching Routes (Enhanced)
================================
Full matching engine endpoints using ChromaDB + sentence-transformers for
semantic similarity, combined with Jaccard on categorical data and
context-aware weighting.

This module provides:
  POST /match/{match_id}?event_id=&type=&looking_for=   (requires auth)
  GET  /users/{id}/compare/{target_id}?event_id=         (public)

It replaces the placeholder implementations in match.py and users.py with
the full segmented-embedding pipeline from app.services.matching.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.core.database import db
from app.core.security import get_current_user
from app.models.schemas import (
    DifferencesInfo,
    MatchCandidate as MatchCandidateSchema,
    ProfileComparison as ProfileComparisonSchema,
    SharedInfo,
)
from app.services.matching import (
    ensure_user_embedded,
    get_matches_for_event,
    get_matches_for_group,
    get_profile_comparison,
)


# ---------------------------------------------------------------------------
# Enhanced response models (extend the base schemas with per-segment detail)
# ---------------------------------------------------------------------------

class MatchCandidateEnhanced(BaseModel):
    """Extends the base MatchCandidate with per-segment breakdown."""
    user_id: str
    name: str
    avatar: str = ""
    match_score: float = 0.0
    per_segment_scores: dict[str, float] = Field(default_factory=dict)
    shared: dict[str, list[str]] = Field(default_factory=dict)


class MatchResponse(BaseModel):
    """Wrapper returned by POST /match/{match_id}."""
    match_id: str
    event_id: str
    match_type: str
    candidates: list[MatchCandidateEnhanced]
    total_candidates: int


class ProfileComparisonEnhanced(BaseModel):
    """Extends the base ProfileComparison with per-segment detail."""
    user_id: str
    target_id: str
    event_id: str | None = None
    match_score: float = 0.0
    per_segment_scores: dict[str, float] = Field(default_factory=dict)
    shared: dict[str, list[str]] = Field(default_factory=dict)
    differences: dict[str, list[str]] = Field(default_factory=dict)


# ---------------------------------------------------------------------------
# Router — two prefixes are handled: /match and /users
# The main app should include this router *without* a prefix so that both
# /match/... and /users/.../compare/... are reachable.
# ---------------------------------------------------------------------------

router = APIRouter(tags=["matching"])


# ========================================================================== #
#  POST /match/{match_id}?event_id=&type=&looking_for=
# ========================================================================== #

@router.post(
    "/match/{match_id}",
    response_model=MatchResponse,
    summary="Find match candidates for a user or group at an event",
    description=(
        "Submit a matching request. If type=user, match_id is the user's ID and "
        "the engine finds the best individual matches among event participants. "
        "If type=group, match_id is the group's ID and the engine finds candidates "
        "who complement the whole group."
    ),
)
async def find_matches(
    match_id: str,
    event_id: str = Query(..., description="Event to find matches for"),
    type: str = Query("user", description="'user' or 'group'"),
    looking_for: int = Query(
        0,
        description="(groups only) How many people the group still needs",
    ),
    current_user: dict = Depends(get_current_user),
) -> MatchResponse:
    current_user_id = current_user["id"]
    # ---- Validate event ----
    if event_id not in db.events:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found.",
        )

    match_type = type.lower()

    # ------------------------------------------------------------------ #
    #  USER matching
    # ------------------------------------------------------------------ #
    if match_type == "user":
        user_id = match_id

        if user_id != current_user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only request matches for yourself.",
            )

        if user_id not in db.users:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User '{user_id}' not found.",
            )

        # Ensure embeddings are up-to-date for the requester
        ensure_user_embedded(user_id, db.users[user_id])

        # Ensure embeddings exist for every other participant
        event = db.events[event_id]
        for pid in event.get("participants", []):
            if pid != user_id and pid in db.users:
                ensure_user_embedded(pid, db.users[pid])

        raw_candidates = get_matches_for_event(user_id, event_id, db)

    # ------------------------------------------------------------------ #
    #  GROUP matching
    # ------------------------------------------------------------------ #
    elif match_type == "group":
        group_id = match_id

        if group_id not in db.groups:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Group '{group_id}' not found.",
            )

        group = db.groups[group_id]
        if current_user_id not in group.get("members", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You must be a group member to request group matches.",
            )

        # Embed everyone relevant
        event = db.events[event_id]
        all_ids = set(group.get("members", [])) | set(event.get("participants", []))
        for uid in all_ids:
            if uid in db.users:
                ensure_user_embedded(uid, db.users[uid])

        raw_candidates = get_matches_for_group(group_id, event_id, looking_for, db)

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid type '{type}'. Must be 'user' or 'group'.",
        )

    # ---- Build response ----
    candidates = [
        MatchCandidateEnhanced(
            user_id=c["user_id"],
            name=c["name"],
            avatar=c["avatar"],
            match_score=round(c["match_score"] * 100, 1),  # 0-100 scale
            per_segment_scores={
                k: round(v * 100, 1) for k, v in c["per_segment_scores"].items()
            },
            shared=c["shared"],
        )
        for c in raw_candidates
    ]

    return MatchResponse(
        match_id=match_id,
        event_id=event_id,
        match_type=match_type,
        candidates=candidates,
        total_candidates=len(candidates),
    )


# ========================================================================== #
#  GET /users/{user_id}/compare/{target_id}?event_id=
# ========================================================================== #

@router.get(
    "/users/{user_id}/compare/{target_id}",
    response_model=ProfileComparisonEnhanced,
    summary="Compare two user profiles",
    description=(
        "Get a detailed comparison between two users, including overall match "
        "score, per-segment breakdown, shared items (courses, hobbies, events), "
        "and differences (only_me vs only_them)."
    ),
)
async def compare_profiles(
    user_id: str,
    target_id: str,
    event_id: str = Query(None, description="Optional event ID for context-aware weighting"),
) -> ProfileComparisonEnhanced:
    if user_id not in db.users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{user_id}' not found.",
        )
    if target_id not in db.users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User '{target_id}' not found.",
        )
    if event_id and event_id not in db.events:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event '{event_id}' not found.",
        )

    # Ensure both users have embeddings
    ensure_user_embedded(user_id, db.users[user_id])
    ensure_user_embedded(target_id, db.users[target_id])

    comparison = get_profile_comparison(user_id, target_id, event_id, db)

    if comparison is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Could not compute comparison — user data missing.",
        )

    return ProfileComparisonEnhanced(
        user_id=user_id,
        target_id=target_id,
        event_id=event_id,
        match_score=round(comparison["match_score"] * 100, 1),  # 0-100 scale
        per_segment_scores={
            k: round(v * 100, 1) for k, v in comparison["per_segment_scores"].items()
        },
        shared=comparison["shared"],
        differences=comparison["differences"],
    )
