"""
Thin bridge to the matching engine's embedding functionality.

auth.py imports `embed_user_segments` from here. This delegates to
the real implementation in services/matching.py.
"""

from app.services.matching import ensure_user_embedded


def embed_user_segments(user: dict, segments: list[str] | None = None) -> None:
    """Embed (or re-embed) a user's profile into ChromaDB.

    Args:
        user: Full user dict with nested academic, interests, etc.
        segments: Optional list of changed segment names. Currently
                  the matching engine re-embeds all semantic segments
                  regardless, but this parameter is accepted for API
                  compatibility and future delta-update optimization.
    """
    user_id = user.get("id", "")
    if not user_id:
        return
    ensure_user_embedded(user_id, user)
