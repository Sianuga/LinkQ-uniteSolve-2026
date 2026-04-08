"""
Nexus Matching Engine
=====================
Core matching service using ChromaDB for vector storage and sentence-transformers
for semantic embedding. Combines cosine similarity on semantic segments with
Jaccard similarity on categorical segments, using context-aware weights based
on event category.

Segments:
  Semantic  (cosine similarity via ChromaDB):  academic, interests, goals, events
  Categorical (Jaccard set overlap):           skills.programming, skills.languages,
                                               skills.tools, availability
"""

from __future__ import annotations

import logging
import random
from typing import Any, TypedDict

from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Graceful fallback: if sentence-transformers or chromadb are not installed,
# the service degrades to random scores (useful for demo / frontend dev).
# ---------------------------------------------------------------------------
_HAS_ML = True
_model = None
_chroma_client = None
_collection = None

try:
    from sentence_transformers import SentenceTransformer
    import chromadb
except Exception:
    _HAS_ML = False
    logger.warning(
        "sentence-transformers and/or chromadb not available. "
        "Matching engine will return random demo scores."
    )

# ---------------------------------------------------------------------------
# Type aliases
# ---------------------------------------------------------------------------

SEMANTIC_SEGMENTS = ("academic", "interests", "goals", "events")
CATEGORICAL_SEGMENTS = ("skills_programming", "skills_languages", "skills_tools", "availability")
ALL_SEGMENTS = SEMANTIC_SEGMENTS + CATEGORICAL_SEGMENTS


class SegmentScores(TypedDict, total=False):
    academic: float
    interests: float
    goals: float
    events: float
    skills: float          # aggregated from 3 sub-segments
    availability: float


class MatchResult(TypedDict):
    total_score: float
    per_segment_scores: dict[str, float]
    shared_items: dict[str, list[str]]


class MatchCandidate(TypedDict):
    user_id: str
    name: str
    avatar: str
    match_score: float
    per_segment_scores: dict[str, float]
    shared: dict[str, list[str]]


class ProfileComparison(TypedDict):
    match_score: float
    per_segment_scores: dict[str, float]
    shared: dict[str, list[str]]
    differences: dict[str, list[str]]


# ---------------------------------------------------------------------------
# Context-aware weight presets by event category
# ---------------------------------------------------------------------------

WEIGHT_PRESETS: dict[str, dict[str, float]] = {
    "seminar": {
        "academic": 0.35,
        "interests": 0.15,
        "goals": 0.20,
        "events": 0.15,
        "skills": 0.10,
        "availability": 0.05,
    },
    "lecture": {
        "academic": 0.35,
        "interests": 0.15,
        "goals": 0.20,
        "events": 0.15,
        "skills": 0.10,
        "availability": 0.05,
    },
    "hackathon": {
        "academic": 0.15,
        "interests": 0.15,
        "goals": 0.20,
        "events": 0.10,
        "skills": 0.30,
        "availability": 0.10,
    },
    "social": {
        "academic": 0.10,
        "interests": 0.40,
        "goals": 0.10,
        "events": 0.20,
        "skills": 0.05,
        "availability": 0.15,
    },
}

# Default weights used when the event category is unknown
DEFAULT_WEIGHTS = WEIGHT_PRESETS["lecture"]


# ============================================================================
# EmbeddingService — singleton that manages the model + ChromaDB collection
# ============================================================================

