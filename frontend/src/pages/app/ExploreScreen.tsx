import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Calendar, Users, Sparkles } from 'lucide-react';
import { EventCard, MatchCard } from '@/components/domain';
import { EmptyState } from '@/components/ui';
import { mockEvents, mockMatches } from '@/data/mockData';
import type { EventCategory } from '@/types';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

type ViewTab = 'events' | 'people';

interface CategoryChip {
  label: string;
  value: EventCategory | 'all';
}

const CATEGORIES: CategoryChip[] = [
  { label: 'All', value: 'all' },
  { label: 'Lectures', value: 'lecture' },
  { label: 'Seminars', value: 'seminar' },
  { label: 'Hackathons', value: 'hackathon' },
  { label: 'Clubs', value: 'club' },
  { label: 'Social', value: 'social' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ExploreScreen() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ViewTab>('events');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  /* ---- Filtered data ---- */

  const filteredEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return mockEvents.filter((event) => {
      const matchesCategory =
        selectedCategory === 'all' || event.category === selectedCategory;
      const matchesSearch =
        !q ||
        event.title.toLowerCase().includes(q) ||
        event.description.toLowerCase().includes(q) ||
        event.location.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const filteredMatches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return mockMatches;
    return mockMatches.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.program?.toLowerCase().includes(q) ||
        m.tags?.some((t) => t.toLowerCase().includes(q)),
    );
  }, [searchQuery]);

  /* ---- Animation variants ---- */

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-2">
      {/* ---------------------------------------------------------------- */}
      {/*  Search Bar                                                       */}
      {/* ---------------------------------------------------------------- */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            activeView === 'events'
              ? 'Search events...'
              : 'Search people, skills, interests...'
          }
          className="w-full rounded-full bg-highlight py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-secondary outline-none transition-colors duration-150 focus:bg-background focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/*  Segmented Toggle                                                 */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex items-center gap-1 rounded-full bg-highlight p-1">
        {(['events', 'people'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveView(tab)}
            className={[
              'relative flex-1 rounded-full py-2 min-h-[44px] text-center text-sm font-semibold capitalize transition-colors duration-150 cursor-pointer select-none',
              activeView === tab
                ? 'text-white'
                : 'text-text-secondary hover:text-text-primary',
            ].join(' ')}
          >
            {/* Animated pill background */}
            {activeView === tab && (
              <motion.div
                layoutId="explore-tab-pill"
                className="absolute inset-0 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              {tab === 'events' ? (
                <Calendar className="h-4 w-4" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              {tab}
            </span>
          </button>
        ))}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/*  Content                                                          */}
      {/* ---------------------------------------------------------------- */}
      <AnimatePresence mode="wait">
        {activeView === 'events' ? (
          <motion.div
            key="events-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex flex-col gap-4"
          >
            {/* ---- Category chips (horizontal scroll) ---- */}
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={[
                    'shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors duration-150 cursor-pointer select-none min-h-[44px] flex items-center',
                    selectedCategory === cat.value
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-highlight text-text-secondary hover:bg-border',
                  ].join(' ')}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* ---- Event grid ---- */}
            {filteredEvents.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-3"
              >
                <AnimatePresence>
                  {filteredEvents.map((event) => (
                    <motion.div
                      key={event.id}
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <EventCard event={event} variant="vertical" onClick={() => navigate(`/events/${event.id}`)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="No events found"
                description={
                  searchQuery
                    ? `No events match "${searchQuery}". Try a different search.`
                    : 'No events in this category yet. Check back soon!'
                }
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="people-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="flex flex-col gap-3"
          >
            {/* ---- People list ---- */}
            {filteredMatches.length > 0 ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-3"
              >
                <AnimatePresence>
                  {filteredMatches.map((candidate) => (
                    <motion.div
                      key={candidate.user_id}
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <MatchCard candidate={candidate} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <EmptyState
                icon={Sparkles}
                title="No matches found"
                description={
                  searchQuery
                    ? `No people match "${searchQuery}". Try different keywords.`
                    : 'No match candidates available yet.'
                }
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
