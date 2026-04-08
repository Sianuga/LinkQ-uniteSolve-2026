// ==================== User ====================
export type AvatarType = 'buff_arnold' | 'banana_guy' | 'anime_girl' | 'bland_normal_guy' | 'mystery_silhouette';
export type StudyStyle = 'solo' | 'pair' | 'group';

export interface User {
  id: string;
  name: string;
  email: string;
  university: string;
  program: string;
  semester: number;
  avatar: AvatarType;
  avatar_url?: string;
  onboarding_complete: boolean;
  bio?: string;
  academic: {
    courses: string[];
    degree: string;
    thesis_topic?: string;
  };
  interests: {
    hobbies: string[];
    topics: string[];
    music?: string;
    sports?: string;
  };
  skills: {
    programming: string[];
    languages: string[];
    tools: string[];
  };
  goals: {
    learning: string[];
    career: string;
    short_term: string;
    here_to?: string;
  };
  availability: {
    preferred_times: string[];
    study_style: StudyStyle;
    timezone: string;
  };
  events: {
    attended: string[];
    interested: string[];
    categories: string[];
  };
}

export type UserSummary = Pick<User, 'id' | 'name' | 'university' | 'program' | 'avatar' | 'avatar_url'>;

// ==================== Event ====================
export type EventCategory = 'lecture' | 'seminar' | 'hackathon' | 'club' | 'social';

export interface AppEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  category: EventCategory;
  attendee_count?: number;
  image_url?: string;
}

// ==================== Connection ====================
export type ConnectionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: ConnectionStatus;
}

// ==================== Group ====================
export interface Group {
  group_id: string;
  name?: string;
  description?: string;
  event_id: string;
  number_of_member: number;
  looking_for?: number;
  members?: UserSummary[];
}

// ==================== Match ====================
export interface MatchCandidate {
  user_id: string;
  name: string;
  avatar: AvatarType;
  avatar_url?: string;
  match_score: number;
  shared: {
    events: number;
    interests: number;
    courses?: string[];
  };
  program?: string;
  tags?: string[];
}

export interface ProfileComparison {
  match_score: number;
  shared: {
    events: string[];
    interests: string[];
    courses?: string[];
  };
  differences: {
    only_me: string[];
    only_them: string[];
  };
}

// ==================== Message ====================
export interface Conversation {
  id: string;
  participant: UserSummary;
  last_message: string;
  last_message_time: string;
  unread: boolean;
}

export interface Message {
  id: string;
  sender_id: string;
  content: string;
  timestamp: string;
}

// ==================== Notification ====================
export type NotificationType = 'connection_request' | 'connection_accepted' | 'event_reminder' | 'new_message' | 'new_match' | 'group_invite';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  timestamp: string;
  link?: string;
  avatar_url?: string;
}

// ==================== Auth ====================
export interface AuthTokens {
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
