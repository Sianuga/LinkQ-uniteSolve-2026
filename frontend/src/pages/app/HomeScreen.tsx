import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, MapPin, Clock, Users, ChevronRight, Sparkles } from 'lucide-react';

import { Avatar, Button } from '@/components/ui';
import { EventCard } from '@/components/domain';
import {
  currentUser,
  mockEvents,
  mockMatches,
  mockNotifications,
} from '@/data/mockData';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0];
}

function formatEventTime(iso: string): string {
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

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const cardHover = {
  y: -2,
  transition: { duration: 0.15, ease: 'easeOut' as const },
};

/* ------------------------------------------------------------------ */
/*  Category style maps                                                */
/* ------------------------------------------------------------------ */

type EventCategory = 'lecture' | 'seminar' | 'hackathon' | 'club' | 'social';

const categoryAccent: Record<EventCategory, string> = {
  lecture: 'from-blue-500/20 to-blue-600/5',
  seminar: 'from-purple-500/20 to-purple-600/5',
  hackathon: 'from-amber-500/20 to-amber-600/5',
  club: 'from-emerald-500/20 to-emerald-600/5',
  social: 'from-pink-500/20 to-pink-600/5',
};

const categoryDot: Record<EventCategory, string> = {
  lecture: 'bg-blue-500',
  seminar: 'bg-purple-500',
  hackathon: 'bg-amber-500',
  club: 'bg-emerald-500',
  social: 'bg-pink-500',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function HomeScreen() {
  const navigate = useNavigate();

  const greeting = useMemo(() => getGreeting(), []);
  const firstName = getFirstName(currentUser.name);
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  // First 4 events by date for "Upcoming"
  const upcomingEvents = useMemo(
    () =>
      [...mockEvents]
        .sort(
          (a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
        )
        .slice(0, 4),
    [],
  );

  // Next 3 events for "Suggested For You"
  const suggestedEvents = useMemo(
    () =>
      [...mockEvents]
        .sort(
          (a, b) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
        )
        .slice(3, 6),
    [],
  );

  return (
    <motion.div
      className="flex flex-col min-h-dvh bg-background"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ============================================================ */}
      {/*  1. Top bar                                                   */}
      {/* ============================================================ */}
      <motion.header
        variants={itemVariants}
        className="sticky top-0 z-30 flex items-center justify-between px-5 pt-4 pb-3 bg-background/80 backdrop-blur-lg"
      >
        {/* Greeting */}
        <div className="flex flex-col">
          <span className="text-sm text-text-secondary">{greeting},</span>
          <span className="text-xl font-bold text-text-primary leading-tight">
            {firstName}
          </span>
        </div>

        {/* Bell + Avatar */}
        <div className="flex items-center gap-3">
          <Link
            to="/notifications"
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-surface shadow-sm hover:shadow-md transition-shadow"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-text-secondary" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[10px] font-bold leading-none ring-2 ring-background">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <Link to="/profile" aria-label="My profile">
            <Avatar
              name={currentUser.name}
              avatarType={currentUser.avatar}
              src={currentUser.avatar_url}
              size="sm"
            />
          </Link>
        </div>
      </motion.header>

      {/* ============================================================ */}
      {/*  Scrollable content                                           */}
      {/* ============================================================ */}
      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {/* ----------------------------------------------------------
            2. Upcoming Events
        ---------------------------------------------------------- */}
        <motion.section variants={itemVariants} className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-text-primary">
              Upcoming Events
            </h2>
            <Link
              to="/events"
              className="flex items-center gap-0.5 text-sm font-medium text-secondary hover:text-primary transition-colors"
            >
              See all
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Horizontal scroll row */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none">
            {upcomingEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                whileHover={cardHover}
                whileTap={{ scale: 0.97 }}
                className="w-[260px] shrink-0 cursor-pointer"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div className="relative rounded-[var(--radius-lg)] bg-surface shadow-md overflow-hidden border border-border/50">
                  {/* Gradient accent top strip */}
                  <div
                    className={`h-1.5 w-full bg-gradient-to-r ${categoryAccent[event.category as EventCategory]}`}
                  />

                  <div className="p-4 flex flex-col gap-2.5">
                    {/* Category dot + label */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${categoryDot[event.category as EventCategory]}`}
                      />
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                        {event.category}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold leading-5 text-text-primary line-clamp-2">
                      {event.title}
                    </h3>

                    {/* Meta */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        <span>{formatEventTime(event.start_time)}</span>
                      </div>
                      {event.attendee_count !== undefined && (
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <Users className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {event.attendee_count}{' '}
                            {event.attendee_count === 1
                              ? 'attendee'
                              : 'attendees'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ----------------------------------------------------------
            3. Match summary card
        ---------------------------------------------------------- */}
        <motion.section variants={itemVariants} className="mt-6">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative overflow-hidden rounded-[var(--radius-lg)] cursor-pointer"
            onClick={() => navigate('/explore')}
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-90" />

            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />

            {/* Content */}
            <div className="relative z-10 flex items-center justify-between p-5 gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-white/90 shrink-0" />
                  <span className="text-sm font-medium text-white/80">
                    People Match
                  </span>
                </div>
                <p className="text-xl font-bold text-white">
                  {mockMatches.length} people match with you
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/explore');
                }}
              >
                View Matches
              </Button>
            </div>
          </motion.div>
        </motion.section>

        {/* ----------------------------------------------------------
            4. Suggested For You
        ---------------------------------------------------------- */}
        <motion.section variants={itemVariants} className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-text-primary">
              Suggested For You
            </h2>
          </div>

          <div className="flex flex-col gap-3">
            {suggestedEvents.map((event) => (
              <motion.div key={event.id} variants={itemVariants}>
                <EventCard
                  event={event}
                  variant="vertical"
                  onClick={() => navigate(`/events/${event.id}`)}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ----------------------------------------------------------
            5. Bottom padding for nav bar
        ---------------------------------------------------------- */}
        <div className="h-6" />
      </div>
    </motion.div>
  );
}
