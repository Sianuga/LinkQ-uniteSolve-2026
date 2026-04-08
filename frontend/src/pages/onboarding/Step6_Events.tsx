import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Calendar,
  MapPin,
  Users,
  Sparkles,
  PartyPopper,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import type { EventCategory } from '@/types';

/* ------------------------------------------------------------------ */
/*  Fake event data                                                    */
/* ------------------------------------------------------------------ */

interface FakeEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  category: EventCategory;
  emoji: string;
}

const EVENTS: FakeEvent[] = [
  {
    id: 'evt_1',
    title: 'Distributed Systems Lecture',
    date: 'Apr 14',
    time: '10:00',
    location: 'S1|01 A03',
    attendees: 142,
    category: 'lecture',
    emoji: '\u{1F4BB}',
  },
  {
    id: 'evt_2',
    title: 'AI Workshop: LLM Fine-tuning',
    date: 'Apr 15',
    time: '14:00',
    location: 'Piloty Building',
    attendees: 56,
    category: 'seminar',
    emoji: '\u{1F916}',
  },
  {
    id: 'evt_3',
    title: 'Hackathon 2026',
    date: 'Apr 19-20',
    time: 'All Day',
    location: 'Mensa',
    attendees: 230,
    category: 'hackathon',
    emoji: '\u{1F680}',
  },
  {
    id: 'evt_4',
    title: 'International Students Mixer',
    date: 'Apr 16',
    time: '19:00',
    location: 'Schlosskeller',
    attendees: 85,
    category: 'social',
    emoji: '\u{1F389}',
  },
  {
    id: 'evt_5',
    title: 'Machine Learning Seminar',
    date: 'Apr 17',
    time: '16:00',
    location: 'S2|02 C205',
    attendees: 38,
    category: 'seminar',
    emoji: '\u{1F9E0}',
  },
  {
    id: 'evt_6',
    title: 'Coding Club: Rust Workshop',
    date: 'Apr 18',
    time: '18:00',
    location: 'S2|02 E302',
    attendees: 24,
    category: 'club',
    emoji: '\u{1F980}',
  },
  {
    id: 'evt_7',
    title: 'Career Fair: Tech Companies',
    date: 'Apr 22',
    time: '09:00',
    location: 'Darmstadtium',
    attendees: 310,
    category: 'social',
    emoji: '\u{1F4BC}',
  },
  {
    id: 'evt_8',
    title: 'Computer Vision Lab',
    date: 'Apr 21',
    time: '14:00',
    location: 'S2|02 A213',
    attendees: 32,
    category: 'lecture',
    emoji: '\u{1F441}\u{FE0F}',
  },
  {
    id: 'evt_9',
    title: 'Open Source Contributor Night',
    date: 'Apr 23',
    time: '19:00',
    location: 'HDA Coworking',
    attendees: 18,
    category: 'club',
    emoji: '\u{1F310}',
  },
  {
    id: 'evt_10',
    title: 'Math for ML Study Group',
    date: 'Apr 24',
    time: '10:00',
    location: 'Library L4|02',
    attendees: 12,
    category: 'seminar',
    emoji: '\u{1F4D0}',
  },
];

const CATEGORY_COLORS: Record<EventCategory, string> = {
  lecture: 'bg-blue-100 text-blue-700',
  seminar: 'bg-purple-100 text-purple-700',
  hackathon: 'bg-red-100 text-red-700',
  club: 'bg-green-100 text-green-700',
  social: 'bg-amber-100 text-amber-700',
};

/* ------------------------------------------------------------------ */
/*  Confetti particle                                                  */
/* ------------------------------------------------------------------ */

