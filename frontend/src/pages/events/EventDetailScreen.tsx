import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Clock, Users, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { mockEvents } from '@/data/mockData';
import type { EventCategory } from '@/types';
import EventPeopleScreen from './EventPeopleScreen';
import EventGroupsScreen from './EventGroupsScreen';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const categoryColors: Record<EventCategory, { bg: string; text: string }> = {
  lecture: { bg: 'bg-blue-100', text: 'text-blue-800' },
  seminar: { bg: 'bg-purple-100', text: 'text-purple-800' },
  hackathon: { bg: 'bg-amber-100', text: 'text-amber-800' },
  club: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  social: { bg: 'bg-pink-100', text: 'text-pink-800' },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return (
    d.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }) +
    ' \u00B7 ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  );
}

type Tab = 'overview' | 'people' | 'groups';

const tabs: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'people', label: 'People' },
  { key: 'groups', label: 'Groups' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EventDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const event = mockEvents.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg font-semibold text-text-primary">Event not found</p>
        <Button variant="secondary" onClick={() => navigate('/events')}>
          Back to Events
        </Button>
      </div>
    );
  }

  const colors = categoryColors[event.category];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-0 pb-6"
    >
      {/* ---- Header ---- */}
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-background px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-highlight"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-text-secondary" />
        </button>
        <h2 className="truncate text-lg font-semibold text-text-primary">
          {event.title}
        </h2>
      </div>

      {/* ---- Hero section ---- */}
      <div className="flex flex-col gap-4 px-4 pt-2 pb-4">
        {event.image_url && (
          <div className="relative h-44 w-full overflow-hidden rounded-xl">
            <img
              src={event.image_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        )}

        <h1 className="text-2xl font-bold leading-8 text-text-primary break-words">
          {event.title}
        </h1>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <MapPin className="h-4 w-4 shrink-0 text-text-secondary" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Clock className="h-4 w-4 shrink-0 text-text-secondary" />
            <span>{formatTime(event.start_time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Users className="h-4 w-4 shrink-0 text-text-secondary" />
            <span>{event.attendee_count ?? 120} attending</span>
          </div>
        </div>

        {/* ---- Join button ---- */}
        <div className="pt-1">
          <Button
            variant={joined ? 'secondary' : 'primary'}
            className="w-full"
            onClick={() => setJoined((prev) => !prev)}
          >
            {joined ? 'Joined \u2713' : 'Join Event'}
          </Button>
        </div>

        {/* ---- Match Me / I Have a Team ---- */}
        <div className="flex gap-3 pt-2">
          <Link to={`/events/${event.id}/lobby`} className="flex-1">
            <Button
              variant="primary"
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold text-base shadow-md"
            >
              <Sparkles className="h-5 w-5" />
              Match Me
            </Button>
          </Link>
          <Link to={`/events/${event.id}/groups/create`} className="flex-1">
            <Button
              variant="secondary"
              size="lg"
              className="w-full font-bold text-base"
            >
              <Users className="h-5 w-5" />
              I Have a Team
            </Button>
          </Link>
        </div>
      </div>

      {/* ---- Tab bar ---- */}
      <div className="sticky top-[48px] z-10 relative flex border-b border-border bg-background px-4 overflow-hidden">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={[
              'relative flex-1 py-3 text-center text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'text-primary'
                : 'text-text-secondary hover:text-text-secondary',
            ].join(' ')}
          >
            {tab.label}
            {activeTab === tab.key && (
              <motion.div
                layoutId="event-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ---- Tab content ---- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="px-4 pt-4"
        >
          {activeTab === 'overview' && (
            <div className="flex flex-col gap-4">
              <p className="text-sm leading-6 text-text-secondary break-words">
                {event.description}
              </p>
              <div>
                <span
                  className={[
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize',
                    colors.bg,
                    colors.text,
                  ].join(' ')}
                >
                  {event.category}
                </span>
              </div>
            </div>
          )}

          {activeTab === 'people' && <EventPeopleScreen />}

          {activeTab === 'groups' && <EventGroupsScreen eventId={event.id} />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
