import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Bell } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  showBack?: boolean;
  showNotificationBell?: boolean;
  unreadCount?: number;
}

export function Header({
  title,
  showSearch = false,
  showBack = false,
  showNotificationBell = false,
  unreadCount = 0,
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-surface px-4">
      {/* Back button */}
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-highlight"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
      )}

      {/* Title */}
      {title && !showSearch && (
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-text-primary">
          {title}
        </h1>
      )}

      {/* Search field */}
      {showSearch && (
        <div className="relative min-w-0 flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-full rounded-full bg-highlight pl-9 pr-3 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
      )}

      {/* Spacer when no title/search */}
      {!title && !showSearch && <div className="flex-1" />}

      {/* Notification bell */}
      {showNotificationBell && (
        <button
          onClick={() => navigate('/notifications')}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-highlight"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      )}
    </header>
  );
}
