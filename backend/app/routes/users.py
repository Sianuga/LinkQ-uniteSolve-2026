from fastapi import APIRouter, HTTPException, status

from app.core.database import db
from app.models.schemas import UserProfile

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
