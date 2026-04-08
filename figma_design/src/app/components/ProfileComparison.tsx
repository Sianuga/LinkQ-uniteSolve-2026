import { ArrowLeft, MessageCircle } from 'lucide-react';
import { Tag } from './Tag';
import { useState, useEffect } from 'react';

interface ProfileComparisonProps {
  onBack: () => void;
  otherUser: {
    name: string;
    program: string;
    avatarColor: string;
    sharedEvents: string[];
    sharedCourses: string[];
    sharedInterests: string[];
    onlyTheyHave: string[];
  };
  matchScore: number;
}

export function ProfileComparison({ onBack, otherUser, matchScore }: ProfileComparisonProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    // Animate match score on mount
    const duration = 1000;
    const steps = 60;
    const increment = matchScore / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= matchScore) {
        setAnimatedScore(matchScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [matchScore]);

  const currentUser = {
    name: 'You',
    program: 'Computer Science',
    avatarColor: '#3B82F6',
    onlyYouHave: ['Security', 'Mobile Dev'],
  };

  const circumference = 2 * Math.PI * 50;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="w-full h-full flex flex-col bg-[#F8FAFC]">
      {/* Top Bar */}
      <div className="bg-white px-4 py-3 flex items-center shadow-sm">
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center -ml-2"
        >
          <ArrowLeft className="w-5 h-5 text-[#111827]" />
        </button>
        <h1 className="flex-1 text-center font-semibold text-[#111827] -ml-10">
          Compare Profiles
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Dual Profile Header */}
        <div className="flex justify-between items-start mb-8">
          {/* Left - Current User */}
          <div className="flex-1 flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2"
              style={{ backgroundColor: currentUser.avatarColor }}
            >
              ME
            </div>
            <div className="text-sm font-semibold text-[#111827]">{currentUser.name}</div>
            <div className="text-xs text-[#6B7280]">{currentUser.program}</div>
          </div>

          {/* Right - Other User */}
          <div className="flex-1 flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold mb-2"
              style={{ backgroundColor: otherUser.avatarColor }}
            >
              {otherUser.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="text-sm font-semibold text-[#111827]">{otherUser.name}</div>
            <div className="text-xs text-[#6B7280]">{otherUser.program}</div>
          </div>
        </div>

        {/* Match Score Circle */}
        <div className="flex justify-center mb-8">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="50"
                stroke="#3B82F6"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-[#1E3A8A]">{animatedScore}%</div>
              <div className="text-xs text-[#6B7280]">Match</div>
            </div>
          </div>
        </div>

        {/* Shared Data Section */}
        <div className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-4">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase mb-3">
            Shared Events
          </h3>
          <div className="space-y-2">
            {otherUser.sharedEvents.map((event, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-[#111827] bg-[#93C5FD]/10 rounded-lg px-3 py-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#93C5FD]" />
                {event}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-4">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase mb-3">
            Shared Courses
          </h3>
          <div className="space-y-2">
            {otherUser.sharedCourses.map((course, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-[#111827] bg-[#93C5FD]/10 rounded-lg px-3 py-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#93C5FD]" />
                {course}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-4">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase mb-3">
            Shared Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {otherUser.sharedInterests.map((interest, i) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-[#93C5FD]/20 text-[#1E3A8A] rounded-full text-xs font-medium border border-[#93C5FD]"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Differences Section */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase mb-2">
              Only You
            </h3>
            <div className="space-y-1">
              {currentUser.onlyYouHave.map((item, i) => (
                <div key={i} className="text-xs text-[#6B7280]">• {item}</div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <h3 className="text-xs font-semibold text-[#6B7280] uppercase mb-2">
              Only Them
            </h3>
            <div className="space-y-1">
              {otherUser.onlyTheyHave.map((item, i) => (
                <div key={i} className="text-xs text-[#6B7280]">• {item}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex gap-2">
          <button className="flex-1 h-11 bg-[#1E3A8A] text-white rounded-xl font-medium hover:bg-[#1E3A8A]/90 transition-all active:scale-[0.97]">
            Connect
          </button>
          <button className="h-11 w-11 border border-[#E5E7EB] bg-white rounded-xl flex items-center justify-center hover:bg-[#F3F4F6] transition-all active:scale-[0.97]">
            <MessageCircle className="w-5 h-5 text-[#1E3A8A]" />
          </button>
        </div>
      </div>
    </div>
  );
}