class EmbeddingService:
    """Manages sentence-transformer model and ChromaDB collection for
    segmented user embeddings."""

    def __init__(self) -> None:
        global _model, _chroma_client, _collection

        if not _HAS_ML:
            logger.info("ML libraries unavailable — EmbeddingService running in demo mode.")
            self.model = None
            self.collection = None
            return

        # Load sentence-transformers model (cached after first call)
        if _model is None:
            logger.info("Loading sentence-transformers model: %s", settings.EMBEDDING_MODEL)
            _model = SentenceTransformer(settings.EMBEDDING_MODEL)
            logger.info("Model loaded successfully.")
        self.model = _model

        # Initialise ChromaDB persistent client
        if _chroma_client is None:
            logger.info("Initialising ChromaDB client at: %s", settings.CHROMA_PERSIST_DIR)
            _chroma_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)
        self.client = _chroma_client

        # Single collection with metadata filters (segment_type + user_id)
        if _collection is None:
            _collection = self.client.get_or_create_collection(
                name="nexus_user_segments",
                metadata={"hnsw:space": "cosine"},
            )
        self.collection = _collection

    # ------------------------------------------------------------------
    # Text templating
    # ------------------------------------------------------------------

    @staticmethod
    def profile_to_texts(user: dict) -> dict[str, str]:
        """Convert structured user data into natural-language strings
        for each semantic segment.

        Returns a dict with keys: academic, interests, goals, events.
        """
        texts: dict[str, str] = {}

        # --- academic ---
        academic = user.get("academic", {})
        degree = academic.get("degree", "")
        courses = academic.get("courses", [])
        thesis = academic.get("thesis_topic", "")
        program = user.get("program", "")

        parts: list[str] = []
        if degree:
            parts.append(f"{degree} student")
        elif program:
            parts.append(f"{program} student")
        if courses:
            parts.append(f"studying {', '.join(courses)}")
        if thesis:
            parts.append(f"Thesis on {thesis}")

        # Add research interests from goals if relevant
        goals = user.get("goals", {})
        career = goals.get("career", "")
        if career and any(kw in career.lower() for kw in ("research", "academic", "phd")):
            parts.append(f"Interested in {career}")

        texts["academic"] = ". ".join(parts) + "." if parts else "Student."

        # --- interests ---
        interests = user.get("interests", {})
        hobbies = interests.get("hobbies", [])
        topics = interests.get("topics", [])
        music = interests.get("music", "")
        sports = interests.get("sports", "")
        bio = user.get("bio", "")

        parts = []
        if hobbies:
            parts.append(f"Enjoys {' and '.join(hobbies)}")
        if topics:
            parts.append(f"Follows {' and '.join(topics)}")
        if music:
            parts.append(f"Listens to {music}")
        if sports:
            parts.append(f"Plays {sports}")
        if bio:
            parts.append(bio)

        texts["interests"] = ". ".join(parts) + "." if parts else "No interests listed."

        # --- goals ---
        learning = goals.get("learning", [])
        short_term = goals.get("short_term", "")
        here_to = goals.get("here_to", "")

        parts = []
        if learning:
            parts.append(f"Wants to learn {' and '.join(learning)}")
        if career:
            parts.append(f"Career goal: {career}")
        if short_term:
            parts.append(f"Currently looking for {short_term}")
        if here_to:
            parts.append(f"Here to {here_to}")

        texts["goals"] = ". ".join(parts) + "." if parts else "No goals listed."

        # --- events ---
        events = user.get("events", {})
        attended = events.get("attended", [])
        interested = events.get("interested", [])
        categories = events.get("categories", [])

        parts = []
        if categories:
            parts.append(f"Attended {' and '.join(categories)}")
        if attended:
            parts.append(f"Been to {', '.join(attended)}")
        if interested:
            parts.append(f"Interested in {', '.join(interested)}")

        texts["events"] = ". ".join(parts) + "." if parts else "No event history."

        return texts

    # ------------------------------------------------------------------
    # Embedding / upsert
    # ------------------------------------------------------------------

    def embed_user(self, user_id: str, user: dict) -> None:
        """Generate semantic embeddings for all segments and upsert into ChromaDB.

        Each segment is stored as a separate document with metadata
        ``{user_id, segment_type}`` so they can be filtered independently.
        """
        if self.model is None or self.collection is None:
            logger.debug("embed_user skipped — ML libraries unavailable.")
            return

        texts = self.profile_to_texts(user)

        ids: list[str] = []
        documents: list[str] = []
        embeddings: list[list[float]] = []
        metadatas: list[dict[str, str]] = []

        for segment_type, text in texts.items():
            doc_id = f"{user_id}__{segment_type}"
            embedding = self.model.encode(text).tolist()

            ids.append(doc_id)
            documents.append(text)
            embeddings.append(embedding)
            metadatas.append({
                "user_id": user_id,
                "segment_type": segment_type,
            })

        self.collection.upsert(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )
        logger.info("Embedded %d segments for user %s", len(ids), user_id)

    # ------------------------------------------------------------------
    # Cosine similarity via ChromaDB query
    # ------------------------------------------------------------------

    def cosine_similarity_segment(
        self,
        user_a_id: str,
        user_b_id: str,
        segment_type: str,
    ) -> float:
        """Return cosine similarity (0..1) between two users for a given
        semantic segment by querying ChromaDB.

        ChromaDB stores *distances*; cosine distance = 1 - cosine_similarity.
        """
        if self.model is None or self.collection is None:
            return random.uniform(0.3, 0.95)

        query_id = f"{user_a_id}__{segment_type}"

        # Fetch user A's embedding to use as the query vector
        try:
            result_a = self.collection.get(
                ids=[query_id],
                include=["embeddings"],
            )
        except Exception:
            logger.warning("Could not fetch embedding for %s", query_id)
            return 0.0

        if not result_a["embeddings"] or len(result_a["embeddings"]) == 0:
            return 0.0

        query_embedding = result_a["embeddings"][0]

        # Query for user B's segment — use where filter so we only hit
        # the exact document we want.
        try:
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=1,
                where={
                    "$and": [
                        {"user_id": {"$eq": user_b_id}},
                        {"segment_type": {"$eq": segment_type}},
                    ]
                },
                include=["distances"],
            )
        except Exception as exc:
            logger.warning("ChromaDB query failed for segment %s: %s", segment_type, exc)
            return 0.0

        if not results["distances"] or not results["distances"][0]:
            return 0.0

        # ChromaDB cosine distance ∈ [0, 2]; similarity = 1 - distance
        distance = results["distances"][0][0]
        similarity = max(0.0, 1.0 - distance)
        return round(similarity, 4)


