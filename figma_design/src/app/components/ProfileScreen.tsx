import { Tag } from './Tag';
import { User, Calendar } from 'lucide-react';

export function ProfileScreen() {
  const interests = ['Machine Learning', 'Web Development', 'Hackathons', 'Research', 'Cloud Computing'];

  const timeline = [
    { date: 'Mar 2026', event: 'Tech Conference', type: 'Conference' },
    { date: 'Feb 2026', event: 'Spring Hackathon', type: 'Hackathon' },
    { date: 'Jan 2026', event: 'AI Workshop Series', type: 'Workshop' },
    { date: 'Dec 2025', event: 'Networking Mixer', type: 'Social' },
  ];

  const eventsJoined = [
    { title: 'CS Networking Mixer', date: 'Today' },
    { title: 'Hackathon Kickoff', date: 'Tomorrow' },
    { title: 'Career Fair Prep', date: 'Wed' },
    { title: 'ML Workshop', date: 'Fri' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] pb-4">
      <div className="bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] h-32" />

      <div className="px-4 -mt-12">
        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-xl font-semibold text-[#111827]">Alex Johnson</h2>
          <p className="text-sm text-[#6B7280]">Computer Science • Class of 2026</p>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[#111827] mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, i) => (
              <Tag key={i}>{interest}</Tag>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          <h3 className="text-sm font-semibold text-[#111827] mb-4">Event Timeline</h3>
          <div className="space-y-4">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#1E3A8A]" />
                  {i < timeline.length - 1 && (
                    <div className="w-0.5 h-full bg-[#E5E7EB] mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="text-xs text-[#6B7280] mb-1">{item.date}</p>
                  <p className="text-sm font-medium text-[#111827]">{item.event}</p>
                  <p className="text-xs text-[#6B7280]">{item.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-[#111827] mb-3">Events Joined</h3>
          <div className="grid grid-cols-2 gap-3">
            {eventsJoined.map((event, i) => (
              <div key={i} className="bg-white rounded-2xl p-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                <Calendar className="w-5 h-5 text-[#1E3A8A] mb-2" />
                <p className="text-sm font-medium text-[#111827] mb-1">{event.title}</p>
                <p className="text-xs text-[#6B7280]">{event.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
