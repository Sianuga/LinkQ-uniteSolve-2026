import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Bell,
  UserPlus,
  UserCheck,
  Calendar,
  MessageCircle,
  Heart,
  Users,
} from 'lucide-react';
import { mockNotifications } from '@/data/mockData';
import type { Notification, NotificationType } from '@/types';

/* ------------------------------------------------------------------ */
/*  Icon / colour mapping per notification type                        */
/* ------------------------------------------------------------------ */

const typeConfig: Record<
  NotificationType,
  { icon: React.ElementType; bg: string; fg: string }
> = {
  connection_request: {
    icon: UserPlus,
    bg: 'bg-blue-100',
    fg: 'text-blue-600',
  },
  connection_accepted: {
    icon: UserCheck,
    bg: 'bg-green-100',
    fg: 'text-green-600',
  },
  event_reminder: {
    icon: Calendar,
    bg: 'bg-orange-100',
    fg: 'text-orange-600',
  },
  new_message: {
    icon: MessageCircle,
    bg: 'bg-purple-100',
    fg: 'text-purple-600',
  },
  new_match: {
    icon: Heart,
    bg: 'bg-pink-100',
    fg: 'text-pink-600',
  },
  group_invite: {
    icon: Users,
    bg: 'bg-teal-100',
    fg: 'text-teal-600',
  },
};

/* ------------------------------------------------------------------ */
/*  Relative timestamp helper                                          */
/* ------------------------------------------------------------------ */

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const listVariants = {
  animate: {
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  initial: { opacity: 0, x: -16 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: 16,
    transition: { duration: 0.2 },
  },
};

/* ------------------------------------------------------------------ */
/*  Notification item                                                  */
/* ------------------------------------------------------------------ */

function NotificationItem({
  notification,
  onTap,
}: {
  notification: Notification;
  onTap: (n: Notification) => void;
}) {
  const config = typeConfig[notification.type];
  const Icon = config.icon;

  return (
    <motion.button
      variants={itemVariants}
      whileTap={{ scale: 0.98 }}
      onClick={() => onTap(notification)}
      className={[
        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors',
        notification.read
          ? 'bg-background'
          : 'bg-surface border-l-[3px] border-l-secondary',
      ].join(' ')}
    >
      {/* Icon circle */}
      <div
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          config.bg,
        ].join(' ')}
      >
        <Icon className={['h-5 w-5', config.fg].join(' ')} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p
          className={[
            'text-sm leading-tight',
            notification.read
              ? 'font-medium text-text-primary'
              : 'font-semibold text-text-primary',
          ].join(' ')}
        >
          {notification.title}
        </p>
        <p className="mt-0.5 truncate text-sm leading-tight text-text-secondary">
          {notification.body}
        </p>
        <p className="mt-1 text-xs text-text-secondary/70">
          {relativeTime(notification.timestamp)}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.read && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-secondary" />
      )}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function NotificationsScreen() {
  const navigate = useNavigate();
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const hasUnread = notifications.some((n) => !n.read);

  /* Mark all as read */
  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  /* Handle tap — navigate based on link / type */
  const handleTap = useCallback(
    (notification: Notification) => {
      // Mark this one as read
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, read: true } : n,
        ),
      );

      // Navigate
      if (notification.link) {
        navigate(notification.link);
      }
    },
    [navigate],
  );

  /* ---- Render ---- */
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-dvh bg-background flex flex-col"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-surface px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-highlight"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>

        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-text-primary">
          Notifications
        </h1>

        {hasUnread && (
          <button
            onClick={markAllRead}
            className="shrink-0 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            Mark all read
          </button>
        )}
      </header>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-highlight">
              <Bell className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-base font-semibold text-text-primary mb-1">
              You're all caught up!
            </h3>
            <p className="text-sm text-text-secondary max-w-[280px]">
              No new notifications right now. Check back later.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="notification-list"
              variants={listVariants}
              initial="initial"
              animate="animate"
              className="divide-y divide-border"
            >
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onTap={handleTap}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}
