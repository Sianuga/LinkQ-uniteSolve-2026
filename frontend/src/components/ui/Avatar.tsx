import type { AvatarType } from '../../types';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  src?: string;
  name: string;
  size?: AvatarSize;
  avatarType?: AvatarType;
  className?: string;
}

const sizeMap: Record<AvatarSize, number> = {
  sm: 40,
  md: 56,
  lg: 80,
};

const textSizeMap: Record<AvatarSize, string> = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

/** Deterministic color based on avatar type or name. */
const avatarColors: Record<AvatarType, { bg: string; text: string }> = {
  buff_arnold: { bg: '#DC2626', text: '#FFFFFF' },
  banana_guy: { bg: '#F59E0B', text: '#111827' },
  anime_girl: { bg: '#EC4899', text: '#FFFFFF' },
  bland_normal_guy: { bg: '#6B7280', text: '#FFFFFF' },
  mystery_silhouette: { bg: '#1E3A8A', text: '#FFFFFF' },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getFallbackColor(avatarType?: AvatarType, name?: string) {
  if (avatarType && avatarColors[avatarType]) {
    return avatarColors[avatarType];
  }
  // Hash the name to pick a color
  const hash = (name ?? '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const palette = Object.values(avatarColors);
  return palette[hash % palette.length];
}

export function Avatar({
  src,
  name,
  size = 'md',
  avatarType,
  className = '',
}: AvatarProps) {
  const px = sizeMap[size];
  const initials = getInitials(name);
  const colors = getFallbackColor(avatarType, name);

  return (
    <div
      className={[
        'relative inline-flex items-center justify-center',
        'rounded-full overflow-hidden shrink-0',
        'border-2 border-white',
        'shadow-sm',
        className,
      ].join(' ')}
      style={{ width: px, height: px }}
      aria-label={name}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className={[
            'w-full h-full flex items-center justify-center font-semibold',
            textSizeMap[size],
          ].join(' ')}
          style={{ backgroundColor: colors.bg, color: colors.text }}
        >
          {initials}
        </div>
      )}
    </div>
  );
}
