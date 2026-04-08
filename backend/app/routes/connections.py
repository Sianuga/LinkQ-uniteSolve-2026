import uuid
from datetime import datetime, timezone

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import db
from app.core.security import get_current_user
from app.models.schemas import ConnectionRequest, ConnectionResponse, ConnectionUpdate

router = APIRouter(prefix="/connections", tags=["connections"])


@router.post("", response_model=ConnectionResponse, status_code=status.HTTP_200_OK)
def send_connection_request(body: ConnectionRequest, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    # Check target exists
    if body.target_user_id not in db.users:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found")

    if body.target_user_id == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot connect with yourself")

    # Check for existing connection
    for conn in db.connections:
        if (
            (conn["requester_id"] == user_id and conn["receiver_id"] == body.target_user_id)
            or (conn["requester_id"] == body.target_user_id and conn["receiver_id"] == user_id)
        ):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Connection already exists")

    conn_id = f"conn_{uuid.uuid4().hex[:12]}"
    connection = {
        "id": conn_id,
        "requester_id": user_id,
        "receiver_id": body.target_user_id,
        "status": "PENDING",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    db.connections.append(connection)

    # Create notification for receiver
    notif_id = f"notif_{uuid.uuid4().hex[:12]}"
    notif = {
        "id": notif_id,
        "user_id": body.target_user_id,
        "type": "connection_request",
        "message": f"{db.users[user_id].get('name', 'Someone')} sent you a connection request",
        "read": False,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "reference_id": conn_id,
    }
    db.notifications.setdefault(body.target_user_id, []).append(notif)

    return ConnectionResponse(**connection)


@router.get("", response_model=list[ConnectionResponse])
def list_connections(
    current_user: dict = Depends(get_current_user),
    status_filter: Optional[str] = Query(
        default=None,
        alias="status",
        description="Filter by status: PENDING, ACCEPTED, or REJECTED",
    ),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    user_id = current_user["id"]
    results = [
        c for c in db.connections
        if c["requester_id"] == user_id or c["receiver_id"] == user_id
    ]
    if status_filter is not None:
        results = [c for c in results if c.get("status") == status_filter]
    results = results[offset : offset + limit]
    return [ConnectionResponse(**c) for c in results]


@router.patch("/{connection_id}", response_model=ConnectionResponse)
def update_connection(
    connection_id: str,
    body: ConnectionUpdate,
    current_user: dict = Depends(get_current_user),
):
    user_id = current_user["id"]
    for conn in db.connections:
        if conn["id"] == connection_id:
            # Only the receiver can accept/reject
            if conn["receiver_id"] != user_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Only the receiver can update connection status",
                )
            # Must still be pending
            if conn["status"] != "PENDING":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Connection is already {conn['status']}",
                )
            conn["status"] = body.status

            # Notify requester of acceptance
            if body.status == "ACCEPTED":
                notif_id = f"notif_{uuid.uuid4().hex[:12]}"
                notif = {
                    "id": notif_id,
                    "user_id": conn["requester_id"],
                    "type": "connection_accepted",
                    "message": f"{db.users.get(user_id, {}).get('name', 'Someone')} accepted your connection request",
                    "read": False,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "reference_id": connection_id,
                }
                db.notifications.setdefault(conn["requester_id"], []).append(notif)

            return ConnectionResponse(**conn)

    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connection not found")
