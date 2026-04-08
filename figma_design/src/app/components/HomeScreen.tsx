import { EventCard } from './EventCard';
import { ChevronRight } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const upcomingEvents = [
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
  ];

  const suggestedEvents = [
    {
      title: 'Machine Learning Workshop',
      location: 'Computer Lab',
      time: 'Fri, 3:00 PM',
      attendees: 45,
    },
    {
      title: 'Alumni Panel Discussion',
      location: 'Auditorium',
      time: 'Next Mon, 5:00 PM',
      attendees: 150,
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] pb-4">
      <section className="px-4 pt-4">
        <h2 className="text-xl font-semibold text-[#111827] mb-4">Upcoming Events</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {upcomingEvents.map((event, i) => (
            <div key={i} onClick={() => onNavigate('event', event)}>
              <EventCard {...event} horizontal image="gradient" />
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 mt-6">
        <div className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-between">
          <div>
            <p className="text-sm text-[#6B7280]">You have</p>
            <p className="text-lg font-semibold text-[#1E3A8A]">5 people who match with you</p>
          </div>
          <button
            onClick={() => onNavigate('event')}
            className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl font-medium hover:bg-[#1E3A8A]/90 transition-all active:scale-[0.97] flex items-center gap-1"
          >
            View
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      <section className="px-4 mt-6">
        <h2 className="text-xl font-semibold text-[#111827] mb-4">Suggested Events</h2>
        <div className="space-y-3">
          {suggestedEvents.map((event, i) => (
            <div key={i} onClick={() => onNavigate('event', event)}>
              <EventCard {...event} image="gradient" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
