import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  X,
  MessageCircle,
  Inbox,
  Users,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Avatar, Button, Card, EmptyState } from '@/components/ui';
import { currentUser, mockUsers, mockConnections } from '@/data/mockData';
import type { Connection } from '@/types';

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  Tab selector                                                       */
/* ------------------------------------------------------------------ */

type TabKey = 'received' | 'connections';

function TabBar({
  active,
  onTabChange,
  pendingCount,
  acceptedCount,
}: {
  active: TabKey;
  onTabChange: (tab: TabKey) => void;
  pendingCount: number;
  acceptedCount: number;
}) {
  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'received', label: 'Received', count: pendingCount },
    { key: 'connections', label: 'My Connections', count: acceptedCount },
  ];

  return (
    <div className="flex border-b border-border bg-surface px-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={[
            'relative flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors',
            active === tab.key
              ? 'text-primary'
              : 'text-text-secondary hover:text-text-primary',
          ].join(' ')}
        >
          {tab.label}
          {tab.count > 0 && (
            <span
              className={[
                'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5',
                'rounded-full text-[10px] font-bold',
                active === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-highlight text-text-secondary',
              ].join(' ')}
            >
              {tab.count}
            </span>
          )}
          {active === tab.key && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getUserById(id: string) {
  return mockUsers.find((u) => u.id === id);
}

function getOtherUserId(conn: Connection): string {
  return conn.requester_id === currentUser.id
    ? conn.receiver_id
    : conn.requester_id;
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function ConnectionsScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('received');

  // Local connection state so accept/reject actions work in the demo
  const [connections, setConnections] = useState<Connection[]>(mockConnections);

  const pending = connections.filter(
    (c) => c.status === 'PENDING' && c.receiver_id === currentUser.id,
  );
  const accepted = connections.filter(
    (c) =>
      c.status === 'ACCEPTED' &&
      (c.requester_id === currentUser.id || c.receiver_id === currentUser.id),
  );

  function handleAccept(conn: Connection) {
    setConnections((prev) =>
      prev.map((c) => (c.id === conn.id ? { ...c, status: 'ACCEPTED' as const } : c)),
    );
  }

  function handleReject(conn: Connection) {
    setConnections((prev) =>
      prev.map((c) => (c.id === conn.id ? { ...c, status: 'REJECTED' as const } : c)),
    );
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <Header title="Connections" showBack />

      <TabBar
        active={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pending.length}
        acceptedCount={accepted.length}
      />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex-1 overflow-y-auto"
      >
        <AnimatePresence mode="wait">
          {activeTab === 'received' ? (
            <motion.div
              key="received"
              variants={stagger}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-2.5 px-4 pt-4 pb-8"
            >
              {pending.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No pending requests"
                  description="When someone sends you a connection request, it will show up here."
                />
              ) : (
                pending.map((conn) => {
                  const user = getUserById(conn.requester_id);
                  if (!user) return null;

                  return (
                    <motion.div
                      key={conn.id}
                      variants={fadeUp}
                      exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                      layout
                    >
                      <Card className="flex items-center gap-3">
                        <Avatar
                          name={user.name}
                          avatarType={user.avatar}
                          src={user.avatar_url}
                          size="md"
                          className="cursor-pointer"
                        />
                        <div
                          className="flex min-w-0 flex-1 flex-col cursor-pointer"
                          onClick={() => navigate(`/users/${user.id}`)}
                        >
                          <h3 className="truncate text-sm font-semibold text-text-primary">
                            {user.name}
                          </h3>
                          <p className="truncate text-xs text-text-secondary">
                            {user.program}
                          </p>
                          <p className="text-[10px] text-text-secondary/70">
                            Semester {user.semester}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAccept(conn)}
                            aria-label={`Accept ${user.name}`}
                            className="!min-h-[36px] !px-3 !bg-emerald-500 hover:!bg-emerald-600"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleReject(conn)}
                            aria-label={`Reject ${user.name}`}
                            className="!min-h-[36px] !px-3"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          ) : (
            <motion.div
              key="connections"
              variants={stagger}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col gap-2.5 px-4 pt-4 pb-8"
            >
              {accepted.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="No connections yet"
                  description="Accept requests or connect with people you meet at events."
                  actionLabel="Discover People"
                  onAction={() => navigate('/matches')}
                />
              ) : (
                accepted.map((conn) => {
                  const otherId = getOtherUserId(conn);
                  const user = getUserById(otherId);
                  if (!user) return null;

                  return (
                    <motion.div key={conn.id} variants={fadeUp} layout>
                      <Card className="flex items-center gap-3">
                        <Avatar
                          name={user.name}
                          avatarType={user.avatar}
                          src={user.avatar_url}
                          size="md"
                          className="cursor-pointer"
                        />
                        <div
                          className="flex min-w-0 flex-1 flex-col cursor-pointer"
                          onClick={() => navigate(`/users/${user.id}`)}
                        >
                          <h3 className="truncate text-sm font-semibold text-text-primary">
                            {user.name}
                          </h3>
                          <p className="truncate text-xs text-text-secondary">
                            {user.program}
                          </p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/messages/${user.id}`)}
                          className="shrink-0"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