function ConfettiParticle({ index }: { index: number }) {
  const colors = ['#1E3A8A', '#3B82F6', '#93C5FD', '#F59E0B', '#10B981', '#EC4899', '#EF4444'];
  const color = colors[index % colors.length];
  const startX = Math.random() * 100;
  const endX = startX + (Math.random() - 0.5) * 60;
  const rotation = Math.random() * 720 - 360;
  const size = 6 + Math.random() * 8;
  const duration = 1.5 + Math.random() * 1.5;
  const delay = Math.random() * 0.5;
  const shape = index % 3 === 0 ? 'rounded-full' : index % 3 === 1 ? 'rounded-sm' : '';

  return (
    <motion.div
      initial={{
        x: `${startX}vw`,
        y: -20,
        rotate: 0,
        opacity: 1,
      }}
      animate={{
        x: `${endX}vw`,
        y: '100vh',
        rotate: rotation,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        ease: 'easeIn',
      }}
      className={`fixed top-0 pointer-events-none z-[60] ${shape}`}
      style={{
        width: size,
        height: size * (index % 2 === 0 ? 1 : 0.6),
        backgroundColor: color,
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function Step6_Events() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);

  const toggleEvent = (id: string) => {
    setSelectedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSubmit = useCallback(() => {
    // Update user as onboarded
    if (user) {
      setUser({
        ...user,
        onboarding_complete: true,
        events: {
          ...user.events,
          interested: Array.from(selectedEvents),
        },
      });
    }
    setShowCelebration(true);
  }, [user, selectedEvents, setUser]);

  const goHome = () => navigate('/home');

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="text-center space-y-2 mb-5">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-highlight mb-2"
          >
            <Calendar className="w-7 h-7 text-primary" />
          </motion.div>
          <h1 className="text-2xl font-bold text-text-primary">
            Upcoming Events
          </h1>
          <p className="text-sm text-text-secondary max-w-xs mx-auto">
            Select events you want to attend. We'll match you with people who are going too.
          </p>
        </div>

        {/* Selection counter */}
        {selectedEvents.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <Sparkles className="w-4 h-4 text-secondary" />
            <span className="text-sm font-semibold text-secondary">
              {selectedEvents.size} event{selectedEvents.size !== 1 && 's'} selected
            </span>
          </motion.div>
        )}

        {/* Event grid */}
        <div className="flex-1 overflow-y-auto pb-24 space-y-2.5">
          {EVENTS.map((event, i) => {
            const isSelected = selectedEvents.has(event.id);

            return (
              <motion.button
                key={event.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => toggleEvent(event.id)}
                className={[
                  'w-full flex items-start gap-3 p-3 rounded-[var(--radius-md)]',
                  'border-2 cursor-pointer select-none text-left',
                  'transition-all duration-200',
                  isSelected
                    ? 'border-primary bg-highlight shadow-sm'
                    : 'border-border bg-surface hover:border-secondary/30',
                ].join(' ')}
              >
                {/* Emoji */}
                <div
                  className={[
                    'shrink-0 w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center text-xl',
                    isSelected ? 'bg-primary/10' : 'bg-highlight',
                  ].join(' ')}
                >
                  {event.emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {event.title}
                    </p>
                    {/* Checkmark */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                          className="shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <Calendar className="w-3 h-3" />
                      {event.date}, {event.time}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-secondary">
                      <MapPin className="w-3 h-3" />
                      {event.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-medium ${CATEGORY_COLORS[event.category]}`}>
                      {event.category}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-text-secondary">
                      <Users className="w-3 h-3" />
                      {event.attendees} going
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Submit button */}
        <div className="sticky bottom-0 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent">
          <Button
            size="lg"
            className="w-full"
            disabled={selectedEvents.size === 0}
            onClick={handleSubmit}
          >
            <Sparkles className="w-4 h-4" />
            {selectedEvents.size > 0
              ? `Continue with ${selectedEvents.size} event${selectedEvents.size !== 1 ? 's' : ''}`
              : 'Select at least one event'}
          </Button>
        </div>
      </div>

      {/* ---- Celebration overlay ---- */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm"
          >
            {/* Confetti */}
            {Array.from({ length: 50 }).map((_, i) => (
              <ConfettiParticle key={i} index={i} />
            ))}

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="relative z-[61] flex flex-col items-center gap-6 p-8 max-w-sm mx-4"
            >
              {/* Party icon */}
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-xl"
              >
                <PartyPopper className="w-10 h-10 text-white" />
              </motion.div>

              {/* Text */}
              <div className="text-center space-y-2">
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-bold text-text-primary"
                >
                  You're Ready!
                </motion.h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  className="text-text-secondary"
                >
                  Your profile is set up and looking great.
                </motion.p>
              </div>

              {/* Match preview */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center gap-3 px-5 py-3 bg-highlight rounded-[var(--radius-lg)] border border-border"
              >
                <div className="flex -space-x-2">
                  {['bg-red-400', 'bg-yellow-400', 'bg-teal-400', 'bg-blue-400'].map((bg, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full ${bg} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}
                    >
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">12 people</p>
                  <p className="text-xs text-text-secondary">match with you</p>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.85 }}
                className="w-full"
              >
                <Button size="lg" className="w-full" onClick={goHome}>
                  Let's Go
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
