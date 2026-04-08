"""Notification routes for Nexus API.

Endpoints:
  GET    /notifications        -- list notifications for current user
  PATCH  /notifications/{id}   -- mark a notification as read
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import db
from app.core.security import get_current_user
from app.models.schemas import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["notifications"])


# ---------------------------------------------------------------------------
# GET /notifications -- list notifications for current user
# ---------------------------------------------------------------------------
@router.get("", response_model=list[NotificationResponse])
def list_notifications(
    current_user: dict = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    """Return notifications for the authenticated user, newest first."""
    user_id = current_user["id"]
    user_notifs: list[dict] = db.notifications.get(user_id, [])

    # Sort newest first (by timestamp descending)
    sorted_notifs = sorted(
        user_notifs,
        key=lambda n: n.get("timestamp", ""),
        reverse=True,
    )

    page = sorted_notifs[offset : offset + limit]
    return [NotificationResponse(**n) for n in page]


# ---------------------------------------------------------------------------
# PATCH /notifications/{id} -- mark as read
# ---------------------------------------------------------------------------
@router.patch("/{notification_id}", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Mark a single notification as read.

    Only the owner of the notification can mark it as read.
    """
    user_id = current_user["id"]
    user_notifs: list[dict] = db.notifications.get(user_id, [])

    for notif in user_notifs:
        if notif.get("id") == notification_id:
            notif["read"] = True
            return NotificationResponse(**notif)

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Notification not found",
    )
