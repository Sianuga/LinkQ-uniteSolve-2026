import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserPlus,
  MessageCircle,
  Calendar,
  BookOpen,
  Heart,
  User as UserIcon,
  Sparkles,
  UserX,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Avatar, Button, Card, EmptyState } from '@/components/ui';
import { mockUsers, currentUser, mockComparisons } from '@/data/mockData';
import type { User, ProfileComparison } from '@/types';

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  Match Ring (SVG circle with animated stroke-dashoffset)            */
/* ------------------------------------------------------------------ */

const RING_SIZE = 160;
const STROKE_WIDTH = 10;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function MatchRing({ score }: { score: number }) {
  const percent = Math.round(score * 100);
  const dashOffset = CIRCUMFERENCE * (1 - score);

  // Color gradient based on score
  const getColor = (s: number) => {
    if (s >= 0.8) return { stroke: '#10B981', glow: 'rgba(16,185,129,0.25)' }; // success
    if (s >= 0.6) return { stroke: '#3B82F6', glow: 'rgba(59,130,246,0.25)' }; // secondary
    if (s >= 0.4) return { stroke: '#F59E0B', glow: 'rgba(245,158,11,0.25)' }; // warning
    return { stroke: '#EF4444', glow: 'rgba(239,68,68,0.2)' }; // error
  };

  const colors = getColor(score);

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow effect */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
        }}
      />

      <svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
        />
        {/* Animated fill */}
        <motion.circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{
            delay: 0.2,
            duration: 0.8,
            type: 'spring',
            stiffness: 400,
            damping: 30,
          }}
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4, type: 'spring', stiffness: 300 }}
          className="text-3xl font-bold text-text-primary"
        >
          {percent}%
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="text-xs font-medium text-text-secondary"
        >
          match
        </motion.span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared Section                                                     */
/* ------------------------------------------------------------------ */

