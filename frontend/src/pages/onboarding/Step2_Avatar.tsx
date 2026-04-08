import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { AvatarType } from '@/types';

interface AvatarOption {
  type: AvatarType;
  name: string;
  subtitle: string;
  emoji: string;
  color: string;
  bgGradient: string;
  borderGlow: string;
}

const AVATARS: AvatarOption[] = [
  {
    type: 'buff_arnold',
    name: 'Cyber Samurai',
    subtitle: 'The Quiet Carry',
    emoji: '\u{1F4AA}',
    color: '#DC2626',
    bgGradient: 'from-red-500 to-orange-500',
    borderGlow: 'shadow-[0_0_20px_rgba(220,38,38,0.5)]',
  },
  {
    type: 'banana_guy',
    name: 'Banana Suit',
    subtitle: 'The Icebreaker',
    emoji: '\u{1F34C}',
    color: '#F59E0B',
    bgGradient: 'from-yellow-400 to-amber-500',
    borderGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.5)]',
  },
  {
    type: 'anime_girl',
    name: 'Synth Idol',
    subtitle: 'The Vibes',
    emoji: '\u{2728}',
    color: '#14B8A6',
    bgGradient: 'from-teal-400 to-cyan-500',
    borderGlow: 'shadow-[0_0_20px_rgba(20,184,166,0.5)]',
  },
  {
    type: 'bland_normal_guy',
    name: 'Campus Classic',
    subtitle: 'The Reliable One',
    emoji: '\u{1F64B}',
    color: '#6B7280',
    bgGradient: 'from-gray-400 to-slate-500',
    borderGlow: 'shadow-[0_0_20px_rgba(107,114,128,0.5)]',
  },
  {
    type: 'mystery_silhouette',
    name: 'Mystery',
    subtitle: '???',
    emoji: '\u{2753}',
    color: '#1E3A8A',
    bgGradient: 'from-indigo-900 to-slate-900',
    borderGlow: 'shadow-[0_0_20px_rgba(30,58,138,0.5)]',
  },
];

export default function Step2_Avatar() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<AvatarType | null>(null);

  const goNext = () => {
    if (selected) {
      navigate('/onboarding/about');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Pick Your Avatar
        </h1>
        <p className="text-sm text-text-secondary">
          Choose how you’ll appear in event lobbies. You can change this later.
        </p>
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {AVATARS.slice(0, 4).map((avatar, i) => (
          <AvatarCard
            key={avatar.type}
            avatar={avatar}
            isSelected={selected === avatar.type}
            onSelect={() => setSelected(avatar.type)}
            delay={i * 0.08}
          />
        ))}
      </div>

      {/* Mystery avatar (centered below) */}
      <div className="flex justify-center mb-6">
        <div className="w-[calc(50%-6px)]">
          <AvatarCard
            avatar={AVATARS[4]}
            isSelected={selected === AVATARS[4].type}
            onSelect={() => setSelected(AVATARS[4].type)}
            delay={0.32}
          />
        </div>
      </div>

      {/* Selected indicator */}
      {selected && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-text-secondary mb-4"
        >
          Selected:{' '}
          <span className="font-semibold text-text-primary">
            {AVATARS.find((a) => a.type === selected)?.name}
          </span>
        </motion.p>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Continue */}
      <div className="sticky bottom-0 pt-2 pb-safe bg-gradient-to-t from-background via-background to-transparent">
        <Button
          size="lg"
          className="w-full"
          disabled={!selected}
          onClick={goNext}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function AvatarCard({
  avatar,
  isSelected,
  onSelect,
  delay,
}: {
  avatar: AvatarOption;
  isSelected: boolean;
  onSelect: () => void;
  delay: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 260, damping: 20 }}
      whileTap={{ scale: 0.95 }}
      onClick={onSelect}
      className={[
        'relative flex min-h-[132px] flex-col items-center justify-center gap-1 p-4 rounded-[var(--radius-lg)]',
        'cursor-pointer select-none overflow-hidden',
        'transition-all duration-200',
        isSelected
          ? `ring-2 ring-offset-2 ring-offset-background shadow-sm ${avatar.borderGlow}`
          : 'hover:shadow-md',
      ].join(' ')}
      style={{
        borderColor: isSelected ? avatar.color : undefined,
        ['--tw-ring-color' as string]: avatar.color,
      }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${avatar.bgGradient} opacity-[0.08]`} />

      {/* Selected check */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: avatar.color }}
        >
          <Check className="w-3.5 h-3.5 text-white" />
        </motion.div>
      )}

      {/* Emoji / Avatar visual */}
      <motion.div
        animate={isSelected ? { scale: 1.15 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="text-5xl mb-1 relative z-10"
      >
        {avatar.emoji}
      </motion.div>

      {/* Info */}
      <div className="relative z-10 text-center px-1">
        <p className="text-sm font-bold text-text-primary leading-tight">{avatar.name}</p>
        <p className="text-xs text-text-secondary leading-tight">{avatar.subtitle}</p>
      </div>

      {/* Surface overlay for unselected */}
      <div
        className={[
          'absolute inset-0 border rounded-[var(--radius-lg)] transition-colors duration-200',
          isSelected ? 'border-transparent bg-highlight/20' : 'border-border bg-surface/60',
        ].join(' ')}
        style={{ pointerEvents: 'none' }}
      />
    </motion.button>
  );
}
