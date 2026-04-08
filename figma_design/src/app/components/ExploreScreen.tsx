import { EventCard } from './EventCard';
import { Search } from 'lucide-react';

export function ExploreScreen() {
  const categories = ['All', 'Networking', 'Workshops', 'Social', 'Career', 'Academic'];

  const events = [
    {
      title: 'Spring Networking Fair',
      location: 'Main Auditorium',
      time: 'Apr 15, 2:00 PM',
      attendees: 250,
    },
    {
      title: 'React Workshop',
      location: 'Computer Lab B',
      time: 'Apr 12, 4:00 PM',
      attendees: 40,
    },
    {
      title: 'Alumni Meetup',
      location: 'Campus Center',
      time: 'Apr 18, 6:00 PM',
      attendees: 95,
    },
    {
      title: 'Research Symposium',
      location: 'Science Building',
      time: 'Apr 20, 10:00 AM',
      attendees: 180,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] pb-4">
      <div className="px-4 pt-4">
        <h2 className="text-2xl font-bold text-[#111827] mb-4">Explore Events</h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full h-11 pl-10 pr-4 bg-white border border-[#E5E7EB] rounded-xl outline-none focus:border-[#3B82F6]"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
          {categories.map((category, i) => (
            <button
              key={i}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                i === 0
                  ? 'bg-[#1E3A8A] text-white'
                  : 'bg-white border border-[#E5E7EB] text-[#6B7280]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {events.map((event, i) => (
            <EventCard key={i} {...event} image="gradient" />
          ))}
        </div>
      </div>
    </div>
  );
}
