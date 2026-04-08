import { useCallback } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ArrowLeft, Users, Sparkles } from 'lucide-react';

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

export interface LobbyOverlayProps {
  eventTitle: string;
  selectedCharacter: SelectedCharacter | null;
  onBack: () => void;
  onViewProfile: (userId: string) => void;
  onDismiss: () => void;
}

/* ------------------------------------------------------------------ */
/*  Avatar-type emoji map                                              */
/* ------------------------------------------------------------------ */

const AVATAR_EMOJI: Record<string, string> = {
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

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LobbyOverlay({
  eventTitle,
  selectedCharacter,
  onBack,
  onViewProfile,
  onDismiss,
}: LobbyOverlayProps) {
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
      {/* -------------------------------------------------------------- */}
      {/* 1. Top bar                                                     */}
      {/* -------------------------------------------------------------- */}
      <div className="pointer-events-auto relative flex items-center px-3 pt-[env(safe-area-inset-top,12px)]">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full
                     text-white transition-colors duration-150 hover:bg-white/10 active:bg-white/20"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6 drop-shadow-md" />
        </button>

        {/* Event title — centered */}
        <h1
          className="pointer-events-none absolute inset-x-0 top-[env(safe-area-inset-top,12px)] flex h-11
                     items-center justify-center text-base font-semibold text-white"
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}
        >
          {eventTitle}
        </h1>
      </div>

      {/* Spacer pushes hint & sheet to bottom */}
      <div className="flex-1" />

      {/* -------------------------------------------------------------- */}
      {/* 2. Hint text (auto-fades, only when nothing selected)          */}
      {/* -------------------------------------------------------------- */}
      <AnimatePresence>
        {!selectedCharacter && (
          <motion.p
            key="hint"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 3, duration: 1.2, ease: 'easeOut' }}
            className="pointer-events-none pb-10 text-center text-sm font-medium text-white/80"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
          >
            Tap a character to learn more
          </motion.p>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------- */}
      {/* 3. Character detail bottom sheet                               */}
      {/* -------------------------------------------------------------- */}
      <AnimatePresence>
        {selectedCharacter && (
          <>
            {/* Scrim — tapping dismisses */}
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
              className="pointer-events-auto relative z-20 flex max-h-[45dvh] min-h-[40dvh] flex-col
                         rounded-t-2xl border border-white/20 bg-white/10 backdrop-blur-xl"
              style={{ WebkitBackdropFilter: 'blur(24px)' }}
              role="dialog"
              aria-label={`${selectedCharacter.name} details`}
            >
              {/* Drag handle */}
              <div className="flex justify-center pb-2 pt-3">
                <div className="h-1 w-10 rounded-full bg-white/40" />
              </div>

              {/* Content — scrollable when overflow */}
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 pb-6">
                {/* ---- Name + avatar type ---- */}
                <div className="flex items-center gap-3">
                  <span className="text-3xl leading-none" aria-hidden="true">
                    {avatarEmoji(selectedCharacter.avatarType)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-xl font-bold text-white">
                      {selectedCharacter.name}
                    </h2>
                    <p className="truncate text-sm text-white/70">
                      {selectedCharacter.program}
                    </p>
                  </div>
                </div>

                {/* ---- Match score bar ---- */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1 text-white/80">
                      <Sparkles className="h-3.5 w-3.5" />
                      Match
                    </span>
                    <span className="text-white">
                      {Math.round(selectedCharacter.matchScore * 100)}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-blue-400"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.round(selectedCharacter.matchScore * 100)}%`,
                      }}
                      transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* ---- Shared stats ---- */}
                <p className="flex items-center gap-1.5 text-xs text-white/60">
                  <Users className="h-3.5 w-3.5" />
                  {selectedCharacter.shared.events}{' '}
                  {selectedCharacter.shared.events === 1 ? 'event' : 'events'}
                  {' \u00B7 '}
                  {selectedCharacter.shared.interests}{' '}
                  {selectedCharacter.shared.interests === 1
                    ? 'interest'
                    : 'interests'}
                </p>

                {/* ---- Tags ---- */}
                {selectedCharacter.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedCharacter.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/20 bg-white/10 px-3 py-1
                                   text-xs font-medium text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* ---- View profile button ---- */}
                <button
                  type="button"
                  onClick={() => onViewProfile(selectedCharacter.userId)}
                  className="mt-auto flex h-11 w-full cursor-pointer items-center justify-center
                             rounded-xl bg-white text-sm font-semibold text-gray-900
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
