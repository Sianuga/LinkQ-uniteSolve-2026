from fastapi import APIRouter, HTTPException, status

from app.core.database import db
from app.models.schemas import (
    DifferencesInfo,
    ProfileComparison,
    SharedInfo,
    UserProfile,
)

router = APIRouter(prefix="/users", tags=["users"])


def _user_to_profile(user: dict) -> UserProfile:
    """Convert internal user dict to UserProfile, stripping password_hash."""
    data = {k: v for k, v in user.items() if k != "password_hash"}
    return UserProfile(**data)


@router.get("/{user_id}", response_model=UserProfile)
def get_user(user_id: str):
    user = db.users.get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return _user_to_profile(user)


@router.get("/{user_id}/compare/{target_id}", response_model=ProfileComparison)
def compare_users(user_id: str, target_id: str, event_id: str = ""):
    user_a = db.users.get(user_id)
    user_b = db.users.get(target_id)
    if not user_a or not user_b:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Compute shared events
    events_a = set(user_a.get("events", {}).get("attended", []) + user_a.get("events", {}).get("interested", []))
    events_b = set(user_b.get("events", {}).get("attended", []) + user_b.get("events", {}).get("interested", []))
    shared_events = list(events_a & events_b)

    # Compute shared interests (hobbies + topics)
    interests_a = set(user_a.get("interests", {}).get("hobbies", []) + user_a.get("interests", {}).get("topics", []))
    interests_b = set(user_b.get("interests", {}).get("hobbies", []) + user_b.get("interests", {}).get("topics", []))
    shared_interests = list(interests_a & interests_b)

    # Differences
    only_a = list((interests_a | events_a) - (interests_b | events_b))
    only_b = list((interests_b | events_b) - (interests_a | events_a))

    # Simple match score: Jaccard over combined sets
    all_items_a = interests_a | events_a
    all_items_b = interests_b | events_b
    union = all_items_a | all_items_b
    intersection = all_items_a & all_items_b
    match_score = (len(intersection) / len(union) * 100) if union else 0.0

    return ProfileComparison(
        match_score=round(match_score, 1),
        shared=SharedInfo(events=shared_events, interests=shared_interests),
        differences=DifferencesInfo(only_me=only_a, only_them=only_b),
    )
