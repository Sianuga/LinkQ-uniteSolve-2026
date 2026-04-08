import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users } from 'lucide-react';
import { Card } from '@/components/ui';
import { mockGroups } from '@/data/mockData';
import type { Group } from '@/types';

/* ------------------------------------------------------------------ */
/*  Props (when embedded as a tab, eventId comes from parent)          */
/* ------------------------------------------------------------------ */

interface EventGroupsScreenProps {
  eventId?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EventGroupsScreen({
  eventId,
}: EventGroupsScreenProps) {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const resolvedEventId = eventId ?? params.id;
  const isStandalone = !eventId; // Rendered via direct route, not as embedded tab

  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  // Filter groups for this event
  const groups = resolvedEventId
    ? mockGroups.filter((g) => g.event_id === resolvedEventId)
    : mockGroups;

  function handleJoin(group: Group) {
    setJoinedIds((prev) => {
      const next = new Set(prev);
      if (next.has(group.group_id)) {
        next.delete(group.group_id);
      } else {
        next.add(group.group_id);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4 pb-24">
      {/* Header — only when accessed directly (not as embedded tab) */}
      {isStandalone && (
        <div className="sticky top-0 z-20 flex items-center gap-3 bg-background px-4 py-3 border-b border-border">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-highlight"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-text-primary" />
          </button>
          <h2 className="text-lg font-semibold text-text-primary">Event Groups</h2>
        </div>
      )}

      <p className="text-xs text-text-secondary text-center px-4">
        Groups are formed through the Match Me feature. Browse existing teams below.
      </p>

      {/* ---- Group list ---- */}
      {groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-secondary">
          No groups yet. Be the first to create one!
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.map((group, index) => {
            const hasOpenSpots =
              group.looking_for !== undefined && group.looking_for > 0;
            const isJoined = joinedIds.has(group.group_id);

            return (
              <motion.div
                key={group.group_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.05,
                  ease: 'easeOut',
                }}
              >
                <Card className="flex flex-col gap-3 p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h3 className="truncate text-base font-semibold leading-6 text-text-primary">
                        {group.name || `Study Group #${index + 1}`}
                      </h3>
                      {group.description && (
                        <p className="line-clamp-2 text-xs leading-4 text-text-secondary break-words">
                          {group.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {group.number_of_member}{' '}
                        {group.number_of_member === 1 ? 'member' : 'members'}
                      </span>
                    </div>

                    {hasOpenSpots && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        Looking for {group.looking_for} more
                      </span>
                    )}
                  </div>

                  {/* Member avatars */}
                  {group.members && group.members.length > 0 && (
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 5).map((member) => (
                        <div
                          key={member.id}
                          className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-highlight"
                          title={member.name}
                        >
                          {member.avatar_url ? (
                            <img
                              src={member.avatar_url}
                              alt={member.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-semibold text-secondary">
                              {member.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      ))}
                      {group.members.length > 5 && (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-highlight text-[10px] font-semibold text-text-secondary">
                          +{group.members.length - 5}
                        </div>
                      )}
                    </div>
                  )}

                  {/* View-only — join through matchmaking */}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