# ============================================================================
# Module-level helpers
# ============================================================================

def jaccard_similarity(set_a: set, set_b: set) -> float:
    """Compute Jaccard similarity: |A ∩ B| / |A ∪ B|.
    Returns 0.0 if both sets are empty."""
    if not set_a and not set_b:
        return 0.0
    intersection = set_a & set_b
    union = set_a | set_b
    return round(len(intersection) / len(union), 4)


def _extract_set(user: dict, *keys: str) -> set[str]:
    """Safely drill into nested dict and return a set of lowercase strings."""
    obj: Any = user
    for key in keys:
        if isinstance(obj, dict):
            obj = obj.get(key, [])
        else:
            return set()
    if isinstance(obj, list):
        return {str(item).lower().strip() for item in obj if item}
    if isinstance(obj, str):
        return {obj.lower().strip()} if obj.strip() else set()
    return set()


def _get_shared_items(user_a: dict, user_b: dict) -> dict[str, list[str]]:
    """Find shared items across multiple categorical dimensions."""
    shared: dict[str, list[str]] = {}

    # Skills
    for subkey in ("programming", "languages", "tools"):
        set_a = _extract_set(user_a, "skills", subkey)
        set_b = _extract_set(user_b, "skills", subkey)
        overlap = sorted(set_a & set_b)
        if overlap:
            shared[f"skills_{subkey}"] = overlap

    # Courses
    courses_a = _extract_set(user_a, "academic", "courses")
    courses_b = _extract_set(user_b, "academic", "courses")
    course_overlap = sorted(courses_a & courses_b)
    if course_overlap:
        shared["courses"] = course_overlap

    # Hobbies / interests
    hobbies_a = _extract_set(user_a, "interests", "hobbies")
    hobbies_b = _extract_set(user_b, "interests", "hobbies")
    hobby_overlap = sorted(hobbies_a & hobbies_b)
    if hobby_overlap:
        shared["hobbies"] = hobby_overlap

    topics_a = _extract_set(user_a, "interests", "topics")
    topics_b = _extract_set(user_b, "interests", "topics")
    topic_overlap = sorted(topics_a & topics_b)
    if topic_overlap:
        shared["topics"] = topic_overlap

    # Events attended
    events_a = _extract_set(user_a, "events", "attended")
    events_b = _extract_set(user_b, "events", "attended")
    event_overlap = sorted(events_a & events_b)
    if event_overlap:
        shared["events"] = event_overlap

    # Availability
    avail_a = _extract_set(user_a, "availability", "preferred_times")
    avail_b = _extract_set(user_b, "availability", "preferred_times")
    avail_overlap = sorted(avail_a & avail_b)
    if avail_overlap:
        shared["availability"] = avail_overlap

    return shared


def _get_differences(user_a: dict, user_b: dict) -> dict[str, list[str]]:
    """Return items that exist only in user_a (only_me) and only in user_b (only_them)."""
    only_me: list[str] = []
    only_them: list[str] = []

    for category, *path in [
        ("skills.programming", "skills", "programming"),
        ("skills.languages", "skills", "languages"),
        ("skills.tools", "skills", "tools"),
        ("academic.courses", "academic", "courses"),
        ("interests.hobbies", "interests", "hobbies"),
        ("interests.topics", "interests", "topics"),
    ]:
        set_a = _extract_set(user_a, *path)
        set_b = _extract_set(user_b, *path)
        for item in sorted(set_a - set_b):
            only_me.append(f"{category}: {item}")
        for item in sorted(set_b - set_a):
            only_them.append(f"{category}: {item}")

    return {"only_me": only_me, "only_them": only_them}


