import { motion } from 'framer-motion';
import { Pencil } from 'lucide-react';
import { Avatar, Tag, Button } from '@/components/ui';
import type { User, UserSummary } from '@/types';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface ProfileHeaderProps {
  user: User | UserSummary;
  showEdit?: boolean;
  onEdit?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Safely extract interest tags from a full User object */
function getInterestTags(user: User | UserSummary): string[] {
  if ('interests' in user && user.interests) {
    const { hobbies = [], topics = [] } = user.interests;
    return [...hobbies, ...topics];
  }
  return [];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProfileHeader({ user, showEdit = false, onEdit }: ProfileHeaderProps) {
  const tags = getInterestTags(user);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex flex-col items-center gap-4 px-4 py-6"
    >
      {/* Large avatar */}
      <Avatar
        src={user.avatar_url}
        alt={user.name}
        size={80}
        fallback={user.name}
        className="ring-2 ring-white shadow-md"
      />

      {/* Name + Program */}
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-xl font-bold leading-7 text-text-primary">
          {user.name}
        </h2>
        <p className="text-sm text-text-secondary">{user.program}</p>
        {user.university && (
          <p className="text-xs text-text-secondary">{user.university}</p>
        )}
      </div>

      {/* Interest tags row */}
      {tags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-1.5">
          {tags.slice(0, 8).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
          {tags.length > 8 && (
            <span className="inline-flex items-center rounded-full bg-highlight px-2.5 py-0.5 text-[10px] font-medium text-text-secondary">
              +{tags.length - 8} more
            </span>
          )}
        </div>
      )}

      {/* Edit button */}
      {showEdit && (
        <Button variant="secondary" size="sm" onClick={onEdit}>
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Edit Profile
        </Button>
      )}
    </motion.div>
  );
}

export default ProfileHeader;
