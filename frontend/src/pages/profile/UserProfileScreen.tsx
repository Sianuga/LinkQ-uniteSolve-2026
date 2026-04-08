import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  UserPlus,
  MessageCircle,
  GitCompareArrows,
  GraduationCap,
  Calendar,
  Code,
  Globe,
  Wrench,
  UserX,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Avatar, Button, Tag, Card, EmptyState } from '@/components/ui';
import { mockUsers, mockEvents } from '@/data/mockData';
import type { User } from '@/types';

/* ------------------------------------------------------------------ */
/*  Page transition                                                    */
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
/*  Section component                                                  */
/* ------------------------------------------------------------------ */

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-secondary" />
          <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        </div>
        {children}
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function UserProfileScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const user = mockUsers.find((u) => u.id === id) as User | undefined;

  /* -------- Not found -------- */
  if (!user) {
    return (
      <div className="min-h-dvh bg-background flex flex-col">
        <Header title="Profile" showBack />
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

  /* -------- Derived data -------- */
  const interestTags = [
    ...(user.interests?.hobbies ?? []),
    ...(user.interests?.topics ?? []),
  ];

  const attendedEvents = mockEvents.filter((e) =>
    user.events?.attended?.includes(e.id),
  );

  /* -------- Render -------- */
  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <Header title={user.name} showBack />

      <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="flex-1 overflow-y-auto pb-28"
      >
        {/* Hero section */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="flex flex-col items-center gap-3 px-4 pt-6 pb-2"
        >
          <motion.div variants={fadeUp}>
            <Avatar
              name={user.name}
              avatarType={user.avatar}
              src={user.avatar_url}
              size="lg"
              className="ring-4 ring-accent/30"
            />
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-xl font-bold text-text-primary">{user.name}</h1>
            <p className="text-sm text-text-secondary">{user.program}</p>
            <p className="text-xs text-text-secondary">
              Semester {user.semester} &middot; {user.university}
            </p>
          </motion.div>

          {user.bio && (
            <motion.p
              variants={fadeUp}
              className="text-sm text-text-secondary text-center max-w-sm leading-relaxed break-words"
            >
              {user.bio}
            </motion.p>
          )}
        </motion.div>

        {/* Content sections */}
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-3 px-4 mt-4"
        >
          {/* Interests */}
          {interestTags.length > 0 && (
            <Section title="Interests" icon={GraduationCap}>
              <div className="flex flex-wrap gap-1.5">
                {interestTags.map((tag) => (
                  <Tag key={tag} label={tag} />
                ))}
              </div>
            </Section>
          )}

          {/* Skills */}
          {(user.skills?.programming?.length > 0 || user.skills?.tools?.length > 0) && (
            <Section title="Skills" icon={Code}>
              <div className="flex flex-col gap-2.5">
                {user.skills?.programming?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-text-secondary mb-1.5">Programming</p>
                    <div className="flex flex-wrap gap-1.5">
                      {user.skills.programming.map((s) => (
                        <Tag key={s} label={s} selected />
                      ))}
                    </div>
                  </div>
                )}
                {user.skills?.tools?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-text-secondary mb-1.5">
                      <Wrench className="inline h-3 w-3 mr-1 -mt-0.5" />
                      Tools
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {user.skills.tools.map((t) => (
                        <Tag key={t} label={t} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Languages */}
          {user.skills?.languages?.length > 0 && (
            <Section title="Languages" icon={Globe}>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.languages.map((l) => (
                  <Tag key={l} label={l} />
                ))}
              </div>
            </Section>
          )}

          {/* Events attended */}
          {attendedEvents.length > 0 && (
            <Section title="Events Attended" icon={Calendar}>
              <div className="flex flex-col gap-2">
                {attendedEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ x: 2 }}
                    className="flex items-center gap-3 rounded-xl bg-highlight/60 px-3 py-2.5 cursor-pointer"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/30">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {event.location} &middot;{' '}
                        {new Date(event.start_time).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-accent/40 px-2 py-0.5 text-[10px] font-semibold text-primary capitalize">
                      {event.category}
                    </span>
                  </motion.div>
                ))}
              </div>
            </Section>
          )}

          {/* Goals */}
          {user.goals && (
            <Section title="Goals" icon={GraduationCap}>
              <div className="flex flex-col gap-2 text-sm text-text-secondary">
                {user.goals.career && (
                  <p>
                    <span className="font-medium text-text-primary">Career:</span>{' '}
                    {user.goals.career}
                  </p>
                )}
                {user.goals.here_to && (
                  <p>
                    <span className="font-medium text-text-primary">Here to:</span>{' '}
                    {user.goals.here_to}
                  </p>
                )}
                {user.goals.learning?.length > 0 && (
                  <div>
                    <span className="font-medium text-text-primary">Learning:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {user.goals.learning.map((g) => (
                        <Tag key={g} label={g} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>
          )}
        </motion.div>
      </motion.div>

      {/* Fixed action bar */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 25 }}
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
          <Button
            variant="secondary"
            size="md"
            className="border-primary/30 text-primary"
            onClick={() => navigate(`/users/${user.id}/compare`)}
          >
            <GitCompareArrows className="h-4 w-4" />
            Compare
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