# ============================================================================
# Core scoring
# ============================================================================

# Module-level singleton (lazy-initialised)
_embedding_service: EmbeddingService | None = None


def get_embedding_service() -> EmbeddingService:
    """Return (or create) the singleton EmbeddingService."""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service


def compute_match_score(
    user_a: dict,
    user_b: dict,
    event_category: str = "lecture",
) -> MatchResult:
    """Compute a weighted match score between two users.

    Combines:
      - Cosine similarity on semantic segments (via ChromaDB)
      - Jaccard similarity on categorical segments
      - Context-aware weights based on ``event_category``

    Returns ``MatchResult`` with total_score, per_segment_scores, shared_items.
    """
    svc = get_embedding_service()
    user_a_id = user_a.get("id", "")
    user_b_id = user_b.get("id", "")

    # ---- Semantic segment scores (cosine similarity) ----
    segment_scores: dict[str, float] = {}
    for seg in SEMANTIC_SEGMENTS:
        if _HAS_ML and svc.model is not None:
            score = svc.cosine_similarity_segment(user_a_id, user_b_id, seg)
        else:
            # Demo fallback: deterministic-ish random based on user ids + segment
            seed = hash(f"{user_a_id}:{user_b_id}:{seg}") % (2**31)
            rng = random.Random(seed)
            score = round(rng.uniform(0.35, 0.95), 4)
        segment_scores[seg] = score

    # ---- Categorical segment scores (Jaccard) ----
    # skills: average of programming, languages, tools
    skill_scores: list[float] = []
    for subkey in ("programming", "languages", "tools"):
        set_a = _extract_set(user_a, "skills", subkey)
        set_b = _extract_set(user_b, "skills", subkey)
        skill_scores.append(jaccard_similarity(set_a, set_b))
    segment_scores["skills"] = round(sum(skill_scores) / max(len(skill_scores), 1), 4)

    # availability: Jaccard on preferred_times + study_style match bonus
    avail_a = _extract_set(user_a, "availability", "preferred_times")
    avail_b = _extract_set(user_b, "availability", "preferred_times")
    avail_score = jaccard_similarity(avail_a, avail_b)

    style_a = user_a.get("availability", {}).get("study_style", "")
    style_b = user_b.get("availability", {}).get("study_style", "")
    if style_a and style_b and style_a.lower() == style_b.lower():
        avail_score = min(1.0, avail_score + 0.2)  # bonus for matching study style

    segment_scores["availability"] = round(avail_score, 4)

    # ---- Weighted total ----
    weights = WEIGHT_PRESETS.get(event_category.lower(), DEFAULT_WEIGHTS)
    total = 0.0
    for seg_name, weight in weights.items():
        total += weight * segment_scores.get(seg_name, 0.0)
    total = round(total, 4)

    # ---- Shared items ----
    shared = _get_shared_items(user_a, user_b)

    return MatchResult(
        total_score=total,
        per_segment_scores=segment_scores,
        shared_items=shared,
    )


# ============================================================================
# High-level match retrieval
# ============================================================================

def get_matches_for_event(
    user_id: str,
    event_id: str,
    db: Any,
) -> list[MatchCandidate]:
    """Get ranked match candidates for ``user_id`` at ``event_id``.

    Steps:
    1. Look up event participants, excluding current user.
    2. Determine event category for weight selection.
    3. Compute match score for every participant.
    4. Sort descending by total_score.
    """
    # --- Resolve current user data ---
    user_a = db.users.get(user_id)
    if user_a is None:
        logger.warning("User %s not found in database.", user_id)
        return []

    # --- Resolve event and its category ---
    event = db.events.get(event_id)
    if event is None:
        logger.warning("Event %s not found in database.", event_id)
        return []

    event_category = event.get("category", "lecture").lower()

    # --- Get participants (excluding current user) ---
    participants: list[str] = event.get("participants", [])
    if user_id not in participants:
        # User might be in a different field format
        pass

    candidate_ids = [pid for pid in participants if pid != user_id]

    # --- Compute scores ---
    candidates: list[MatchCandidate] = []
    for cid in candidate_ids:
        user_b = db.users.get(cid)
        if user_b is None:
            continue

        result = compute_match_score(user_a, user_b, event_category)

        candidates.append(MatchCandidate(
            user_id=cid,
            name=user_b.get("name", "Unknown"),
            avatar=user_b.get("avatar", "mystery_silhouette"),
            match_score=result["total_score"],
            per_segment_scores=result["per_segment_scores"],
            shared=result["shared_items"],
        ))

    # Sort by match score descending
    candidates.sort(key=lambda c: c["match_score"], reverse=True)
    return candidates


