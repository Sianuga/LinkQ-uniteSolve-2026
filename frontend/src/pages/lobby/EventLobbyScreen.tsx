import { useState, useMemo, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { User as UserIcon } from 'lucide-react';
import LobbyScene from '@/components/3d/LobbyScene';
import LobbyOverlay from '@/components/3d/LobbyOverlay';
import { mockMatches, mockEvents } from '@/data/mockData';
import type { MatchCandidate } from '@/types';

/* ------------------------------------------------------------------ */
/*  Map MatchCandidate -> character format for LobbyScene              */
/* ------------------------------------------------------------------ */

function toCharacters(matches: MatchCandidate[]) {
  return matches.map((m) => ({
    id: m.user_id,
    name: m.name,
    avatarType: m.avatar,
    matchScore: m.match_score,
  }));
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
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#0a0a1a]">
      <p className="animate-pulse text-sm font-medium text-white/70">
        Entering lobby...
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  WebGL error fallback: 2D card grid                                 */
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
    <div className="flex h-dvh w-full flex-col bg-[#0a0a1a] text-white">
      {/* Header */}
      <div className="shrink-0 px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3">
        <p className="mb-2 text-xs text-red-400">
          3D scene unavailable: {error.message}
        </p>
        <h1 className="text-lg font-bold">Event Lobby</h1>
      </div>

      {/* Card grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {mockMatches.map((match) => {
            const color = AVATAR_COLORS[match.avatar] ?? '#9CA3AF';
            const pct = Math.round(match.match_score * 100);

            return (
              <button
                key={match.user_id}
                onClick={() => navigate(`/users/${match.user_id}`)}
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4
                           transition-colors hover:bg-white/10"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: color + '22', border: `2px solid ${color}` }}
                >
                  <UserIcon className="h-6 w-6" style={{ color }} />
                </div>
                <p className="w-full truncate text-center text-sm font-semibold">
                  {match.name}
                </p>
                <p className="text-xs text-blue-400">{pct}% match</p>
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
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);

  const event = mockEvents.find((e) => e.id === id);

  const characters = useMemo(() => toCharacters(mockMatches), []);

  const selectedCharacterData = useMemo(() => {
    if (!selectedCharacterId) return null;
    const match = mockMatches.find((m) => m.user_id === selectedCharacterId);
    return match ? toSelectedCharacter(match) : null;
  }, [selectedCharacterId]);

  return (
    <div className="h-dvh w-full relative overflow-hidden bg-[#0a0a1a]">
      {/* 3D Scene */}
      <ErrorBoundary FallbackComponent={WebGLFallback}>
        <Suspense fallback={<LobbyLoading />}>
          <LobbyScene
            characters={characters}
            selectedId={selectedCharacterId}
            onSelectCharacter={setSelectedCharacterId}
          />
        </Suspense>
      </ErrorBoundary>

      {/* 2D Overlay */}
      <LobbyOverlay
        eventTitle={event?.title ?? 'Event Lobby'}
        selectedCharacter={selectedCharacterData}
        onBack={() => navigate(-1)}
        onViewProfile={(userId) => navigate(`/users/${userId}`)}
        onDismiss={() => setSelectedCharacterId(null)}
      />
    </div>
  );
}
