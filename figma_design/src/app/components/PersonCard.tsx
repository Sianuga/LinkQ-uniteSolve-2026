import { Tag } from './Tag';
import { User } from 'lucide-react';

interface PersonCardProps {
  name: string;
  tags: string[];
  matchScore: number;
}

export function PersonCard({ name, tags, matchScore }: PersonCardProps) {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#111827] text-sm mb-1">{name}</h3>
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 2).map((tag, i) => (
              <Tag key={i}>{tag}</Tag>
            ))}
          </div>
          <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A] rounded-full"
              style={{ width: `${matchScore}%` }}
            />
          </div>
        </div>
        <button className="px-4 py-1.5 bg-[#1E3A8A] text-white rounded-lg text-sm font-medium hover:bg-[#1E3A8A]/90 transition-all active:scale-[0.97] flex-shrink-0">
          Connect
        </button>
      </div>
    </div>
  );
}
