import { useState, useMemo, useCallback, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { User as UserIcon, X } from 'lucide-react';
import LobbyScene from '@/components/3d/LobbyScene';
import LobbyOverlay from '@/components/3d/LobbyOverlay';
import { mockMatches, mockEvents } from '@/data/mockData';
import type { MatchCandidate } from '@/types';

/* ------------------------------------------------------------------ */
/*  Map MatchCandidate -> character format for LobbyScene              */
/* ------------------------------------------------------------------ */

// Pick exactly 5 characters — one per avatar type for variety
const DESIRED_AVATARS: import('@/types').AvatarType[] = [
  'buff_arnold', 'banana_guy', 'anime_girl', 'bland_normal_guy', 'mystery_silhouette',
];

function toCharacters(matches: MatchCandidate[]) {
  const picked: ReturnType<typeof mapMatch>[] = [];
  const usedTypes = new Set<string>();

  // First pass: pick one of each desired avatar type
  for (const avatarType of DESIRED_AVATARS) {
    const match = matches.find((m) => m.avatar === avatarType && !usedTypes.has(m.user_id));
    if (match) {
      picked.push(mapMatch(match));
      usedTypes.add(match.user_id);
    }
  }

  // If we don't have 5 yet, fill from remaining matches
  for (const m of matches) {
    if (picked.length >= 5) break;
    if (!usedTypes.has(m.user_id)) {
      picked.push(mapMatch(m));
      usedTypes.add(m.user_id);
    }
  }

  return picked;
}

function mapMatch(m: MatchCandidate) {
  return {
    userId: m.user_id,
    name: m.name,
    avatarType: m.avatar,
    matchScore: m.match_score,
    program: m.program ?? '',
    tags: m.tags ?? [],
    shared: {
      events: m.shared.events,
      interests: m.shared.interests,
    },
  };
}

function toSelectedCharacter(match: MatchCandidate) {
  return {
    name: match.name,
    program: match.program ?? '',
    matchScore: match.match_score,
    avatarType: match.avatar,
    userId: match.user_id,
    tags: match.tags ?? [],
    shared: {
      events: match.shared.events,
      interests: match.shared.interests,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Loading screen                                                     */
/* ------------------------------------------------------------------ */

function LobbyLoading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-400 border-t-transparent mb-3" />
      <p className="animate-pulse text-sm font-medium text-text-secondary">
        Entering lobby...
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WebGL error fallback                                               */
/* ------------------------------------------------------------------ */

const AVATAR_COLORS: Record<string, string> = {
  buff_arnold: '#F97316',
  banana_guy: '#EAB308',
  anime_girl: '#06B6D4',
  bland_normal_guy: '#9CA3AF',
  mystery_silhouette: '#6B21A8',
};

function WebGLFallback({ error }: FallbackProps) {
  const navigate = useNavigate();

  return (
    <div className="flex h-dvh w-full flex-col bg-background text-text-primary">
      <div className="shrink-0 px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3">
        <p className="mb-2 text-xs text-error">3D unavailable: {error.message}</p>
        <h1 className="text-lg font-bold text-text-primary">Event Lobby</h1>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="grid grid-cols-2 gap-3">
          {mockMatches.map((match) => {
            const color = AVATAR_COLORS[match.avatar] ?? '#9CA3AF';
            const pct = Math.round(match.match_score * 100);
            return (
              <button
                key={match.user_id}
                onClick={() => navigate(`/users/${match.user_id}`)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-highlight p-4 hover:bg-background"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: color + '22', border: `2px solid ${color}` }}
                >
                  <UserIcon className="h-6 w-6" style={{ color }} />
                </div>
                <p className="w-full truncate text-center text-sm font-semibold text-text-primary">{match.name}</p>
                <p className="text-xs text-secondary">{pct}% match</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Screen                                                        */
/* ------------------------------------------------------------------ */

export default function EventLobbyScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const event = mockEvents.find((e) => e.id === id);
  const characters = useMemo(() => toCharacters(mockMatches), []);

  const [focusIndex, setFocusIndex] = useState(0);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [showListView, setShowListView] = useState(false);

  const selectedCharacterData = useMemo(() => {
    if (!selectedCharacterId) return null;
    const match = mockMatches.find((m) => m.user_id === selectedCharacterId);
    return match ? toSelectedCharacter(match) : null;
  }, [selectedCharacterId]);

  // Tap character → open bottom sheet + focus camera
  const handleSelectCharacter = useCallback(
    (userId: string) => {
      setSelectedCharacterId(userId);
      const idx = characters.findIndex((c) => c.userId === userId);
      if (idx >= 0) setFocusIndex(idx);
    },
    [characters],
  );

  return (
    <div className="h-dvh w-full relative overflow-hidden bg-background">
      {/* 3D Scene */}
      <div className="absolute inset-0 h-full w-full">
        <ErrorBoundary FallbackComponent={WebGLFallback}>
          <Suspense fallback={<LobbyLoading />}>
            <LobbyScene
              characters={characters}
              selectedId={selectedCharacterId}
              focusIndex={focusIndex}
              onSelectCharacter={handleSelectCharacter}
              onFocusChange={setFocusIndex}
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* 2D Overlay */}
      <LobbyOverlay
        eventTitle={event?.title ?? 'Event Lobby'}
        characters={characters.map(c => ({ name: c.name, matchScore: c.matchScore, avatarType: c.avatarType, userId: c.userId }))}
        focusIndex={focusIndex}
        partyCount={3}
        partyCapacity={10}
        selectedCharacter={selectedCharacterData}
        onBack={() => navigate(-1)}
        onViewProfile={(userId) => navigate(`/users/${userId}`)}
        onDismiss={() => setSelectedCharacterId(null)}
        onListView={() => setShowListView(true)}
        onFocusDot={(i) => setFocusIndex(i)}
        onChat={() => navigate('/messages/conv_001')}
        onSettings={() => navigate('/settings')}
      />

      {/* List view modal */}
      {showListView && (
        <div className="absolute inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md">
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3">
            <h2 className="text-lg font-bold text-text-primary">All Participants</h2>
            <button
              onClick={() => setShowListView(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-text-primary hover:bg-highlight"
              aria-label="Close list view"
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable grid */}
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <div className="grid grid-cols-2 gap-3">
              {characters.map((char) => {
                const color = AVATAR_COLORS[char.avatarType] ?? '#9CA3AF';
                const pct = Math.round(char.matchScore * 100);
                return (
                  <button
                    key={char.userId}
                    onClick={() => {
                      setShowListView(false);
                      navigate(`/users/${char.userId}`);
                    }}
                    className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-highlight p-4 hover:bg-background transition-colors"
                  >
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: color + '22', border: `2px solid ${color}` }}
                    >
                      <UserIcon className="h-6 w-6" style={{ color }} />
                    </div>
                    <p className="w-full truncate text-center text-sm font-semibold text-text-primary">{char.name}</p>
                    <p className="text-xs text-secondary">{pct}% match</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
