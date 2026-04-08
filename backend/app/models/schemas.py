from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    token: str


# ---------------------------------------------------------------------------
# User — nested sub-models matching CLAUDE.md JSON structure
# ---------------------------------------------------------------------------

class AcademicInfo(BaseModel):
    courses: list[str] = []
    degree: str = ""
    thesis_topic: str = ""


class InterestsInfo(BaseModel):
    hobbies: list[str] = []
    topics: list[str] = []
    music: str = ""
    sports: str = ""


class SkillsInfo(BaseModel):
    programming: list[str] = []
    languages: list[str] = []
    tools: list[str] = []


class GoalsInfo(BaseModel):
    learning: list[str] = []
    career: str = ""
    short_term: str = ""
    here_to: str = ""


class AvailabilityInfo(BaseModel):
    preferred_times: list[str] = []
    study_style: str = ""  # "solo" | "pair" | "group"
    timezone: str = ""


class EventsInfo(BaseModel):
    attended: list[str] = []
    interested: list[str] = []
    categories: list[str] = []


class UserProfile(BaseModel):
    id: str
    name: str
    email: str = ""
    university: str = ""
    program: str = ""
    semester: int = 0
    avatar: str = ""
    avatar_url: str = ""
    onboarding_complete: bool = False
    academic: AcademicInfo = Field(default_factory=AcademicInfo)
    interests: InterestsInfo = Field(default_factory=InterestsInfo)
    skills: SkillsInfo = Field(default_factory=SkillsInfo)
    goals: GoalsInfo = Field(default_factory=GoalsInfo)
    availability: AvailabilityInfo = Field(default_factory=AvailabilityInfo)
    events: EventsInfo = Field(default_factory=EventsInfo)
    bio: str = ""


class UserProfileUpdate(BaseModel):
    """Partial update for PATCH /me — all fields optional."""
    name: str | None = None
    university: str | None = None
    program: str | None = None
    semester: int | None = None
    avatar: str | None = None
    onboarding_complete: bool | None = None
    academic: AcademicInfo | None = None
    interests: InterestsInfo | None = None
    skills: SkillsInfo | None = None
    goals: GoalsInfo | None = None
    availability: AvailabilityInfo | None = None
    events: EventsInfo | None = None
    bio: str | None = None


# ---------------------------------------------------------------------------
# OAuth / Onboarding
# ---------------------------------------------------------------------------

class OAuthRequest(BaseModel):
    """Body for POST /oauth — simulate module OAuth import."""
    university: str
    user_id: str | None = None  # optional; when provided, courses are stored on the user


class OAuthResponse(BaseModel):
    university: str
    courses: list[str]


class OnboardingRequest(BaseModel):
    """Body for POST /onboarding — all onboarding fields at once."""
    university: str | None = None
    program: str | None = None
    semester: int | None = None
    avatar: str | None = None
    academic: AcademicInfo | None = None
    interests: InterestsInfo | None = None
    skills: SkillsInfo | None = None
    goals: GoalsInfo | None = None
    availability: AvailabilityInfo | None = None
    events: EventsInfo | None = None
    bio: str | None = None


class UserSummary(BaseModel):
    id: str
    name: str
    university: str = ""
    program: str = ""
    avatar: str = ""
    avatar_url: str = ""


# ---------------------------------------------------------------------------
# Events
# ---------------------------------------------------------------------------

class EventCreate(BaseModel):
    title: str
    description: str = ""
    location: str = ""
    start_time: datetime
    end_time: datetime
    category: str = ""


class EventResponse(BaseModel):
    id: str
    title: str
    description: str = ""
    location: str = ""
    start_time: datetime
    end_time: datetime
    category: str = ""
    created_by: str = ""
    participants: list[str] = []


# ---------------------------------------------------------------------------
# Connections
# ---------------------------------------------------------------------------

class ConnectionRequest(BaseModel):
    target_user_id: str


class ConnectionUpdate(BaseModel):
    status: Literal["ACCEPTED", "REJECTED"]


class ConnectionResponse(BaseModel):
    id: str
    requester_id: str
    receiver_id: str
    status: str  # "PENDING" | "ACCEPTED" | "REJECTED"


# ---------------------------------------------------------------------------
# Groups
# ---------------------------------------------------------------------------

class GroupCreate(BaseModel):
    name: str
    description: str = ""
    looking_for: int = 0


class GroupResponse(BaseModel):
    id: str
    name: str
    description: str = ""
    event_id: str = ""
    looking_for: int = 0
    members: list[str] = []


class GroupJoin(BaseModel):
    status: Literal["ACCEPTED", "REJECTED"]


class GroupSummary(BaseModel):
    group_id: str
    number_of_member: int


# ---------------------------------------------------------------------------
# Matching
# ---------------------------------------------------------------------------

class MatchRequest(BaseModel):
    type: Literal["user", "group"] = "user"
    event_id: str = ""
    looking_for: int = 0


class SharedInfo(BaseModel):
    events: list[str] = []
    interests: list[str] = []


class MatchCandidate(BaseModel):
    user_id: str
    name: str
    avatar: str = ""
    match_score: float = 0.0
    shared: SharedInfo = Field(default_factory=SharedInfo)


class DifferencesInfo(BaseModel):
    only_me: list[str] = []
    only_them: list[str] = []


class ProfileComparison(BaseModel):
    match_score: float = 0.0
    shared: SharedInfo = Field(default_factory=SharedInfo)
    differences: DifferencesInfo = Field(default_factory=DifferencesInfo)


# ---------------------------------------------------------------------------
# Messages
# ---------------------------------------------------------------------------

class MessageSend(BaseModel):
    content: str


class MessageResponse(BaseModel):
    id: str
    sender_id: str
    content: str
    timestamp: datetime


class ConversationSummary(BaseModel):
    conversation_id: str
    other_user_id: str
    other_user_name: str = ""
    last_message: str = ""
    last_timestamp: datetime | None = None


# ---------------------------------------------------------------------------
# Notifications
# ---------------------------------------------------------------------------

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    type: str  # "connection_request" | "connection_accepted" | "event_reminder" | "new_message" | "new_match" | "group_invite"
    message: str = ""
    read: bool = False
    timestamp: datetime
    reference_id: str = ""  # id of the related entity (connection, event, etc.)
