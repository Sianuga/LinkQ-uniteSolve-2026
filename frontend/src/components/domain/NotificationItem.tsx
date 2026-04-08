import { motion } from 'framer-motion';
import {
  UserPlus,
  UserCheck,
  CalendarClock,
  MessageCircle,
  Sparkles,
  UsersRound,
} from 'lucide-react';
import { Avatar } from '@/components/ui';
import type { Notification, NotificationType } from '@/types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const iconMap: Record<NotificationType, React.ElementType> = {
  connection_request:  UserPlus,
  connection_accepted: UserCheck,
  event_reminder:      CalendarClock,
  new_message:         MessageCircle,
  new_match:           Sparkles,
  group_invite:        UsersRound,
};

const iconColorMap: Record<NotificationType, string> = {
  connection_request:  'bg-blue-100 text-blue-600',
  connection_accepted: 'bg-emerald-100 text-emerald-600',
  event_reminder:      'bg-amber-100 text-amber-600',
  new_message:         'bg-purple-100 text-purple-600',
  new_match:           'bg-pink-100 text-pink-600',
  group_invite:        'bg-cyan-100 text-cyan-600',
};

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 52) return `${diffWeek}w ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const Icon = iconMap[notification.type];
  const iconColor = iconColorMap[notification.type];

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1, ease: 'easeOut' }}
      onClick={() => onClick?.(notification)}
      className={`flex w-full items-start gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-background ${
        notification.read ? '' : 'bg-highlight/40'
      }`}
    >
      {/* Icon or avatar */}
      <div className="relative shrink-0">
        {notification.avatar_url ? (
          <Avatar
            src={notification.avatar_url}
            alt={notification.title}
            size={40}
            fallback={notification.title}
          />
        ) : (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${iconColor}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}

        {/* Notification type icon overlay (when avatar is shown) */}
        {notification.avatar_url && (
          <div
            className={`absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white ${iconColor}`}
          >
            <Icon className="h-2.5 w-2.5" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`text-sm leading-5 ${
              notification.read ? 'font-medium text-text-secondary' : 'font-semibold text-text-primary'
            }`}
          >
            {notification.title}
          </h4>
          <span className="shrink-0 text-[10px] text-text-secondary">
            {relativeTime(notification.timestamp)}
          </span>
        </div>

        <p className="line-clamp-2 text-xs leading-4 text-text-secondary">
          {notification.body}
        </p>
      </div>

      {/* Unread indicator */}
      {!notification.read && (
        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-secondary" />
      )}
    </motion.button>
  );
}

export default NotificationItem;
