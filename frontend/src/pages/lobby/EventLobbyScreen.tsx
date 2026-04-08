import { useState, useMemo, useCallback, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { User as UserIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="flex h-full w-full flex-col items-center justify-center bg-[#0a0a1a]">
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-400 border-t-transparent mb-3" />
      <p className="animate-pulse text-sm font-medium text-white/70">
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
    <div className="flex h-dvh w-full flex-col bg-[#0a0a1a] text-white">
      <div className="shrink-0 px-4 pt-[max(env(safe-area-inset-top),12px)] pb-3">
        <p className="mb-2 text-xs text-red-400">3D unavailable: {error.message}</p>
        <h1 className="text-lg font-bold">Event Lobby</h1>
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
                className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: color + '22', border: `2px solid ${color}` }}
                >
                  <UserIcon className="h-6 w-6" style={{ color }} />
                </div>
                <p className="w-full truncate text-center text-sm font-semibold">{match.name}</p>
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
/*  Carousel dots                                                      */
/* ------------------------------------------------------------------ */

function CarouselDots({
  count,
  activeIndex,
  onDotClick,
}: {
  count: number;
  activeIndex: number;
  onDotClick: (i: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onDotClick(i)}
          className={`rounded-full transition-all duration-300 ${
            i === activeIndex
              ? 'h-2.5 w-2.5 bg-blue-400'
              : 'h-2 w-2 bg-white/30'
          }`}
        />
      ))}
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

  // Dots → move camera only, no sheet
  const handleDotClick = useCallback(
    (i: number) => {
      setFocusIndex(i);
    },
    [],
  );

  // Arrows → move camera only, no sheet
  const goPrev = useCallback(() => {
    setFocusIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const goNext = useCallback(() => {
    setFocusIndex((prev) => Math.min(characters.length - 1, prev + 1));
  }, [characters.length]);

  return (
    <div className="h-dvh w-full relative overflow-hidden bg-[#0a0a1a]">
      {/* 3D Scene — blurs when bottom sheet is open */}
      <div
        className="absolute inset-0 h-full w-full"
        style={{
          filter: selectedCharacterId
            ? 'blur(2px) brightness(0.7)'
            : 'none',
          transition: 'filter 0.3s ease-in-out',
        }}
      >
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
        selectedCharacter={selectedCharacterData}
        onBack={() => navigate(-1)}
        onViewProfile={(userId) => navigate(`/users/${userId}`)}
        onDismiss={() => setSelectedCharacterId(null)}
      />

      {/* Navigation arrows (mobile) */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
        <button
          onClick={goPrev}
          disabled={focusIndex === 0}
          className="pointer-events-auto h-11 w-11 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white disabled:opacity-20 transition-opacity"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={goNext}
          disabled={focusIndex === characters.length - 1}
          className="pointer-events-auto h-11 w-11 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm text-white disabled:opacity-20 transition-opacity"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Carousel dots */}
      <div className="absolute bottom-[max(5rem,calc(env(safe-area-inset-bottom)+4rem))] left-0 right-0 pointer-events-none">
        <div className="pointer-events-auto">
          <CarouselDots count={characters.length} activeIndex={focusIndex} onDotClick={handleDotClick} />
        </div>
      </div>
    </div>
  );
}