def get_profile_comparison(
    user_id: str,
    target_id: str,
    event_id: str | None,
    db: Any,
) -> ProfileComparison | None:
    """Compute a detailed comparison between two user profiles.

    Returns match score, per-segment breakdown, shared items, and differences.
    """
    user_a = db.users.get(user_id)
    user_b = db.users.get(target_id)

    if user_a is None or user_b is None:
        return None

    # Determine event category for weight selection
    event_category = "lecture"  # default
    if event_id:
        event = db.events.get(event_id)
        if event:
            event_category = event.get("category", "lecture").lower()

    result = compute_match_score(user_a, user_b, event_category)
    differences = _get_differences(user_a, user_b)

    # Merge shared events from both attended lists and the specific event
    shared = result["shared_items"]

    # Find shared events (user-level, not just the current event)
    events_a = set(user_a.get("events", {}).get("attended", []))
    events_b = set(user_b.get("events", {}).get("attended", []))
    shared_events = sorted(events_a & events_b)
    if shared_events:
        shared["events_attended"] = shared_events

    return ProfileComparison(
        match_score=result["total_score"],
        per_segment_scores=result["per_segment_scores"],
        shared=shared,
        differences=differences,
    )


# ============================================================================
# Group matching support
# ============================================================================

def get_matches_for_group(
    group_id: str,
    event_id: str,
    looking_for: int,
    db: Any,
) -> list[MatchCandidate]:
    """Find match candidates for an existing group at an event.

    The group's composite profile is built by averaging scores across all
    group members, so candidates who complement the *whole group* rank highest.
    """
    group = db.groups.get(group_id)
    if group is None:
        logger.warning("Group %s not found.", group_id)
        return []

    member_ids: list[str] = group.get("members", [])
    if not member_ids:
        return []

    # Get event info
    event = db.events.get(event_id)
    if event is None:
        return []

    event_category = event.get("category", "lecture").lower()
    participants: list[str] = event.get("participants", [])

    # Candidates are event participants who are NOT already in the group
    member_set = set(member_ids)
    candidate_ids = [pid for pid in participants if pid not in member_set]

    # For each candidate, compute average match against all group members
    candidates: list[MatchCandidate] = []
    for cid in candidate_ids:
        user_b = db.users.get(cid)
        if user_b is None:
            continue

        member_scores: list[MatchResult] = []
        for mid in member_ids:
            user_m = db.users.get(mid)
            if user_m is None:
                continue
            member_scores.append(compute_match_score(user_m, user_b, event_category))

        if not member_scores:
            continue

        # Average the total scores
        avg_total = round(
            sum(ms["total_score"] for ms in member_scores) / len(member_scores), 4
        )

        # Average per-segment scores
        avg_segments: dict[str, float] = {}
        for seg in member_scores[0]["per_segment_scores"]:
            vals = [ms["per_segment_scores"].get(seg, 0.0) for ms in member_scores]
            avg_segments[seg] = round(sum(vals) / len(vals), 4)

        # Merge shared items across all member comparisons
        merged_shared: dict[str, list[str]] = {}
        for ms in member_scores:
            for key, items in ms["shared_items"].items():
                existing = set(merged_shared.get(key, []))
                existing.update(items)
                merged_shared[key] = sorted(existing)

        candidates.append(MatchCandidate(
            user_id=cid,
            name=user_b.get("name", "Unknown"),
            avatar=user_b.get("avatar", "mystery_silhouette"),
            match_score=avg_total,
            per_segment_scores=avg_segments,
            shared=merged_shared,
        ))

    candidates.sort(key=lambda c: c["match_score"], reverse=True)

    # If looking_for is specified, limit results to that count
    if looking_for > 0:
        candidates = candidates[:looking_for]

    return candidates


# ============================================================================
# Ensure embeddings exist for a user (called on onboarding / profile update)
# ============================================================================

def ensure_user_embedded(user_id: str, user: dict) -> None:
    """Embed (or re-embed) a user's profile segments into ChromaDB.
    Safe to call repeatedly — uses upsert."""
    svc = get_embedding_service()
    svc.embed_user(user_id, user)
