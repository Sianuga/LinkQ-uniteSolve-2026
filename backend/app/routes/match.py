from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import db
from app.core.security import get_current_user
from app.models.schemas import MatchCandidate, SharedInfo

router = APIRouter(prefix="/match", tags=["matching"])


def _jaccard(set_a: set, set_b: set) -> float:
    """Compute Jaccard similarity between two sets."""
    union = set_a | set_b
    if not union:
        return 0.0
    return len(set_a & set_b) / len(union)


def _compute_match_score(user_a: dict, user_b: dict, event_category: str = "") -> float:
    """
    Compute a weighted match score between two users.
    Uses Jaccard similarity on categorical data (skills, availability)
    and simple overlap on semantic segments (academic, interests, goals, events).
    Full vector-based matching via ChromaDB is available when the matching service is initialized.
    """
    # Academic overlap (courses)
    courses_a = set(user_a.get("academic", {}).get("courses", []))
    courses_b = set(user_b.get("academic", {}).get("courses", []))
    academic_score = _jaccard(courses_a, courses_b)

    # Interests overlap (hobbies + topics)
    interests_a = set(
        user_a.get("interests", {}).get("hobbies", [])
        + user_a.get("interests", {}).get("topics", [])
    )
    interests_b = set(
        user_b.get("interests", {}).get("hobbies", [])
        + user_b.get("interests", {}).get("topics", [])
    )
    interests_score = _jaccard(interests_a, interests_b)

    # Goals overlap (learning goals)
    goals_a = set(user_a.get("goals", {}).get("learning", []))
    goals_b = set(user_b.get("goals", {}).get("learning", []))
    goals_score = _jaccard(goals_a, goals_b)

    # Events overlap (attended + interested)
    events_a = set(
        user_a.get("events", {}).get("attended", [])
        + user_a.get("events", {}).get("interested", [])
    )
    events_b = set(
        user_b.get("events", {}).get("attended", [])
        + user_b.get("events", {}).get("interested", [])
    )
    events_score = _jaccard(events_a, events_b)

    # Skills overlap (programming + tools + languages)
    skills_a = set(
        user_a.get("skills", {}).get("programming", [])
        + user_a.get("skills", {}).get("tools", [])
        + user_a.get("skills", {}).get("languages", [])
    )
    skills_b = set(
        user_b.get("skills", {}).get("programming", [])
        + user_b.get("skills", {}).get("tools", [])
        + user_b.get("skills", {}).get("languages", [])
    )
    skills_score = _jaccard(skills_a, skills_b)

    # Availability overlap (preferred_times + study_style match)
    avail_a = set(user_a.get("availability", {}).get("preferred_times", []))
    avail_b = set(user_b.get("availability", {}).get("preferred_times", []))
    avail_score = _jaccard(avail_a, avail_b)
    # Bonus for matching study style
    if (
        user_a.get("availability", {}).get("study_style")
        and user_a.get("availability", {}).get("study_style")
        == user_b.get("availability", {}).get("study_style")
    ):
        avail_score = min(1.0, avail_score + 0.3)

    # Context-aware weights based on event category
    category = event_category.lower() if event_category else ""
    if category in ("seminar", "lecture"):
        weights = {"academic": 0.35, "interests": 0.15, "goals": 0.20, "events": 0.15, "skills": 0.10, "availability": 0.05}
    elif category == "hackathon":
        weights = {"academic": 0.15, "interests": 0.15, "goals": 0.20, "events": 0.10, "skills": 0.30, "availability": 0.10}
    elif category == "social":
        weights = {"academic": 0.10, "interests": 0.40, "goals": 0.10, "events": 0.20, "skills": 0.05, "availability": 0.15}
    else:
        # Default balanced weights
        weights = {"academic": 0.20, "interests": 0.25, "goals": 0.15, "events": 0.15, "skills": 0.15, "availability": 0.10}

    total = (
        weights["academic"] * academic_score
        + weights["interests"] * interests_score
        + weights["goals"] * goals_score
        + weights["events"] * events_score
        + weights["skills"] * skills_score
        + weights["availability"] * avail_score
    )

    return round(total * 100, 1)


@router.post("/{match_id}")
def submit_match(
    match_id: str,
    event_id: str = Query(default=""),
    type: str = Query(default="user"),
    looking_for: int = Query(default=0),
    user_id: str = Depends(get_current_user),
):
    """
    Submit a matching request.
    match_id is the user_id (type=user) or group_id (type=group) to find matches for.
    """
    # Get event category for context-aware weighting
    event_category = ""
    participant_ids: list[str] = []

    if event_id:
        event = db.events.get(event_id)
        if event:
            event_category = event.get("category", "")
            participant_ids = event.get("participants", [])

    if type == "user":
        source_user = db.users.get(match_id)
        if not source_user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Match against event participants or all users
        candidate_ids = participant_ids if participant_ids else list(db.users.keys())
        candidates: list[MatchCandidate] = []

        for cid in candidate_ids:
            if cid == match_id:
                continue
            candidate = db.users.get(cid)
            if not candidate:
                continue

            score = _compute_match_score(source_user, candidate, event_category)

            # Compute shared info
            interests_src = set(
                source_user.get("interests", {}).get("hobbies", [])
                + source_user.get("interests", {}).get("topics", [])
            )
            interests_cand = set(
                candidate.get("interests", {}).get("hobbies", [])
                + candidate.get("interests", {}).get("topics", [])
            )
            events_src = set(
                source_user.get("events", {}).get("attended", [])
                + source_user.get("events", {}).get("interested", [])
            )
            events_cand = set(
                candidate.get("events", {}).get("attended", [])
                + candidate.get("events", {}).get("interested", [])
            )

            candidates.append(MatchCandidate(
                user_id=cid,
                name=candidate.get("name", ""),
                avatar=candidate.get("avatar", ""),
                match_score=score,
                shared=SharedInfo(
                    events=list(events_src & events_cand),
                    interests=list(interests_src & interests_cand),
                ),
            ))

        candidates.sort(key=lambda c: c.match_score, reverse=True)
        return candidates

    elif type == "group":
        group = db.groups.get(match_id)
        if not group:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Group not found")

        # For group matching, aggregate member profiles and find complementary users
        member_ids = group.get("members", [])
        candidate_ids = participant_ids if participant_ids else list(db.users.keys())
        candidates = []

        for cid in candidate_ids:
            if cid in member_ids:
                continue
            candidate = db.users.get(cid)
            if not candidate:
                continue

            # Average score against all group members
            scores = []
            for mid in member_ids:
                member = db.users.get(mid)
                if member:
                    scores.append(_compute_match_score(member, candidate, event_category))

            avg_score = sum(scores) / len(scores) if scores else 0.0

            candidates.append(MatchCandidate(
                user_id=cid,
                name=candidate.get("name", ""),
                avatar=candidate.get("avatar", ""),
                match_score=round(avg_score, 1),
                shared=SharedInfo(),
            ))

        candidates.sort(key=lambda c: c.match_score, reverse=True)

        # Limit to looking_for count if specified
        if looking_for > 0:
            candidates = candidates[:looking_for]

        return candidates

    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="type must be 'user' or 'group'")
