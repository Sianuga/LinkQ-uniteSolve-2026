"""Auth routes for Nexus API.

Router prefix: /auth  (register, login)
Top-level routes: /me, /oauth, /onboarding
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.database import db
from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.models.schemas import (
    LoginRequest,
    OAuthRequest,
    OAuthResponse,
    OnboardingRequest,
    RegisterRequest,
    TokenResponse,
    UserProfile,
    UserProfileUpdate,
)

router = APIRouter(tags=["auth"])

# ---------------------------------------------------------------------------
# Fake course catalogue used by the OAuth simulation endpoint
# ---------------------------------------------------------------------------
UNIVERSITY_COURSES: dict[str, list[str]] = {
    "TU Darmstadt": [
        "Distributed Systems",
        "Machine Learning",
        "Computer Vision",
        "Software Engineering",
        "Algorithms and Data Structures",
        "Computer Networks",
    ],
    "TU Munich": [
        "Introduction to Deep Learning",
        "Database Systems",
        "Robotics",
        "Discrete Mathematics",
        "Operating Systems",
        "Linear Algebra",
    ],
    "ETH Zurich": [
        "Systems Programming",
        "Data Management",
        "Visual Computing",
        "Computational Intelligence",
        "Parallel Computing",
        "Probabilistic AI",
    ],
    "default": [
        "Introduction to Computer Science",
        "Calculus I",
        "Linear Algebra",
        "Statistics",
        "Programming Fundamentals",
    ],
}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _strip_password(user: dict) -> dict:
    """Return a copy of the user dict without the password_hash field."""
    return {k: v for k, v in user.items() if k != "password_hash"}


def _deep_merge(base: dict, updates: dict) -> dict:
    """Recursively merge *updates* into *base*, returning the mutated *base*.

    Only dict values are merged; everything else is replaced outright.
    """
    for key, value in updates.items():
        if isinstance(value, dict) and isinstance(base.get(key), dict):
            _deep_merge(base[key], value)
        else:
            base[key] = value
    return base


# ========================================================================== #
#  POST /auth/register
# ========================================================================== #

@router.post(
    "/auth/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(body: RegisterRequest) -> TokenResponse:
    """Create a new user account.

    Hashes the password, generates a UUID, stores the user document in
    ``db.users``, and returns a JWT so the client can proceed to onboarding
    without a separate login call.

    Returns **409** if the email is already taken.
    """
    # Check for duplicate email
    for user in db.users.values():
        if user.get("email") == body.email:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="A user with this email already exists",
            )

    user_id = f"user_{uuid.uuid4().hex[:12]}"

    db.users[user_id] = {
        "id": user_id,
        "name": body.name,
        "email": body.email,
        "password_hash": hash_password(body.password),
        "university": "",
        "program": "",
        "semester": 0,
        "avatar": "",
        "avatar_url": "",
        "onboarding_complete": False,
        "academic": {"courses": [], "degree": "", "thesis_topic": ""},
        "interests": {"hobbies": [], "topics": [], "music": "", "sports": ""},
        "skills": {"programming": [], "languages": [], "tools": []},
        "goals": {"learning": [], "career": "", "short_term": "", "here_to": ""},
        "availability": {"preferred_times": [], "study_style": "", "timezone": ""},
        "events": {"attended": [], "interested": [], "categories": []},
        "bio": "",
    }

    token = create_access_token({"sub": user_id})
    return TokenResponse(token=token)


# ========================================================================== #
#  POST /auth/login
# ========================================================================== #

@router.post(
    "/auth/login",
    response_model=TokenResponse,
    summary="Login and receive a JWT",
)
def login(body: LoginRequest) -> TokenResponse:
    """Authenticate with email + password and return a JWT bearer token.

    Returns **401** if the email is not found or the password is incorrect.
    The error message is intentionally generic to avoid leaking which field
    was wrong.
    """
    for user in db.users.values():
        if user.get("email") == body.email:
            if verify_password(body.password, user["password_hash"]):
                token = create_access_token({"sub": user["id"]})
                return TokenResponse(token=token)
            else:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password",
                )

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
    )


# ========================================================================== #
#  GET /me
# ========================================================================== #

@router.get(
    "/me",
    response_model=UserProfile,
    summary="Get the current user's full profile",
)
def get_me(current_user: dict = Depends(get_current_user)) -> UserProfile:
    """Return the authenticated user's full profile document.

    The ``password_hash`` field is stripped before returning.
    """
    return UserProfile(**_strip_password(current_user))


# ========================================================================== #
#  PATCH /me
# ========================================================================== #

@router.patch(
    "/me",
    response_model=UserProfile,
    summary="Update the current user's profile (partial)",
)
def update_me(
    body: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
) -> UserProfile:
    """Partially update the authenticated user's profile.

    Only the fields present in the request body are written.  Nested objects
    (e.g. ``interests``, ``skills``) are **deep-merged** so that callers can
    send only the sub-fields they want to change without wiping the rest.

    After persisting the changes the endpoint triggers a re-embedding of any
    changed semantic segments in ChromaDB via the embedding service.
    """
    updates: dict[str, Any] = body.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    user_id: str = current_user["id"]
    user_doc: dict = db.users[user_id]

    # Deep-merge so nested dicts are updated, not replaced wholesale
    _deep_merge(user_doc, updates)

    # Determine which semantic segments were affected and re-embed them
    segment_keys = {"academic", "interests", "goals", "events", "skills", "availability"}
    changed_segments = [k for k in updates if k in segment_keys]

    if changed_segments:
        try:
            from app.services.embedding import embed_user_segments  # noqa: WPS433

            embed_user_segments(user_doc, segments=changed_segments)
        except ImportError:
            # Embedding service not yet implemented — silently skip
            pass

    return UserProfile(**_strip_password(user_doc))


# ========================================================================== #
#  POST /oauth
# ========================================================================== #

@router.post(
    "/oauth",
    response_model=OAuthResponse,
    summary="Simulate OAuth module import — returns course list",
)
def oauth_import(body: OAuthRequest) -> OAuthResponse:
    """Simulate an OAuth flow with a university module system.

    Accepts a university name and returns a fake list of enrolled courses.
    If ``user_id`` is provided (typically during onboarding), the courses and
    university are also persisted on the user document.
    """
    university = body.university
    courses = UNIVERSITY_COURSES.get(university, UNIVERSITY_COURSES["default"])

    # Optionally persist on the user document
    if body.user_id:
        user = db.users.get(body.user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        user["university"] = university
        user["academic"]["courses"] = courses

    return OAuthResponse(university=university, courses=courses)


# ========================================================================== #
#  POST /onboarding
# ========================================================================== #

@router.post(
    "/onboarding",
    response_model=UserProfile,
    status_code=status.HTTP_200_OK,
    summary="Submit full onboarding data",
)
def submit_onboarding(
    body: OnboardingRequest,
    current_user: dict = Depends(get_current_user),
) -> UserProfile:
    """Accept all onboarding fields at once, store them on the user profile,
    set ``onboarding_complete = True``, and trigger embedding generation for
    every semantic segment.
    """
    user_id: str = current_user["id"]
    user_doc: dict = db.users[user_id]

    onboarding_data: dict[str, Any] = body.model_dump(exclude_unset=True)

    # Deep-merge so nested dicts are updated properly
    _deep_merge(user_doc, onboarding_data)

    # Always mark onboarding as complete
    user_doc["onboarding_complete"] = True

    # Trigger full embedding generation for all semantic segments
    all_segments = ["academic", "interests", "goals", "events", "skills", "availability"]
    try:
        from app.services.embedding import embed_user_segments  # noqa: WPS433

        embed_user_segments(user_doc, segments=all_segments)
    except ImportError:
        # Embedding service not yet implemented — silently skip
        pass

    return UserProfile(**_strip_password(user_doc))
