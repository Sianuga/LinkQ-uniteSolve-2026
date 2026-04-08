import { useState } from 'react';
import { TopBar } from './components/TopBar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { EventScreen } from './components/EventScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { MessagesScreen } from './components/MessagesScreen';
import { EventsScreen } from './components/EventsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentScreen, setCurrentScreen] = useState<'main' | 'event'>('main');
  const [eventData, setEventData] = useState<any>(null);

  const handleNavigate = (screen: string, data?: any) => {
    if (screen === 'event') {
      setEventData(data);
      setCurrentScreen('event');
    }
  };

  const handleBack = () => {
    setCurrentScreen('main');
    setEventData(null);
  };

  if (currentScreen === 'event') {
    return (
      <div className="w-full h-full max-w-[390px] mx-auto flex flex-col bg-[#F8FAFC]">
        <EventScreen onBack={handleBack} eventData={eventData} />
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-[390px] mx-auto flex flex-col bg-[#F8FAFC]">
      <TopBar />

      {activeTab === 'home' && <HomeScreen onNavigate={handleNavigate} />}
      {activeTab === 'explore' && <ExploreScreen />}
      {activeTab === 'events' && <EventsScreen />}
      {activeTab === 'messages' && <MessagesScreen />}
      {activeTab === 'profile' && <ProfileScreen />}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}