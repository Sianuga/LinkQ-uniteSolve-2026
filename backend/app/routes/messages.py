"""Messaging routes for LinkQ API.

Endpoints:
  GET   /conversations                   -- list conversations for current user
  GET   /messages/{conversation_id}      -- messages in a conversation (paginated)
  POST  /messages                        -- send a message
"""

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from app.core.database import db
from app.core.security import get_current_user
from app.models.schemas import ConversationSummary, MessageResponse

router = APIRouter(tags=["messages"])


# ---------------------------------------------------------------------------
# Local request schema (body includes conversation_id + content)
# ---------------------------------------------------------------------------

class SendMessageBody(BaseModel):
    conversation_id: str
    content: str


# ---------------------------------------------------------------------------
# Internal conversation registry
# ---------------------------------------------------------------------------
# The Database class stores messages keyed by conversation_id but does not
# have a first-class conversation registry.  We keep a lightweight dict on
# the db instance to track participants and metadata.

def _registry() -> dict[str, dict]:
    """Lazily initialise and return the conversation registry."""
    if not hasattr(db, "_conversation_registry"):
        db._conversation_registry: dict[str, dict] = {}  # type: ignore[attr-defined]
    return db._conversation_registry  # type: ignore[attr-defined]


# ---------------------------------------------------------------------------
# GET /conversations -- list conversations for current user
# ---------------------------------------------------------------------------
@router.get("/conversations", response_model=list[ConversationSummary])
def list_conversations(
    user_id: str = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Return conversations the current user participates in, newest first."""

    registry = _registry()
    results: list[dict] = []

    for cid, meta in registry.items():
        if user_id not in meta.get("participants", []):
            continue

        # Other participant (1-on-1)
        others = [p for p in meta.get("participants", []) if p != user_id]
        other_id = others[0] if others else ""
        other_user = db.users.get(other_id, {})

        # Latest message
        msgs = db.messages.get(cid, [])
        last = msgs[-1] if msgs else None

        results.append({
            "conversation_id": cid,
            "other_user_id": other_id,
            "other_user_name": other_user.get("name", ""),
            "last_message": last["content"] if last else "",
            "last_timestamp": last["timestamp"] if last else None,
        })

    # Sort newest first
    results.sort(key=lambda r: r.get("last_timestamp") or "", reverse=True)

    page = results[offset : offset + limit]
    return [ConversationSummary(**r) for r in page]


# ---------------------------------------------------------------------------
# GET /messages/{conversation_id} -- paginated message history
# ---------------------------------------------------------------------------
@router.get("/messages/{conversation_id}", response_model=list[MessageResponse])
def get_messages(
    conversation_id: str,
    user_id: str = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Return messages for a conversation (oldest first, paginated)."""

    registry = _registry()
    meta = registry.get(conversation_id)

    if meta is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    if user_id not in meta.get("participants", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this conversation",
        )

    msgs: list[dict] = db.messages.get(conversation_id, [])
    page = msgs[offset : offset + limit]
    return [MessageResponse(**m) for m in page]


# ---------------------------------------------------------------------------
# POST /messages -- send a message
# ---------------------------------------------------------------------------
@router.post("/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    body: SendMessageBody,
    user_id: str = Depends(get_current_user),
):
    """Send a message to an existing conversation.

    If the conversation_id does not exist the endpoint returns 404.
    The sender must be a participant.
    """

    registry = _registry()
    meta = registry.get(body.conversation_id)

    if meta is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    if user_id not in meta.get("participants", []):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this conversation",
        )

    msg_id = f"msg_{uuid.uuid4().hex[:12]}"
    now = datetime.now(timezone.utc).isoformat()

    message = {
        "id": msg_id,
        "sender_id": user_id,
        "content": body.content,
        "timestamp": now,
    }

    db.messages.setdefault(body.conversation_id, []).append(message)

    return MessageResponse(**message)
