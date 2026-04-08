import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit, Settings, Calendar } from 'lucide-react';
import { Avatar, Tag, Card } from '@/components/ui';
import { mockCurrentUser, mockEvents } from '@/data/mockData';
import type { AppEvent } from '@/types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Get events the user has attended or is interested in. */
function getUserEvents(): AppEvent[] {
  const allIds = [
    ...mockCurrentUser.events.attended,
    ...mockCurrentUser.events.interested,
  ];
  return mockEvents.filter((e) => allIds.includes(e.id));
}

function formatEventDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-text-primary mb-2">
      {children}
    </h2>
  );
}

function TagRow({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <Tag key={tag} label={tag} />
      ))}
    </div>
  );
}

function MiniEventCard({
  event,
  onClick,
}: {
  event: AppEvent;
  onClick: () => void;
}) {
  return (
    <Card onClick={onClick} className="p-3">
      <h3 className="text-sm font-semibold text-text-primary line-clamp-2 leading-5">
        {event.title}
      </h3>
      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-text-secondary">
        <Calendar className="h-3 w-3 shrink-0" />
        <span>{formatEventDate(event.start_time)}</span>
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  ProfileScreen (C5)                                                 */
/* ------------------------------------------------------------------ */

export default function ProfileScreen() {
  const navigate = useNavigate();
  const user = mockCurrentUser;
  const userEvents = getUserEvents();

  const interestTags = [
    ...user.interests.hobbies,
    ...user.interests.topics,
  ];
  const skillTags = [
    ...user.skills.programming,
    ...user.skills.tools,
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative flex flex-col gap-6 px-4 pb-8 pt-4"
    >
      {/* ---- Top-right action buttons ---- */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/profile/edit')}
          className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-surface shadow-sm border border-border text-text-secondary hover:text-primary transition-colors cursor-pointer"
          aria-label="Edit profile"
        >
          <Edit className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-surface shadow-sm border border-border text-text-secondary hover:text-primary transition-colors cursor-pointer"
          aria-label="Settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* ---- Avatar + Identity ---- */}
      <div className="flex flex-col items-center gap-3 pt-6">
        <Avatar
          src={user.avatar_url}
          name={user.name}
          size="lg"
          avatarType={user.avatar}
        />

        <div className="flex flex-col items-center gap-0.5 text-center">
          <h1 className="text-xl font-bold leading-7 text-text-primary">
            {user.name}
          </h1>
          <p className="text-sm text-text-secondary">{user.program}</p>
          <p className="text-xs text-text-secondary">
            Semester {user.semester}
          </p>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="max-w-sm text-center text-sm leading-relaxed text-text-secondary">
            {user.bio}
          </p>
        )}
      </div>

      {/* ---- Interests ---- */}
      {interestTags.length > 0 && (
        <section>
          <SectionTitle>Interests</SectionTitle>
          <TagRow tags={interestTags} />
        </section>
      )}

      {/* ---- Skills ---- */}
      {skillTags.length > 0 && (
        <section>
          <SectionTitle>Skills</SectionTitle>
          <TagRow tags={skillTags} />
        </section>
      )}

      {/* ---- My Events ---- */}
      {userEvents.length > 0 && (
        <section>
          <SectionTitle>My Events</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {userEvents.map((event) => (
              <MiniEventCard
                key={event.id}
                event={event}
                onClick={() => navigate(`/events/${event.id}`)}
              />
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
