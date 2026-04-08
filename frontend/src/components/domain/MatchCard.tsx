import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { Card, Avatar, Tag, ProgressBar, Button } from '@/components/ui';
import type { MatchCandidate } from '@/types';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface MatchCardProps {
  candidate: MatchCandidate;
  onConnect?: (candidate: MatchCandidate) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MatchCard({ candidate, onConnect }: MatchCardProps) {
  const scorePercent = Math.round(candidate.match_score * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="flex flex-col gap-4 p-4">
        {/* Top row: avatar + info */}
        <div className="flex items-start gap-3">
          <Avatar
            name={candidate.name}
            size="md"
            avatarType={candidate.avatar}
          />

          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="truncate text-base font-semibold leading-6 text-gray-900">
              {candidate.name}
            </h3>
            {candidate.program && (
              <p className="truncate text-xs text-gray-500">{candidate.program}</p>
            )}

            {/* Match score */}
            <div className="mt-1 flex items-center gap-2">
              <ProgressBar
                value={scorePercent}
                className="flex-1"
                animated
              />
              <span className="shrink-0 text-xs font-semibold text-blue-900">
                {scorePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Shared info */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-500">
          {candidate.shared.events > 0 && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
              {candidate.shared.events} shared {candidate.shared.events === 1 ? 'event' : 'events'}
            </span>
          )}
          {candidate.shared.interests > 0 && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700">
              {candidate.shared.interests} shared {candidate.shared.interests === 1 ? 'interest' : 'interests'}
            </span>
          )}
        </div>

        {/* Interest tags */}
        {candidate.tags && candidate.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {candidate.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}

        {/* Connect button */}
        <Button
          variant="primary"
          size="sm"
          className="mt-auto w-full"
          onClick={() => onConnect?.(candidate)}
        >
          <UserPlus className="mr-1.5 h-4 w-4" />
          Connect
        </Button>
      </Card>
    </motion.div>
  );
}

export default MatchCard;
