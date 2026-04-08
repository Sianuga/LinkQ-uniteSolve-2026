import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui';
import type { Conversation } from '@/types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return 'now';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay < 7) return `${diffDay}d`;
  if (diffWeek < 52) return `${diffWeek}w`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface ConversationItemProps {
  conversation: Conversation;
  onClick?: (conversation: Conversation) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ConversationItem({ conversation, onClick }: ConversationItemProps) {
  const { participant, last_message, last_message_time, unread } = conversation;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      onClick={() => onClick?.(conversation)}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
        unread ? 'bg-blue-50/40' : ''
      }`}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar
          src={participant.avatar_url}
          alt={participant.name}
          size={40}
          fallback={participant.name}
        />
        {/* Unread dot on avatar */}
        {unread && (
          <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-blue-600" />
        )}
      </div>

      {/* Text content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`truncate text-sm leading-5 ${
              unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-900'
            }`}
          >
            {participant.name}
          </h3>
          <span
            className={`shrink-0 text-[10px] ${
              unread ? 'font-semibold text-blue-600' : 'text-gray-400'
            }`}
          >
            {relativeTime(last_message_time)}
          </span>
        </div>

        <p
          className={`truncate text-xs leading-4 ${
            unread ? 'font-medium text-gray-700' : 'text-gray-500'
          }`}
        >
          {last_message}
        </p>
      </div>
    </motion.button>
  );
}

export default ConversationItem;
