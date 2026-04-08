import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Users, Plus, CalendarCheck, Calendar } from 'lucide-react';
import { Card, EmptyState } from '@/components/ui';
import { mockEvents, mockCurrentUser } from '@/data/mockData';
import type { AppEvent, EventCategory } from '@/types';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type SegmentTab = 'my' | 'all';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const categoryColors: Record<EventCategory, { bg: string; text: string; accent: string }> = {
  lecture:   { bg: 'bg-blue-100',    text: 'text-blue-800',    accent: 'bg-blue-400'    },
  seminar:   { bg: 'bg-purple-100',  text: 'text-purple-800',  accent: 'bg-purple-400'  },
  hackathon: { bg: 'bg-amber-100',   text: 'text-amber-800',   accent: 'bg-amber-400'   },
  club:      { bg: 'bg-emerald-100', text: 'text-emerald-800', accent: 'bg-emerald-400' },
  social:    { bg: 'bg-pink-100',    text: 'text-pink-800',    accent: 'bg-pink-400'    },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' \u00b7 ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  );
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  EventRow                                                           */
/* ------------------------------------------------------------------ */

interface EventRowProps {
  event: AppEvent;
  joined?: boolean;
  onClick: () => void;
}

function EventRow({ event, joined = false, onClick }: EventRowProps) {
  const colors = categoryColors[event.category];

  return (
    <motion.div variants={itemVariants} layout>
      <Card className="!p-0 overflow-hidden" onClick={onClick}>
        <div className="flex gap-4 p-4">
          {/* Left colour accent */}
          <div className={`w-1 shrink-0 self-stretch rounded-full ${colors.accent}`} />

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {/* Top row: category + joined badge */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${colors.bg} ${colors.text}`}
              >
                {event.category}
              </span>

              {joined && (
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                  <CalendarCheck className="h-3 w-3" />
                  Joined
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold leading-5 text-text-primary line-clamp-1">
              {event.title}
            </h3>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-[140px]">{event.location}</span>
              </span>

              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {formatTime(event.start_time)}
              </span>

              {event.attendee_count !== undefined && (
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  {event.attendee_count}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  EventsListScreen (C3)                                              */
/* ------------------------------------------------------------------ */

export default function EventsListScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SegmentTab>('my');

  /** IDs the current user has joined (attended). */
  const joinedIds = useMemo(
    () => new Set(mockCurrentUser.events.attended),
    [],
  );

  /** "My Events" shows the first 3 joined events. */
  const myEvents = useMemo(
    () => mockEvents.filter((e) => joinedIds.has(e.id)).slice(0, 3),
    [joinedIds],
  );

  const displayedEvents = activeTab === 'my' ? myEvents : mockEvents;

  return (
    <div className="relative flex flex-col pb-24">
      {/* -------------------------------------------------------------- */}
      {/*  Header + Segmented Control                                     */}
      {/* -------------------------------------------------------------- */}
      <div className="sticky top-0 z-30 bg-surface px-4 pt-4 pb-3">
        <h1 className="mb-3 text-xl font-bold text-text-primary">Events</h1>

        <div className="flex items-center gap-1 rounded-full bg-highlight p-1">
          {([
            { key: 'my' as const, label: 'My Events', icon: CalendarCheck },
            { key: 'all' as const, label: 'All Events', icon: Calendar },
          ]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={[
                'relative flex-1 rounded-full py-2.5 text-center text-sm font-semibold transition-colors duration-150 cursor-pointer select-none min-h-[44px]',
                activeTab === key ? 'text-white' : 'text-text-secondary hover:text-text-primary',
              ].join(' ')}
            >
              {activeTab === key && (
                <motion.div
                  layoutId="events-tab-pill"
                  className="absolute inset-0 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <Icon className="h-4 w-4" />
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------- */}
      {/*  Event List                                                     */}
      {/* -------------------------------------------------------------- */}
      <AnimatePresence mode="wait">
        {displayedEvents.length > 0 ? (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'my' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'my' ? 20 : -20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-3 px-4 pt-3"
            >
              {displayedEvents.map((event) => (
                <EventRow
                  key={event.id}
                  event={event}
                  joined={joinedIds.has(event.id)}
                  onClick={() => navigate(`/events/${event.id}`)}
                />
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <EmptyState
              icon={Calendar}
              title="No events yet"
              description="You haven't joined any events. Browse all events to get started!"
              actionLabel="Browse All Events"
              onAction={() => setActiveTab('all')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------- */}
      {/*  FAB - Create Event                                             */}
      {/* -------------------------------------------------------------- */}
      <motion.button
        type="button"
        onClick={() => navigate('/events/create')}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 cursor-pointer"
        aria-label="Create event"
      >
        <Plus className="h-6 w-6" />
      </motion.button>
    </div>
  );
}
