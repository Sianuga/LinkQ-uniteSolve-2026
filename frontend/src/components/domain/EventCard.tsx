import { motion } from 'framer-motion';
import { MapPin, Clock, Users } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import type { AppEvent, EventCategory } from '@/types';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const categoryColors: Record<EventCategory, { bg: string; text: string }> = {
  lecture:   { bg: 'bg-blue-100',   text: 'text-blue-800'   },
  seminar:   { bg: 'bg-purple-100', text: 'text-purple-800' },
  hackathon: { bg: 'bg-amber-100',  text: 'text-amber-800'  },
  club:      { bg: 'bg-emerald-100',text: 'text-emerald-800'},
  social:    { bg: 'bg-pink-100',   text: 'text-pink-800'   },
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface EventCardProps {
  event: AppEvent;
  /** "horizontal" for scroll rows, "vertical" for stacked lists */
  variant?: 'horizontal' | 'vertical';
  onClick?: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EventCard({ event, variant = 'vertical', onClick }: EventCardProps) {
  const isHorizontal = variant === 'horizontal';
  const colors = categoryColors[event.category];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={isHorizontal ? 'w-64 min-w-[256px] shrink-0 snap-start' : 'w-full'}
    >
      <Card
        className={`cursor-pointer overflow-hidden ${isHorizontal ? '' : ''}`}
        onClick={onClick}
      >
        {/* Optional image banner */}
        {event.image_url && (
          <div className="relative h-32 w-full overflow-hidden">
            <img
              src={event.image_url}
              alt={event.title}
              className="h-full w-full object-cover"
            />
            {/* Gradient overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        )}

        <div className="flex flex-col gap-3 p-4">
          {/* Category badge */}
          <div className="flex items-center justify-between">
            <Badge className={`${colors.bg} ${colors.text} text-[10px] font-medium capitalize`}>
              {event.category}
            </Badge>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold leading-6 text-gray-900 line-clamp-2">
            {event.title}
          </h3>

          {/* Meta row */}
          <div className="flex flex-col gap-1.5">
            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>

            {/* Time */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{formatTime(event.start_time)}</span>
            </div>

            {/* Attendees */}
            {event.attendee_count !== undefined && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span>
                  {event.attendee_count} {event.attendee_count === 1 ? 'attendee' : 'attendees'}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default EventCard;
