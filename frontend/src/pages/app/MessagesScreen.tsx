import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Search } from 'lucide-react';

import { conversations } from '@/data/mockData';
import { ConversationItem } from '@/components/domain';
import { EmptyState } from '@/components/ui';
import type { Conversation } from '@/types';

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MessagesScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  /* Filter conversations by participant name or last message */
  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter(
      (c) =>
        c.participant.name.toLowerCase().includes(q) ||
        c.last_message.toLowerCase().includes(q),
    );
  }, [query]);

  const unreadCount = useMemo(
    () => conversations.filter((c) => c.unread).length,
    [],
  );

  /* Navigate into the chat thread */
  function handleSelect(conversation: Conversation) {
    navigate(`/messages/${conversation.id}`);
  }

  return (
    <div className="flex flex-col pb-24">
      {/* ---- Header area ---- */}
      <div className="sticky top-0 z-30 bg-surface px-4 pt-4 pb-2">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary">Messages</h1>
          {unreadCount > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary px-2 text-[11px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="h-9 w-full rounded-full bg-highlight pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary outline-none transition-shadow focus:ring-2 focus:ring-secondary"
          />
        </div>
      </div>

      {/* ---- Conversation list ---- */}
      <AnimatePresence mode="wait">
        {filtered.length > 0 ? (
          <motion.ul
            key="list"
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-1 px-2 pt-2"
          >
            {filtered.map((conversation) => (
              <motion.li key={conversation.id} variants={itemVariants}>
                <ConversationItem
                  conversation={conversation}
                  onClick={handleSelect}
                />
              </motion.li>
            ))}
          </motion.ul>
        ) : query.trim() ? (
          /* No results for search query */
          <motion.div
            key="no-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState
              icon={Search}
              title="No results"
              description={`No conversations matching "${query}"`}
            />
          </motion.div>
        ) : (
          /* Truly empty — no conversations at all */
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            <EmptyState
              icon={MessageCircle}
              title="No conversations yet"
              description="When you connect with other students, your conversations will appear here."
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
