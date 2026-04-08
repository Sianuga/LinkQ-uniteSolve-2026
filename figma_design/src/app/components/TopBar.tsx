import { Search, User } from 'lucide-react';

export function TopBar() {
  return (
    <div className="h-16 bg-white border-b border-[#E5E7EB] px-4 flex items-center justify-between">
      <div className="flex-1 mr-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search events, people..."
            className="w-full h-10 pl-10 pr-4 bg-[#F3F4F6] rounded-xl border-none outline-none"
          />
        </div>
      </div>
      <button className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center">
        <User className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
