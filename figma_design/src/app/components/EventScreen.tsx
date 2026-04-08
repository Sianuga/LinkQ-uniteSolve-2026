import { useState } from 'react';
import { MapPin, Clock, Users, ArrowLeft, MessageCircle, Plus, ChevronRight } from 'lucide-react';
import { Tag } from './Tag';
import { MatchCard } from './MatchCard';
import { PersonCard } from './PersonCard';
import { SwipeCard } from './SwipeCard';
import { ProfileComparison } from './ProfileComparison';

interface EventScreenProps {
  onBack: () => void;
  eventData?: any;
}

export function EventScreen({ onBack, eventData }: EventScreenProps) {
  const [activeTab, setActiveTab] = useState('matches');
  const [viewMode, setViewMode] = useState<'event' | 'comparison'>('event');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const tabs = ['overview', 'people', 'sub-events', 'matches'];

  const initialMatchData = [
    {
      name: 'Sarah Chen',
      program: 'Computer Science',
      tags: ['AI', 'Systems', 'Cloud'],
      matchScore: 91,
      sharedEvents: 2,
      sharedCourses: 1,
      sharedInterests: 3,
      avatarColor: '#8B5CF6',
      sharedEventsDetails: ['Advanced Systems', 'AI Workshop'],
      sharedCoursesDetails: ['Distributed Systems'],
      sharedInterestsDetails: ['AI', 'Cloud', 'Systems'],
      onlyTheyHave: ['Data Science', 'Research'],
    },
    {
      name: 'Michael Torres',
      program: 'Data Science',
      tags: ['Python', 'ML', 'Research'],
      matchScore: 84,
      sharedEvents: 1,
      sharedCourses: 0,
      sharedInterests: 2,
      avatarColor: '#10B981',
      sharedEventsDetails: ['AI Workshop'],
      sharedCoursesDetails: [],
      sharedInterestsDetails: ['AI', 'Python'],
      onlyTheyHave: ['Statistics', 'Analytics'],
    },
    {
      name: 'Emily Johnson',
      program: 'Software Engineering',
      tags: ['React', 'Design', 'Frontend'],
      matchScore: 78,
      sharedEvents: 3,
      sharedCourses: 1,
      sharedInterests: 1,
      avatarColor: '#F59E0B',
      sharedEventsDetails: ['Web Dev Meetup', 'Tech Conference', 'Hackathon'],
      sharedCoursesDetails: ['Web Development'],
      sharedInterestsDetails: ['React'],
      onlyTheyHave: ['UX Design', 'CSS'],
    },
  ];

  const [swipeCards, setSwipeCards] = useState(initialMatchData);

  const peopleData = [
    { name: 'Alex Rivera', tags: ['Computer Science', 'Backend'], matchScore: 72 },
    { name: 'Jordan Lee', tags: ['Data Engineering', 'Cloud'], matchScore: 68 },
    { name: 'Taylor Kim', tags: ['Mobile Dev', 'iOS'], matchScore: 65 },
    { name: 'Morgan Blake', tags: ['Security', 'Networking'], matchScore: 61 },
  ];

  const subEvents = [
    { title: 'Morning Workshop: Getting Started', description: 'Introduction to networking', attendees: 35 },
    { title: 'Afternoon Panel: Industry Insights', description: 'Career paths discussion', attendees: 28 },
    { title: 'Evening Social: Casual Meetup', description: 'Informal networking session', attendees: 45 },
  ];

  const handleSwipeLeft = () => {
    // Remove top card (skip)
    setSwipeCards(prev => prev.slice(1));
  };

  const handleSwipeRight = () => {
    // Remove top card (connect)
    setSwipeCards(prev => prev.slice(1));
  };

  const handleCardTap = (profile: any) => {
    setSelectedProfile(profile);
    setViewMode('comparison');
  };

  if (viewMode === 'comparison' && selectedProfile) {
    return (
      <ProfileComparison
        onBack={() => setViewMode('event')}
        otherUser={{
          name: selectedProfile.name,
          program: selectedProfile.program,
          avatarColor: selectedProfile.avatarColor,
          sharedEvents: selectedProfile.sharedEventsDetails,
          sharedCourses: selectedProfile.sharedCoursesDetails,
          sharedInterests: selectedProfile.sharedInterestsDetails,
          onlyTheyHave: selectedProfile.onlyTheyHave,
        }}
        matchScore={selectedProfile.matchScore}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC]">
      <div className="bg-white">
        <div className="h-48 bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] relative">
          <button
            onClick={onBack}
            className="absolute top-4 left-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-[#111827] mb-3">
            {eventData?.title || 'CS Networking Mixer'}
          </h1>
          <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-2">
            <MapPin className="w-4 h-4" />
            <span>{eventData?.location || 'Student Center, Room 301'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-3">
            <Clock className="w-4 h-4" />
            <span>{eventData?.time || 'Today, 6:00 PM - 8:00 PM'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#1E3A8A] mb-4">
            <Users className="w-4 h-4" />
            <span>{eventData?.attendees || 120} attending</span>
          </div>

          <div className="flex gap-2 mb-4">
            <button className="flex-1 h-11 bg-[#1E3A8A] text-white rounded-xl font-medium hover:bg-[#1E3A8A]/90 transition-all active:scale-[0.97]">
              Join Event
            </button>
            <button className="h-11 w-11 border border-[#E5E7EB] bg-white rounded-xl flex items-center justify-center hover:bg-[#F3F4F6] transition-all active:scale-[0.97]">
              <MessageCircle className="w-5 h-5 text-[#1E3A8A]" />
            </button>
          </div>

          <div className="flex gap-2 border-b border-[#E5E7EB]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize relative ${
                  activeTab === tab ? 'text-[#1E3A8A]' : 'text-[#6B7280]'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E3A8A]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'overview' && (
          <div>
            <p className="text-sm text-[#6B7280] mb-4">
              Join us for an exciting evening of networking with fellow Computer Science students.
              This is a great opportunity to meet peers, share experiences, and build connections
              that will last throughout your academic journey and beyond.
            </p>
            <h3 className="font-semibold text-[#111827] mb-2">What to Expect</h3>
            <ul className="text-sm text-[#6B7280] space-y-1 list-disc list-inside">
              <li>Speed networking sessions</li>
              <li>Career advice from alumni</li>
              <li>Light refreshments</li>
              <li>Group activities</li>
            </ul>
          </div>
        )}

        {activeTab === 'people' && (
          <div>
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              <button className="px-3 py-1.5 bg-[#1E3A8A] text-white rounded-full text-sm font-medium whitespace-nowrap">
                Top Match
              </button>
              <button className="px-3 py-1.5 border border-[#E5E7EB] bg-white text-[#6B7280] rounded-full text-sm font-medium whitespace-nowrap">
                Same Program
              </button>
              <button className="px-3 py-1.5 border border-[#E5E7EB] bg-white text-[#6B7280] rounded-full text-sm font-medium whitespace-nowrap">
                Same Interests
              </button>
            </div>
            <div>
              {peopleData.map((person, i) => (
                <PersonCard key={i} {...person} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sub-events' && (
          <div>
            <button className="w-full h-11 border-2 border-dashed border-[#E5E7EB] bg-white rounded-xl text-[#1E3A8A] font-medium hover:bg-[#F8FAFC] transition-all flex items-center justify-center gap-2 mb-4">
              <Plus className="w-5 h-5" />
              Create Sub-event
            </button>
            <div className="space-y-3">
              {subEvents.map((subEvent, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#111827] text-sm mb-1">{subEvent.title}</h3>
                    <p className="text-xs text-[#6B7280] mb-1">{subEvent.description}</p>
                    <div className="flex items-center gap-1 text-xs text-[#1E3A8A]">
                      <Users className="w-3 h-3" />
                      <span>{subEvent.attendees} attending</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#6B7280]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="relative h-[550px]">
            {swipeCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="font-semibold text-[#111827] mb-2">No more matches</h3>
                <p className="text-sm text-[#6B7280] text-center mb-4">
                  You've seen everyone! Check back later for new matches.
                </p>
                <button className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl text-sm font-medium hover:bg-[#1E3A8A]/90 transition-all">
                  Invite classmates
                </button>
              </div>
            ) : (
              <>
                {swipeCards.slice(0, 3).reverse().map((card, index) => {
                  const cardIndex = swipeCards.slice(0, 3).length - 1 - index;
                  const isTop = cardIndex === swipeCards.slice(0, 3).length - 1;
                  const scale = 1 - (cardIndex * 0.03);
                  const yOffset = cardIndex * 8;

                  return (
                    <SwipeCard
                      key={`${card.name}-${index}`}
                      name={card.name}
                      program={card.program}
                      matchScore={card.matchScore}
                      sharedEvents={card.sharedEvents}
                      sharedCourses={card.sharedCourses}
                      sharedInterests={card.sharedInterests}
                      tags={card.tags}
                      avatarColor={card.avatarColor}
                      isTop={isTop}
                      style={{
                        transform: `scale(${scale}) translateY(${yOffset}px)`,
                        zIndex: isTop ? 10 : 10 - cardIndex,
                      }}
                      onSwipeLeft={isTop ? handleSwipeLeft : undefined}
                      onSwipeRight={isTop ? handleSwipeRight : undefined}
                      onCardTap={isTop ? () => handleCardTap(card) : undefined}
                    />
                  );
                })}
                <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-[#6B7280]">
                  Swipe right to connect, left to skip
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
