import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Avatar, Button } from '@/components/ui';
import type { Connection, UserSummary } from '@/types';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface ConnectionRequestProps {
  connection: Connection;
  requester: UserSummary;
  onAccept?: (connection: Connection) => void;
  onReject?: (connection: Connection) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ConnectionRequest({
  connection,
  requester,
  onAccept,
  onReject,
}: ConnectionRequestProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
    >
      {/* Avatar */}
      <Avatar
        src={requester.avatar_url}
        alt={requester.name}
        size={48}
        fallback={requester.name}
      />

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <h3 className="truncate text-sm font-semibold leading-5 text-gray-900">
          {requester.name}
        </h3>
        <p className="truncate text-xs text-gray-500">
          {requester.program}
        </p>
        {requester.university && (
          <p className="truncate text-[10px] text-gray-400">
            {requester.university}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={() => onAccept?.(connection)}
          aria-label="Accept connection"
          className="!min-h-[36px] !min-w-[36px] !rounded-full !p-0 sm:!min-w-0 sm:!rounded-xl sm:!px-3"
        >
          <Check className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Accept</span>
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={() => onReject?.(connection)}
          aria-label="Reject connection"
          className="!min-h-[36px] !min-w-[36px] !rounded-full !p-0 sm:!min-w-0 sm:!rounded-xl sm:!px-3"
        >
          <X className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Reject</span>
        </Button>
      </div>
    </motion.div>
  );
}

export default ConnectionRequest;
