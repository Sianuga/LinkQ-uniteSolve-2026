import { User, Search } from 'lucide-react';

export function MessagesScreen() {
  const conversations = [
    { name: 'Sarah Chen', lastMessage: 'See you at the event!', time: '2m ago', unread: true },
    { name: 'CS Study Group', lastMessage: 'Meeting at 3 PM tomorrow', time: '1h ago', unread: false },
    { name: 'Michael Torres', lastMessage: 'Thanks for connecting', time: '3h ago', unread: false },
    { name: 'Career Fair Team', lastMessage: 'Updated schedule attached', time: '1d ago', unread: false },
    { name: 'Emily Johnson', lastMessage: 'Great presentation today!', time: '2d ago', unread: false },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F8FAFC] pb-4">
      <div className="px-4 pt-4">
        <h2 className="text-2xl font-bold text-[#111827] mb-4">Messages</h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search messages..."
            className="w-full h-11 pl-10 pr-4 bg-white border border-[#E5E7EB] rounded-xl outline-none focus:border-[#3B82F6]"
          />
        </div>

        <div className="space-y-2">
          {conversations.map((conv, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-start gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-[#111827] text-sm">{conv.name}</h3>
                  <span className="text-xs text-[#6B7280]">{conv.time}</span>
                </div>
                <p className={`text-sm truncate ${conv.unread ? 'text-[#111827] font-medium' : 'text-[#6B7280]'}`}>
                  {conv.lastMessage}
                </p>
              </div>
              {conv.unread && (
                <div className="w-2 h-2 rounded-full bg-[#1E3A8A] flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>

        {conversations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#E5E7EB] flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-[#6B7280]" />
            </div>
            <p className="text-[#6B7280] text-sm mb-4">No messages yet</p>
            <button className="px-4 py-2 bg-[#1E3A8A] text-white rounded-xl font-medium">
              Invite classmates
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
