"""Group routes for LinkQ API.

Endpoints:
  POST  /groups?event_id=          -- create a group for an event
  GET   /group/{id}                -- get group details with member list
  POST  /group/{group_id}          -- join a group
  GET   /group/event/{event_id}    -- list groups for an event with member counts
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.database import db
from app.core.security import get_current_user
from app.models.schemas import GroupCreate, GroupResponse, GroupSummary, UserSummary

router = APIRouter(tags=["groups"])


# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------

def _resolve_members(member_ids: list[str]) -> list[dict]:
    """Turn a list of user IDs into UserSummary-compatible dicts."""
    out: list[dict] = []
    for uid in member_ids:
        user = db.users.get(uid)
        if user:
            out.append(
                UserSummary(
                    id=user["id"],
                    name=user.get("name", ""),
                    university=user.get("university", ""),
                    program=user.get("program", ""),
                    avatar=user.get("avatar", ""),
                    avatar_url=user.get("avatar_url", ""),
                ).model_dump()
            )
    return out


def _event_exists(event_id: str) -> bool:
    """Check whether an event with the given ID exists in the DB."""
    if isinstance(db.events, dict):
        return event_id in db.events
    if isinstance(db.events, list):
        return any(e.get("id") == event_id for e in db.events)
    return False


# ---------------------------------------------------------------------------
# POST /groups?event_id= -- create group
# ---------------------------------------------------------------------------
@router.post("/groups", response_model=GroupResponse, status_code=status.HTTP_201_CREATED)
def create_group(
    body: GroupCreate,
    event_id: str = Query(..., description="ID of the event this group belongs to"),
    current_user: dict = Depends(get_current_user),
):
    """Create a new group for an event.  The creator is added as the first member."""
    user_id = current_user["id"]

    if not _event_exists(event_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    group_id = f"group_{uuid.uuid4().hex[:12]}"
    group = {
        "id": group_id,
        "name": body.name,
        "description": body.description,
        "event_id": event_id,
        "looking_for": body.looking_for,
        "members": [user_id],
    }
    db.groups[group_id] = group
    return GroupResponse(**group)


# ---------------------------------------------------------------------------
# GET /group/{id} -- group details with members
# ---------------------------------------------------------------------------
@router.get("/group/{group_id}")
def get_group(group_id: str):
    """Return group details including a resolved member list."""
    group = db.groups.get(group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Group not found"
        )

    members = _resolve_members(group.get("members", []))

    return {
        "id": group["id"],
        "name": group["name"],
        "description": group.get("description", ""),
        "event_id": group.get("event_id", ""),
        "looking_for": group.get("looking_for", 0),
        "members": members,
    }


# ---------------------------------------------------------------------------
# POST /group/{group_id} -- join group
# ---------------------------------------------------------------------------
@router.post("/group/{group_id}", status_code=status.HTTP_200_OK)
def join_group(
    group_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Join an existing group.

    Checks:
      - Group exists
      - Group is still looking for members
      - User is not already a member
    """
    user_id = current_user["id"]
    group = db.groups.get(group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Group not found"
        )

    members: list[str] = group.get("members", [])

    if user_id in members:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="You are already a member of this group",
        )

    # Capacity = first member (creator) + looking_for
    max_members = 1 + group.get("looking_for", 0)
    if len(members) >= max_members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group is no longer looking for members",
        )

    members.append(user_id)
    group["members"] = members

    return {"message": "Successfully joined the group", "group_id": group_id}


# ---------------------------------------------------------------------------
# GET /group/event/{event_id} -- list groups for an event
# ---------------------------------------------------------------------------
@router.get("/group/event/{event_id}", response_model=list[GroupSummary])
def get_groups_for_event(event_id: str):
    """Return all groups for a given event with member counts."""
    results: list[GroupSummary] = []
    for group in db.groups.values():
        if group.get("event_id") == event_id:
            results.append(
                GroupSummary(
                    group_id=group["id"],
                    number_of_member=len(group.get("members", [])),
                )
            )
    return results
