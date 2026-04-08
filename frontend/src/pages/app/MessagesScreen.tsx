import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Search, Plus, Users, Check } from 'lucide-react';

import { conversations, mockConnections, mockUsers, currentUser, mockEvents } from '@/data/mockData';
import { ConversationItem } from '@/components/domain';
import { EmptyState, Modal, Avatar, Button } from '@/components/ui';
import type { Conversation, User } from '@/types';

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
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Get accepted connections with shared event info */
function getAcceptedConnections() {
  // Current user's events
  const currentUserEvents = {
    attended: new Set(currentUser.events.attended),
    interested: new Set(currentUser.events.interested),
  };

  return mockConnections
    .filter((c) => c.status === 'ACCEPTED')
    .map((conn) => {
      const otherId = conn.requester_id === currentUser.id ? conn.receiver_id : conn.requester_id;
      const user = mockUsers.find((u) => u.id === otherId);
      if (!user) return null;

      // Find shared events
      const sharedAttended = user.events.attended.filter((e) => currentUserEvents.attended.has(e));
      const sharedInterested = user.events.interested.filter((e) => currentUserEvents.interested.has(e));
      const sharedAttendedFromInterested = user.events.attended.filter((e) => currentUserEvents.interested.has(e));
      const sharedInterestedFromAttended = user.events.interested.filter((e) => currentUserEvents.attended.has(e));

      // Combine all shared event IDs
      const allSharedEventIds = [
        ...sharedAttended,
        ...sharedInterested,
        ...sharedAttendedFromInterested,
        ...sharedInterestedFromAttended,
      ];

      // Get event details
      const sharedEvents = allSharedEventIds
        .map((eventId) => mockEvents.find((e) => e.id === eventId))
        .filter((e): e is typeof mockEvents[0] => !!e);

      return {
        user,
        sharedEvents,
      };
    })
    .filter((c): c is { user: User; sharedEvents: typeof mockEvents } => !!c);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MessagesScreen() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showAllConnections, setShowAllConnections] = useState(false);

  const acceptedConnections = getAcceptedConnections();

  // Group connections by shared events
  const connectionsByEvent = useMemo(() => {
    const eventMap = new Map<string, { user: User; sharedEvents: typeof mockEvents }[]>();
    const noEventConnections: { user: User; sharedEvents: typeof mockEvents }[] = [];

    acceptedConnections.forEach((conn) => {
      if (conn.sharedEvents.length === 0) {
        noEventConnections.push(conn);
      } else {
        conn.sharedEvents.forEach((event) => {
          const existing = eventMap.get(event.id) || [];
          existing.push(conn);
          eventMap.set(event.id, existing);
        });
      }
    });

    return { eventMap, noEventConnections };
  }, [acceptedConnections]);

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

  function toggleUser(userId: string) {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }

  function handleStartConversation() {
    if (selectedUsers.length === 0) return;
    // For MVP, navigate to the first selected user's conversation
    // Multi-user conversations would need a separate route/handler
    const firstUserId = selectedUsers[0];
    // Check if conversation already exists
    const existingConv = conversations.find(
      (c) => c.participant.id === firstUserId,
    );
    if (existingConv) {
      navigate(`/messages/${existingConv.id}`);
    } else {
      // Create new conversation (in real app, this would be an API call)
      navigate(`/messages/new?users=${selectedUsers.join(',')}`);
    }
    setIsNewConversationOpen(false);
    setSelectedUsers([]);
  }

  return (
    <div className="flex flex-col pb-24">
      {/* ---- Header area ---- */}
      <div className="sticky top-0 z-30 bg-surface px-4 pt-4 pb-2">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary">Messages</h1>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-secondary px-2 text-[11px] font-bold text-white">
                {unreadCount}
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsNewConversationOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <Plus size={16} />
              New
            </button>
          </div>
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

      {/* ---- New Conversation Modal ---- */}
      <Modal
        isOpen={isNewConversationOpen}
        onClose={() => {
          setIsNewConversationOpen(false);
          setSelectedUsers([]);
        }}
        title="New Conversation"
        className="!max-w-[400px]"
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-text-secondary">
            Select connections to start a conversation with:
          </p>

          {acceptedConnections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-text-secondary/50" />
              <p className="mt-4 text-sm font-medium text-text-primary">
                No connections yet
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Connect with people to start messaging
              </p>
            </div>
          ) : (
            <>
              {/* Toggle for grouped/all view */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-text-secondary">
                  {showAllConnections ? 'All Connections' : 'Grouped by Event'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllConnections(!showAllConnections)}
                  className="text-xs font-semibold text-primary hover:text-primary/80"
                >
                  {showAllConnections ? 'Group by Event' : 'Show All'}
                </button>
              </div>

              <div className="max-h-[320px] overflow-y-auto -mx-2 px-2">
                {showAllConnections ? (
                  /* Simple list view */
                  <ul className="flex flex-col gap-2">
                    {acceptedConnections.map(({ user }) => {
                      const isSelected = selectedUsers.includes(user.id);
                      return (
                        <li key={user.id}>
                          <button
                            type="button"
                            onClick={() => toggleUser(user.id)}
                            className={[
                              'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                              isSelected
                                ? 'border-primary bg-highlight'
                                : 'border-border bg-surface hover:bg-highlight',
                            ].join(' ')}
                          >
                            <Avatar name={user.name} avatarType={user.avatar} size="sm" />
                            <div className="flex min-w-0 flex-1 flex-col items-start">
                              <span className="truncate text-sm font-medium text-text-primary">
                                {user.name}
                              </span>
                              <span className="truncate text-xs text-text-secondary">
                                {user.program}
                              </span>
                            </div>
                            {isSelected && (
                              <Check className="h-5 w-5 shrink-0 text-primary" />
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  /* Grouped by event view */
                  <div className="flex flex-col gap-4">
                    {/* Connections with shared events */}
                    {Array.from(connectionsByEvent.eventMap.entries()).map(([eventId, connections]) => {
                      const event = mockEvents.find((e) => e.id === eventId);
                      if (!event) return null;

                      return (
                        <div key={eventId}>
                          <div className="mb-2 flex items-center gap-2">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                              {event.title}
                            </span>
                            <div className="h-px flex-1 bg-border" />
                          </div>
                          <ul className="flex flex-col gap-2">
                            {connections.map(({ user }) => {
                              const isSelected = selectedUsers.includes(user.id);
                              return (
                                <li key={user.id}>
                                  <button
                                    type="button"
                                    onClick={() => toggleUser(user.id)}
                                    className={[
                                      'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                                      isSelected
                                        ? 'border-primary bg-highlight'
                                        : 'border-border bg-surface hover:bg-highlight',
                                    ].join(' ')}
                                  >
                                    <Avatar name={user.name} avatarType={user.avatar} size="sm" />
                                    <div className="flex min-w-0 flex-1 flex-col items-start">
                                      <span className="truncate text-sm font-medium text-text-primary">
                                        {user.name}
                                      </span>
                                      <span className="truncate text-xs text-text-secondary">
                                        {user.program}
                                      </span>
                                    </div>
                                    {isSelected && (
                                      <Check className="h-5 w-5 shrink-0 text-primary" />
                                    )}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}

                    {/* Connections without shared events */}
                    {connectionsByEvent.noEventConnections.length > 0 && (
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <div className="h-px flex-1 bg-border" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                            Other Connections
                          </span>
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <ul className="flex flex-col gap-2">
                          {connectionsByEvent.noEventConnections.map(({ user }) => {
                            const isSelected = selectedUsers.includes(user.id);
                            return (
                              <li key={user.id}>
                                <button
                                  type="button"
                                  onClick={() => toggleUser(user.id)}
                                  className={[
                                    'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors',
                                    isSelected
                                      ? 'border-primary bg-highlight'
                                      : 'border-border bg-surface hover:bg-highlight',
                                  ].join(' ')}
                                >
                                  <Avatar name={user.name} avatarType={user.avatar} size="sm" />
                                  <div className="flex min-w-0 flex-1 flex-col items-start">
                                    <span className="truncate text-sm font-medium text-text-primary">
                                      {user.name}
                                    </span>
                                    <span className="truncate text-xs text-text-secondary">
                                      {user.program}
                                    </span>
                                  </div>
                                  {isSelected && (
                                    <Check className="h-5 w-5 shrink-0 text-primary" />
                                  )}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="mt-2 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => {
                setIsNewConversationOpen(false);
                setSelectedUsers([]);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={handleStartConversation}
              disabled={selectedUsers.length === 0}
            >
              Start Conversation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
