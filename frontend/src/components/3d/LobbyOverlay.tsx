import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import {
  ArrowLeft,
  LayoutList,
  MessageCircle,
  Smile,
  Settings,
  Users,
  Sparkles,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SelectedCharacter {
  name: string;
  program: string;
  matchScore: number;
  avatarType: string;
  userId: string;
  tags: string[];
  shared: { events: number; interests: number };
}

interface CharacterSummary {
  name: string;
  matchScore: number;
  avatarType: string;
  userId: string;
}

export interface LobbyOverlayProps {
  eventTitle: string;
  characters: CharacterSummary[];
  focusIndex: number;
  partyCount: number;
  partyCapacity: number;
  selectedCharacter: SelectedCharacter | null;
  onBack: () => void;
  onViewProfile: (userId: string) => void;
  onDismiss: () => void;
  onListView: () => void;
  onFocusDot: (index: number) => void;
  onChat?: () => void;
  onSettings?: () => void;
  onEmote?: (emoji: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Avatar-type emoji map                                              */
/* ------------------------------------------------------------------ */

const AVATAR_EMOJI: Record<string, string> = {
  buff_arnold: '\u{1F4AA}',
  banana_guy: '\u{1F34C}',
  anime_girl: '\u{1F338}',
  bland_normal_guy: '\u{1F464}',
  mystery_silhouette: '\u{2753}',
  robot: '\u{1F916}',
  alien: '\u{1F47E}',
  wizard: '\u{1F9D9}',
  astronaut: '\u{1F468}\u{200D}\u{1F680}',
  ninja: '\u{1F977}',
  default: '\u{1F464}',
};

function avatarEmoji(type: string): string {
  return AVATAR_EMOJI[type.toLowerCase()] ?? AVATAR_EMOJI.default;
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const sheetVariants = {
  hidden: { y: '100%' },
  visible: {
    y: 0,
    transition: { type: 'spring', damping: 28, stiffness: 300 },
  },
  exit: {
    y: '100%',
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

const scrimVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const nameVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

/** Party fullness dots: filled = joined, empty = remaining */
function PartyBadge({
  count,
  capacity,
}: {
  count: number;
  capacity: number;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 shadow-sm">
      <Users className="h-3.5 w-3.5 text-primary" />
      <span className="whitespace-nowrap text-xs font-semibold text-text-primary">
        {count}/{capacity}
      </span>
    </div>
  );
}

/** Carousel navigation dots */
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
          type="button"
          onClick={() => onDotClick(i)}
          aria-label={`Go to character ${i + 1}`}
          className={`rounded-full transition-all duration-300 ${
            i === activeIndex
              ? 'h-3 w-3 bg-primary'
              : 'h-2.5 w-2.5 bg-border'
          }`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Emote picker                                                       */
/* ------------------------------------------------------------------ */

const EMOTE_LIST = [
  '\u{1F44B}', // wave
  '\u{1F389}', // party
  '\u{1F525}', // fire
  '\u{2764}\u{FE0F}', // heart
  '\u{1F602}', // joy
  '\u{1F91D}', // handshake
  '\u{1F4AA}', // flex
  '\u{1F393}', // grad cap
  '\u{2B50}', // star
] as const;

const emotePickerVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', damping: 22, stiffness: 400 },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
};

const emoteNotifVariants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

/** Floating emote notification pill at the top of the screen */
function EmoteNotification({ emoji }: { emoji: string | null }) {
  return (
    <AnimatePresence>
      {emoji && (
        <motion.div
          key={emoji + Date.now()}
          variants={emoteNotifVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="pointer-events-none absolute left-1/2 top-16 z-30 -translate-x-1/2
                     rounded-full bg-white/95 px-4 py-2 shadow-lg backdrop-blur-md
                     border border-border"
        >
          <span className="text-sm font-semibold text-text-primary">
            {emoji} sent!
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** 3x3 grid popup with emote buttons */
function EmotePicker({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    }
    // Defer listener to avoid closing immediately from the same click
    const id = requestAnimationFrame(() => {
      document.addEventListener('mousedown', handleClick);
    });
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={containerRef}
      variants={emotePickerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ transformOrigin: 'bottom right' }}
      className="absolute bottom-full right-0 mb-2 grid grid-cols-3 gap-1
                 rounded-2xl border border-border bg-white p-2 shadow-lg"
    >
      {EMOTE_LIST.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className="flex h-11 w-11 items-center justify-center rounded-xl text-xl
                     transition-colors hover:bg-highlight active:scale-95"
          aria-label={`Send ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </motion.div>
  );
}

/** Action buttons (bottom-right): chat, emote, settings */
function MiscIcons({
  onChat,
  onSettings,
  onEmote,
}: {
  onChat?: () => void;
  onSettings?: () => void;
  onEmote?: (emoji: string) => void;
}) {
  const [showEmotes, setShowEmotes] = useState(false);

  const handleEmoteSelect = useCallback(
    (emoji: string) => {
      setShowEmotes(false);
      onEmote?.(emoji);
    },
    [onEmote],
  );

  const items = [
    { Icon: MessageCircle, label: 'Open messages', onClick: onChat },
    {
      Icon: Smile,
      label: 'Emote',
      onClick: () => setShowEmotes((prev) => !prev),
    },
    { Icon: Settings, label: 'Open settings', onClick: onSettings },
  ] as const;

  return (
    <div className="flex items-center gap-2">
      {items.map(({ Icon, label, onClick }) => (
        <div key={label} className="relative">
          <button
            type="button"
            onClick={onClick}
            className={`flex h-10 w-10 items-center justify-center rounded-full
                       transition-colors ${
                         label === 'Emote' && showEmotes
                           ? 'bg-primary text-white'
                           : 'bg-highlight text-text-secondary hover:bg-border'
                       }`}
            aria-label={label}
            aria-expanded={label === 'Emote' ? showEmotes : undefined}
          >
            <Icon className="h-[18px] w-[18px]" />
          </button>

          {/* Emote picker popup (only on the Smile button) */}
          {label === 'Emote' && (
            <AnimatePresence>
              {showEmotes && (
                <EmotePicker
                  onSelect={handleEmoteSelect}
                  onClose={() => setShowEmotes(false)}
                />
              )}
            </AnimatePresence>
          )}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function LobbyOverlay({
  eventTitle,
  characters,
  focusIndex,
  partyCount,
  partyCapacity,
  selectedCharacter,
  onBack,
  onViewProfile,
  onDismiss,
  onListView,
  onFocusDot,
  onChat,
  onSettings,
  onEmote,
}: LobbyOverlayProps) {
  const focused = characters[focusIndex] ?? null;

  /* ---- Emote notification state ---- */
  const [emoteNotif, setEmoteNotif] = useState<string | null>(null);
  const emoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEmote = useCallback(
    (emoji: string) => {
      // Clear any existing timer
      if (emoteTimerRef.current) clearTimeout(emoteTimerRef.current);
      // Show notification
      setEmoteNotif(emoji);
      emoteTimerRef.current = setTimeout(() => setEmoteNotif(null), 2000);
      // Notify parent
      onEmote?.(emoji);
    },
    [onEmote],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (emoteTimerRef.current) clearTimeout(emoteTimerRef.current);
    };
  }, []);

  /* ---- Drag-to-dismiss handler ---- */
  const handleDragEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (info.offset.y > 80 || info.velocity.y > 300) {
        onDismiss();
      }
    },
    [onDismiss],
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
      {/* ============================================================== */}
      {/* EMOTE NOTIFICATION (floating pill at top)                      */}
      {/* ============================================================== */}
      <EmoteNotification emoji={emoteNotif} />

      {/* ============================================================== */}
      {/* TOP BAR                                                        */}
      {/* ============================================================== */}
      <div className="pointer-events-auto flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)]">
        {/* Back */}
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center
                     rounded-full text-text-primary transition-colors duration-150
                     hover:bg-black/5 active:bg-black/10"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        {/* Title */}
        <h1 className="flex-1 truncate px-2 text-center text-lg font-bold text-text-primary">
          {eventTitle}
        </h1>

        {/* List toggle */}
        <button
          type="button"
          onClick={onListView}
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center
                     rounded-full text-text-primary transition-colors duration-150
                     hover:bg-black/5 active:bg-black/10"
          aria-label="Toggle list view"
        >
          <LayoutList className="h-6 w-6" />
        </button>
      </div>

      {/* ============================================================== */}
      {/* SPACER — 3D scene shows through                                */}
      {/* ============================================================== */}
      <div className="flex-1" />

      {/* ============================================================== */}
      {/* BOTTOM AREA                                                    */}
      {/* ============================================================== */}
      {/* White frosted bottom panel */}
      <div
        className="flex flex-col gap-2 rounded-t-2xl border-t border-border bg-white px-4 pb-[max(env(safe-area-inset-bottom,12px),16px)] pt-3 shadow-lg"
        style={{ WebkitBackdropFilter: 'blur(24px)' }}
      >
        {/* ---- Focused character name + match badge ---- */}
        <div className="flex min-h-[36px] items-center justify-center">
          <AnimatePresence mode="wait">
            {focused && (
              <motion.div
                key={focused.userId}
                variants={nameVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex items-center gap-2"
              >
                <span className="text-lg font-bold text-text-primary">
                  {focused.name}
                </span>
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
                  {Math.round(focused.matchScore * 100)}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---- Carousel dots (centered) ---- */}
        <div className="pointer-events-auto flex justify-center">
          <CarouselDots
            count={characters.length}
            activeIndex={focusIndex}
            onDotClick={onFocusDot}
          />
        </div>

        {/* ---- Bottom row: party badge | misc icons ---- */}
        <div className="pointer-events-auto flex items-center justify-between">
          <PartyBadge count={partyCount} capacity={partyCapacity} />
          <MiscIcons onChat={onChat} onSettings={onSettings} onEmote={handleEmote} />
        </div>
      </div>

      {/* ============================================================== */}
      {/* CHARACTER DETAIL BOTTOM SHEET (glass morphism)                  */}
      {/* ============================================================== */}
      <AnimatePresence>
        {selectedCharacter && (
          <>
            {/* Scrim */}
            <motion.div
              key="scrim"
              variants={scrimVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="pointer-events-auto absolute inset-0 bg-black/30"
              onClick={onDismiss}
              aria-hidden="true"
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              variants={sheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.15}
              onDragEnd={handleDragEnd}
              className="pointer-events-auto absolute bottom-0 left-0 right-0 z-20
                         flex max-h-[45dvh] min-h-[40dvh] flex-col rounded-t-2xl
                         border border-border bg-surface/90 backdrop-blur-xl shadow-lg"
              style={{ WebkitBackdropFilter: 'blur(24px)' }}
              role="dialog"
              aria-label={`${selectedCharacter.name} details`}
            >
              {/* Drag handle */}
              <div className="flex justify-center pb-2 pt-3">
                <div className="h-1 w-10 rounded-full bg-border" />
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-6">
                {/* Name + avatar type */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none" aria-hidden="true">
                    {avatarEmoji(selectedCharacter.avatarType)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-xl font-bold text-text-primary">
                      {selectedCharacter.name}
                    </h2>
                    <p className="truncate text-sm text-text-secondary">
                      {selectedCharacter.program}
                    </p>
                  </div>
                </div>

                {/* Match score bar */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1 text-text-secondary">
                      <Sparkles className="h-3.5 w-3.5" />
                      Match
                    </span>
                    <span className="text-text-primary">
                      {Math.round(selectedCharacter.matchScore * 100)}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-highlight">
                    <motion.div
                      className="h-full rounded-full bg-secondary"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.round(selectedCharacter.matchScore * 100)}%`,
                      }}
                      transition={{
                        delay: 0.15,
                        duration: 0.5,
                        ease: 'easeOut',
                      }}
                    />
                  </div>
                </div>

                {/* Shared stats */}
                <p className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <Users className="h-3.5 w-3.5" />
                  {selectedCharacter.shared.events}{' '}
                  {selectedCharacter.shared.events === 1 ? 'event' : 'events'}
                  {' \u00B7 '}
                  {selectedCharacter.shared.interests}{' '}
                  {selectedCharacter.shared.interests === 1
                    ? 'interest'
                    : 'interests'}
                </p>

                {/* Tags */}
                {selectedCharacter.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCharacter.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-border bg-highlight px-3 py-1
                                   text-xs font-medium text-primary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* View profile button */}
                <button
                  type="button"
                  onClick={() => onViewProfile(selectedCharacter.userId)}
                  className="mt-auto flex h-11 w-full cursor-pointer items-center justify-center
                             rounded-xl bg-primary text-sm font-semibold text-white
                             transition-transform duration-100 active:scale-[0.97]"
                >
                  View Profile
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
