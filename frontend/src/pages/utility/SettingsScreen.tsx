import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ChevronRight, LogOut, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

// ---------------------------------------------------------------------------
// Toggle component
// ---------------------------------------------------------------------------
function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={[
        'relative inline-flex h-[31px] w-[51px] shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
        enabled ? 'bg-secondary' : 'bg-disabled',
      ].join(' ')}
      style={{ touchAction: 'manipulation' }}
    >
      <span
        className={[
          'inline-block h-[27px] w-[27px] rounded-full bg-white shadow-sm transition-transform duration-200',
          enabled ? 'translate-x-[22px]' : 'translate-x-[2px]',
        ].join(' ')}
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section header
// ---------------------------------------------------------------------------
function SectionHeader({ title }: { title: string }) {
  return (
    <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">
      {title}
    </h3>
  );
}

// ---------------------------------------------------------------------------
// Divider
// ---------------------------------------------------------------------------
function Divider() {
  return <div className="my-6 border-t border-border" />;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function SettingsScreen() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  // Notification toggle state
  const [notifications, setNotifications] = useState({
    eventReminders: true,
    newMatches: true,
    messages: true,
    connectionRequests: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.div
      className="flex min-h-dvh flex-col bg-background"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-surface px-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-highlight"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="min-w-0 flex-1 truncate text-lg font-semibold text-text-primary">
          Settings
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="mx-auto w-full max-w-lg py-6">
          {/* ---- Account Section ---- */}
          <SectionHeader title="Account" />
          <div className="rounded-[var(--radius-md)] border border-border bg-surface">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-text-secondary">Name</span>
              <span className="text-sm font-medium text-text-primary">
                {user?.name || 'Not set'}
              </span>
            </div>
            <div className="border-t border-border" />
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-text-secondary">Email</span>
              <span className="text-sm font-medium text-text-primary">
                {user?.email || 'Not set'}
              </span>
            </div>
          </div>

          <Divider />

          {/* ---- Notifications Section ---- */}
          <SectionHeader title="Notifications" />
          <div className="rounded-[var(--radius-md)] border border-border bg-surface">
            {(
              [
                ['eventReminders', 'Event Reminders'],
                ['newMatches', 'New Matches'],
                ['messages', 'Messages'],
                ['connectionRequests', 'Connection Requests'],
              ] as const
            ).map(([key, label], idx) => (
              <div key={key}>
                {idx > 0 && <div className="border-t border-border" />}
                <div className="flex items-center justify-between px-4 py-3 min-h-[44px]">
                  <span className="text-sm text-text-primary">{label}</span>
                  <Toggle
                    enabled={notifications[key]}
                    onToggle={() => toggleNotification(key)}
                  />
                </div>
              </div>
            ))}
          </div>

          <Divider />

          {/* ---- Privacy Section ---- */}
          <SectionHeader title="Privacy" />
          <div className="rounded-[var(--radius-md)] border border-border bg-surface">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-highlight"
            >
              <span className="text-sm text-text-primary">
                Profile Visibility
              </span>
              <ChevronRight size={18} className="text-text-secondary" />
            </button>
            <div className="border-t border-border" />
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-highlight"
            >
              <span className="text-sm text-text-primary">Blocked Users</span>
              <ChevronRight size={18} className="text-text-secondary" />
            </button>
          </div>

          <Divider />

          {/* ---- Log Out ---- */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3 text-error transition-colors hover:bg-error/5"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Log Out</span>
          </button>

          {/* ---- Delete Account ---- */}
          <div className="mt-10 flex flex-col items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 text-error/70 transition-colors hover:text-error"
            >
              <Trash2 size={14} />
              <span className="text-xs font-medium">Delete Account</span>
            </button>
            <p className="max-w-xs text-center text-[11px] leading-relaxed text-text-secondary">
              This will permanently delete your account and all associated data.
              This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
