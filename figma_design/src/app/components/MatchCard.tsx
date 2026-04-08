import { Tag } from './Tag';
import { User } from 'lucide-react';

interface MatchCardProps {
  name: string;
  tags: string[];
  matchScore: number;
  sharedInfo?: string;
  isTopMatch?: boolean;
}

export function MatchCard({ name, tags, matchScore, sharedInfo, isTopMatch = false }: MatchCardProps) {
  return (
    <div className={`bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] mb-3 ${
      isTopMatch ? 'border-2 border-[#3B82F6]' : ''
    }`}>
      <div className="flex items-start gap-3">
        <div className={`${isTopMatch ? 'w-14 h-14' : 'w-10 h-10'} rounded-full bg-gradient-to-br from-[#3B82F6] to-[#1E3A8A] flex items-center justify-center flex-shrink-0`}>
          <User className={`${isTopMatch ? 'w-7 h-7' : 'w-5 h-5'} text-white`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#111827] mb-1">{name}</h3>
          {sharedInfo && (
            <p className="text-xs text-[#6B7280] mb-2">{sharedInfo}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag, i) => (
              <Tag key={i}>{tag}</Tag>
            ))}
          </div>
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[#6B7280]">Match Score</span>
              <span className="font-semibold text-[#1E3A8A]">{matchScore}%</span>
            </div>
            <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A] rounded-full transition-all duration-500"
                style={{ width: `${matchScore}%` }}
              />
            </div>
          </div>
          <button className="w-full h-9 bg-[#1E3A8A] text-white rounded-xl font-medium hover:bg-[#1E3A8A]/90 transition-all active:scale-[0.97]">
            Connect
          </button>
        </div>
      </div>
    </div>
  );
}