function SharedSection({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ElementType;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <motion.div variants={fadeUp}>
      <Card className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/30">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
          <span className="ml-auto rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-bold text-primary">
            {items.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <motion.span
              key={item}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="inline-flex items-center gap-1 rounded-full bg-accent/30 px-2.5 py-1 text-xs font-medium text-primary"
            >
              <Sparkles className="h-3 w-3" />
              {item}
            </motion.span>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function ProfileComparisonScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const targetUser = mockUsers.find((u) => u.id === id) as User | undefined;
  const comparison = id ? mockComparisons[id] as ProfileComparison | undefined : undefined;

  /* -------- Not found -------- */
  if (!targetUser) {
    return (
      <div className="min-h-dvh bg-background flex flex-col">
        <Header title="Compare" showBack />
        <EmptyState
          icon={UserX}
          title="User not found"
          description="This profile doesn't exist or may have been removed."
          actionLabel="Go back"
          onAction={() => navigate(-1)}
        />
      </div>
    );
  }

  const me = currentUser;

  /* -------- Zero-overlap / no comparison data -------- */
  const hasOverlap =
    comparison &&
    (comparison.shared.events.length > 0 ||
      comparison.shared.interests.length > 0 ||
      (comparison.shared.courses?.length ?? 0) > 0);

  /* -------- Render -------- */
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <Header title="Compare Profiles" showBack />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex-1 overflow-y-auto pb-28"
      >
        {/* -------- Top: Avatars + Names -------- */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center gap-5 px-4 pt-6 pb-2"
        >
          {/* Avatars side-by-side */}
          <motion.div
            variants={fadeUp}
            className="flex items-center gap-6 sm:gap-10"
          >
            {/* Me */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <Avatar
                  name={me.name}
                  avatarType={me.avatar}
                  src={me.avatar_url}
                  size="lg"
                  className="ring-4 ring-primary/20"
                />
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-white whitespace-nowrap">
                  You
                </span>
              </div>
              <div className="text-center mt-1">
                <p className="text-sm font-semibold text-text-primary">{me.name}</p>
                <p className="text-xs text-text-secondary">{me.program}</p>
              </div>
            </div>

            {/* VS divider */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-highlight border-2 border-accent"
            >
              <span className="text-xs font-bold text-primary">VS</span>
            </motion.div>

            {/* Them */}
            <div className="flex flex-col items-center gap-2">
              <Avatar
                name={targetUser.name}
                avatarType={targetUser.avatar}
                src={targetUser.avatar_url}
                size="lg"
                className="ring-4 ring-secondary/20"
              />
              <div className="text-center mt-1">
                <p className="text-sm font-semibold text-text-primary">{targetUser.name}</p>
                <p className="text-xs text-text-secondary">{targetUser.program}</p>
              </div>
            </div>
          </motion.div>

          {/* Match ring */}
          {comparison && (
            <motion.div variants={fadeUp}>
              <MatchRing score={comparison.match_score} />
            </motion.div>
          )}
        </motion.div>

        {/* -------- Shared / Differences sections -------- */}
        {comparison && hasOverlap ? (
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="flex flex-col gap-3 px-4 mt-4"
          >
            {/* What You Share header */}
            <motion.div variants={fadeUp} className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/30">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">What You Share</h3>
            </motion.div>

            {/* Shared Events */}
            <SharedSection
              title="Shared Events"
              icon={Calendar}
              items={comparison.shared.events}
            />

            {/* Shared Courses */}
            {comparison.shared.courses && comparison.shared.courses.length > 0 && (
              <SharedSection
                title="Shared Courses"
                icon={BookOpen}
                items={comparison.shared.courses}
              />
            )}

            {/* Shared Interests */}
            <SharedSection
              title="Shared Interests"
              icon={Heart}
              items={comparison.shared.interests}
            />

            {/* Differences header */}
            {(comparison.differences.only_me.length > 0 ||
              comparison.differences.only_them.length > 0) && (
              <motion.div variants={fadeUp} className="flex flex-col gap-3">
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100">
                    <UserIcon className="h-3.5 w-3.5 text-text-secondary" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    Differences
                  </h3>
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Only You */}
                  <Card className="flex flex-col gap-2.5 !p-3">
                    <div className="flex items-center gap-1.5">
                      <Avatar
                        name={me.name}
                        avatarType={me.avatar}
                        src={me.avatar_url}
                        size="sm"
                      />
                      <p className="text-[11px] font-semibold text-text-secondary">Only You</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {comparison.differences.only_me.map((item) => (
                        <span
                          key={item}
                          className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-text-secondary"
                        >
                          {item}
                        </span>
                      ))}
                      {comparison.differences.only_me.length === 0 && (
                        <p className="text-[10px] text-text-secondary italic">Nothing unique</p>
                      )}
                    </div>
                  </Card>

                  {/* Only Them */}
                  <Card className="flex flex-col gap-2.5 !p-3">
                    <div className="flex items-center gap-1.5">
                      <Avatar
                        name={targetUser.name}
                        avatarType={targetUser.avatar}
                        src={targetUser.avatar_url}
                        size="sm"
                      />
                      <p className="text-[11px] font-semibold text-text-secondary">Only {targetUser.name.split(' ')[0]}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {comparison.differences.only_them.map((item) => (
                        <span
                          key={item}
                          className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-text-secondary"
                        >
                          {item}
                        </span>
                      ))}
                      {comparison.differences.only_them.length === 0 && (
                        <p className="text-[10px] text-text-secondary italic">Nothing unique</p>
                      )}
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : (
          /* -------- Zero-overlap state -------- */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="px-4 mt-6"
          >
            <Card className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-highlight">
                <Calendar className="h-7 w-7 text-secondary" />
              </div>
              <h3 className="text-base font-semibold text-text-primary">
                You don't share anything yet
              </h3>
              <p className="text-sm text-text-secondary max-w-xs">
                Attend the same events to discover what you have in common!
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-2"
                onClick={() => navigate('/explore')}
              >
                Explore Events
              </Button>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* -------- Fixed action bar -------- */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 25 }}
        className="fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-border px-4 py-3 safe-area-bottom"
      >
        <div className="max-w-lg mx-auto flex gap-2.5">
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={() => {
              /* TODO: send connection request */
            }}
          >
            <UserPlus className="h-4 w-4" />
            Connect
          </Button>
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={() => navigate(`/messages`)}
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
