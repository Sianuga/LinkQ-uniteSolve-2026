import { MapPin, Clock, Users } from 'lucide-react';

interface EventCardProps {
  title: string;
  location: string;
  time: string;
  attendees: number;
  horizontal?: boolean;
  image?: string;
}

export function EventCard({ title, location, time, attendees, horizontal = false, image }: EventCardProps) {
  if (horizontal) {
    return (
      <div className="min-w-[280px] bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        {image && (
          <div className="w-full h-32 bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] rounded-xl mb-3" />
        )}
        <h3 className="font-semibold text-[#111827] mb-2">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-1">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-2">
          <Clock className="w-4 h-4" />
          <span>{time}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#1E3A8A]">
          <Users className="w-4 h-4" />
          <span>{attendees} attending</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-3">
      {image && (
        <div className="w-full h-40 bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] rounded-xl mb-3" />
      )}
      <h3 className="font-semibold text-[#111827] mb-2">{title}</h3>
      <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-1">
        <MapPin className="w-4 h-4" />
        <span>{location}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-2">
        <Clock className="w-4 h-4" />
        <span>{time}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-[#1E3A8A]">
        <Users className="w-4 h-4" />
        <span>{attendees} attending</span>
      </div>
    </div>
  );
}
