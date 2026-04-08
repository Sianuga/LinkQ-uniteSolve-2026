import { Home, Compass, Calendar, MessageCircle, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'explore', icon: Compass, label: 'Explore' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'messages', icon: MessageCircle, label: 'Messages' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="h-16 bg-white border-t border-[#E5E7EB] px-2 flex items-center justify-around">
      {tabs.map(({ id, icon: Icon, label }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex flex-col items-center gap-1 py-2 px-3 min-w-[60px]"
          >
            <Icon
              className={`w-6 h-6 ${isActive ? 'text-[#1E3A8A]' : 'text-[#6B7280]'}`}
            />
            <span className={`text-[10px] ${isActive ? 'text-[#1E3A8A]' : 'text-[#6B7280]'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
