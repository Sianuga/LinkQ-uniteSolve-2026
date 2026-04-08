import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { Avatar, Tag, ProgressBar, Button } from '@/components/ui';
import { mockMatches } from '@/data/mockData';
import type { MatchCandidate } from '@/types';

/* ------------------------------------------------------------------ */
/*  Filter chips                                                       */
/* ------------------------------------------------------------------ */

type FilterKey = 'all' | 'same_program' | 'top_match';

const filterChips: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'same_program', label: 'Same Program' },
  { key: 'top_match', label: 'Top Match' },
];

function applyFilter(
  candidates: MatchCandidate[],
  filter: FilterKey,
): MatchCandidate[] {
  switch (filter) {
    case 'same_program':
      return candidates.filter((c) =>
        c.program?.toLowerCase().includes('computer science'),
      );
    case 'top_match':
      return [...candidates]
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, 3);
    case 'all':
    default:
      return candidates;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function EventPeopleScreen() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set());

  const filtered = applyFilter(mockMatches, activeFilter);

  function handleConnect(candidate: MatchCandidate) {
    setConnectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(candidate.user_id)) {
        next.delete(candidate.user_id);
      } else {
        next.add(candidate.user_id);
      }
      return next;
    });
  }

  function handleViewProfile(candidate: MatchCandidate) {
    navigate(`/users/${candidate.user_id}`);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ---- Filter chips ---- */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterChips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => setActiveFilter(chip.key)}
            className={[
              'shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
              activeFilter === chip.key
                ? 'bg-primary text-white'
                : 'bg-highlight text-text-secondary hover:bg-border',
            ].join(' ')}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* ---- Attendee list ---- */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-secondary">
          No attendees match this filter.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((candidate, index) => {
            const scorePercent = Math.round(candidate.match_score * 100);
            const isConnected = connectedIds.has(candidate.user_id);

            return (
              <motion.div
                key={candidate.user_id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: index * 0.05,
                  ease: 'easeOut',
                }}
                className="group flex items-center gap-3 rounded-xl bg-surface p-3 shadow-sm transition-colors hover:bg-highlight"
              >
                {/* Avatar */}
                <button
                  type="button"
                  onClick={() => handleViewProfile(candidate)}
                  className="cursor-pointer"
                >
                  <Avatar
                    name={candidate.name}
                    avatarType={candidate.avatar}
                    src={candidate.avatar_url}
                    size="sm"
                    className="transition-transform group-hover:scale-105"
                  />
                </button>

                {/* Info - clickable */}
                <div
                  className="flex min-w-0 flex-1 flex-col gap-1 cursor-pointer"
                  onClick={() => handleViewProfile(candidate)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="truncate text-sm font-semibold text-text-primary">
                      {candidate.name}
                    </h4>
                    <span className="shrink-0 text-xs font-semibold text-primary">
                      {scorePercent}%
                    </span>
                  </div>

                  {candidate.program && (
                    <p className="truncate text-xs text-text-secondary">
                      {candidate.program}
                    </p>
                  )}

                  {/* Match progress bar */}
                  <ProgressBar
                    value={scorePercent}
                    animated
                    className="mt-0.5"
                  />

                  {/* Interest tags */}
                  {candidate.tags && candidate.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {candidate.tags.slice(0, 3).map((tag) => (
                        <Tag key={tag} label={tag} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Connect button */}
                <Button
                  variant={isConnected ? 'secondary' : 'primary'}
                  size="sm"
                  className="shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleConnect(candidate);
                  }}
                >
                  {isConnected ? (
                    'Sent'
                  ) : (
                    <>
                      <UserPlus className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only">Connect</span>
                    </>
                  )}
                </Button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
