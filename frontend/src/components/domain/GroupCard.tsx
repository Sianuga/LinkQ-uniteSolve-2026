import { motion } from 'framer-motion';
import { Users, UserPlus } from 'lucide-react';
import { Card, Badge, Button } from '@/components/ui';
import type { Group } from '@/types';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface GroupCardProps {
  group: Group;
  onJoin?: (group: Group) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function GroupCard({ group, onJoin }: GroupCardProps) {
  const lookingFor = group.looking_for;
  const hasOpenSpots = lookingFor !== undefined && lookingFor > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="flex flex-col gap-3 p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h3 className="truncate text-base font-semibold leading-6 text-gray-900">
              {group.name || 'Study Group'}
            </h3>
            {group.description && (
              <p className="line-clamp-2 text-xs leading-4 text-gray-500">
                {group.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Member count */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Users className="h-3.5 w-3.5" />
            <span>
              {group.number_of_member}{' '}
              {group.number_of_member === 1 ? 'member' : 'members'}
            </span>
          </div>

          {/* Looking for badge */}
          {hasOpenSpots && (
            <Badge className="bg-emerald-50 text-[10px] font-medium text-emerald-700">
              Looking for {lookingFor} more
            </Badge>
          )}
        </div>

        {/* Member avatars (if available) */}
        {group.members && group.members.length > 0 && (
          <div className="flex -space-x-2">
            {group.members.slice(0, 5).map((member) => (
              <div
                key={member.id}
                className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-blue-100"
                title={member.name}
              >
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-semibold text-blue-700">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            ))}
            {group.members.length > 5 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-semibold text-gray-500">
                +{group.members.length - 5}
              </div>
            )}
          </div>
        )}

        {/* Join button */}
        <Button
          variant="primary"
          size="sm"
          className="mt-auto w-full"
          onClick={() => onJoin?.(group)}
        >
          <UserPlus className="mr-1.5 h-4 w-4" />
          Join Group
        </Button>
      </Card>
    </motion.div>
  );
}

export default GroupCard;
