import { EventCard } from './EventCard';
import { Calendar, Plus } from 'lucide-react';

export function EventsScreen() {
  const myEvents = [
    {
      title: 'CS Networking Mixer',
      location: 'Student Center',
      time: 'Today, 6:00 PM',
      attendees: 120,
    },
    {
      title: 'Hackathon Kickoff',
      location: 'Engineering Building',
      time: 'Tomorrow, 2:00 PM',
      attendees: 85,
    },
    {
      title: 'Career Fair Prep',
      location: 'Library Hall',
      time: 'Wed, 4:00 PM',
      attendees: 200,
    },
    {
      title: 'Machine Learning Workshop',
      location: 'Computer Lab',
      time: 'Fri, 3:00 PM',
      attendees: 45,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] pb-4">
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#111827]">My Events</h2>
          <button className="w-10 h-10 bg-[#1E3A8A] rounded-full flex items-center justify-center hover:bg-[#1E3A8A]/90 transition-all active:scale-[0.97]">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button className="px-4 py-2 bg-[#1E3A8A] text-white rounded-full text-sm font-medium">
            Upcoming
          </button>
          <button className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#6B7280] rounded-full text-sm font-medium">
            Past
          </button>
        </div>

        <div className="space-y-3">
          {myEvents.map((event, i) => (
            <EventCard key={i} {...event} image="gradient" />
          ))}
        </div>

        {myEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#E5E7EB] flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-[#6B7280]" />
            </div>
            <p className="text-[#6B7280] text-sm mb-4">No events yet</p>
            <button className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl font-medium">
              Explore Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
