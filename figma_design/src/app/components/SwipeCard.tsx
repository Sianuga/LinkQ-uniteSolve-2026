import { useState, useRef, useEffect } from 'react';
import { X, Star, Heart } from 'lucide-react';

interface SwipeCardProps {
  name: string;
  program: string;
  matchScore: number;
  sharedEvents: number;
  sharedCourses: number;
  sharedInterests: number;
  tags: string[];
  avatarColor: string;
  isTop?: boolean;
  style?: React.CSSProperties;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onCardTap?: () => void;
}

export function SwipeCard({
  name,
  program,
  matchScore,
  sharedEvents,
  sharedCourses,
  sharedInterests,
  tags,
  avatarColor,
  isTop = false,
  style,
  onSwipeLeft,
  onSwipeRight,
  onCardTap,
}: SwipeCardProps) {
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTop) return;
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isTop) return;
    const touch = e.touches[0];
    const offsetX = touch.clientX - dragStart.x;
    const offsetY = touch.clientY - dragStart.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleTouchEnd = () => {
    if (!isTop) return;
    setIsDragging(false);

    // Determine swipe direction
    if (Math.abs(dragOffset.x) > 100) {
      if (dragOffset.x > 0) {
        // Swiped right
        animateSwipeOut('right');
      } else {
        // Swiped left
        animateSwipeOut('left');
      }
    } else {
      // Return to center
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isTop) return;
    e.preventDefault();
    setDragStart({ x: e.clientX, y: e.clientY });
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isTop) return;
    const offsetX = e.clientX - dragStart.x;
    const offsetY = e.clientY - dragStart.y;
    setDragOffset({ x: offsetX, y: offsetY });
  };

  const handleMouseUp = () => {
    if (!isTop) return;
    setIsDragging(false);

    // Determine swipe direction
    if (Math.abs(dragOffset.x) > 100) {
      if (dragOffset.x > 0) {
        animateSwipeOut('right');
      } else {
        animateSwipeOut('left');
      }
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        if (!isTop) return;
        const offsetX = e.clientX - dragStart.x;
        const offsetY = e.clientY - dragStart.y;
        setDragOffset({ x: offsetX, y: offsetY });
      };

      const handleGlobalMouseUp = () => {
        handleMouseUp();
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStart, isTop]);

  const animateSwipeOut = (direction: 'left' | 'right') => {
    const finalX = direction === 'right' ? 500 : -500;
    setDragOffset({ x: finalX, y: 0 });

    setTimeout(() => {
      if (direction === 'right') {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
      setDragOffset({ x: 0, y: 0 });
    }, 300);
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = 1 - Math.abs(dragOffset.x) / 500;

  // Extract scale and translateY from style prop if they exist
  const baseTransform = style?.transform || '';

  const cardStyle: React.CSSProperties = {
    ...style,
    transform: `${baseTransform} translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
    opacity: isTop ? opacity : 1,
    transition: isDragging ? 'none' : 'transform 0.3s ease, opacity 0.3s ease',
    cursor: isTop ? 'grab' : 'default',
    pointerEvents: isTop ? 'auto' : 'none',
  };

  return (
    <div
      ref={cardRef}
      className="absolute inset-x-4 top-0 bg-white rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.15)] overflow-hidden select-none"
      style={cardStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      {/* Match Badge */}
      <div className="absolute top-4 right-4 px-3 py-1.5 bg-gradient-to-r from-[#3B82F6] to-[#1E3A8A] rounded-full text-white text-xs font-semibold z-10">
        {matchScore}% Match
      </div>

      {/* Avatar Section */}
      <div
        className="h-64 bg-gradient-to-br flex items-center justify-center relative cursor-pointer"
        style={{ background: avatarColor }}
        onClick={() => isTop && onCardTap?.()}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="relative z-10 text-white text-6xl font-bold">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-[#111827]">{name}</h2>
          <p className="text-sm text-[#6B7280]">{program}</p>
        </div>

        {/* Shared Highlights */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-[#6B7280] uppercase mb-2">Shared Highlights</h3>
          <div className="space-y-1 text-sm text-[#111827]">
            <div>• {sharedEvents} events</div>
            <div>• {sharedCourses} course{sharedCourses !== 1 ? 's' : ''}</div>
            <div>• {sharedInterests} interests</div>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 bg-[#EFF6FF] text-[#1E3A8A] rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        {isTop && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                animateSwipeOut('left');
              }}
              className="w-14 h-14 rounded-full border-2 border-[#E5E7EB] bg-white flex items-center justify-center hover:bg-[#FEF2F2] hover:border-[#EF4444] transition-all active:scale-90"
            >
              <X className="w-6 h-6 text-[#EF4444]" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                // Star/Save action
              }}
              className="w-14 h-14 rounded-full border-2 border-[#E5E7EB] bg-white flex items-center justify-center hover:bg-[#FFFBEB] hover:border-[#F59E0B] transition-all active:scale-90"
            >
              <Star className="w-6 h-6 text-[#F59E0B]" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                animateSwipeOut('right');
              }}
              className="w-14 h-14 rounded-full border-2 border-[#E5E7EB] bg-white flex items-center justify-center hover:bg-[#FEF2F2] hover:border-[#EF4444] transition-all active:scale-90"
            >
              <Heart className="w-6 h-6 text-[#EF4444]" />
            </button>
          </div>
        )}
      </div>

      {/* Swipe Indicator Overlay */}
      {isTop && dragOffset.x !== 0 && (
        <div
          className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
            dragOffset.x > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}
        >
          <div
            className={`text-6xl font-bold ${
              dragOffset.x > 0 ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {dragOffset.x > 0 ? '❤️' : '✗'}
          </div>
        </div>
      )}
    </div>
  );
}
