import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, UserRound, Users, UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { StudyStyle } from '@/types';

/* ------------------------------------------------------------------ */
/*  Time grid data                                                     */
/* ------------------------------------------------------------------ */

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
const TIME_SLOTS = ['Morning', 'Afternoon', 'Evening'] as const;

const TIME_SLOT_LABELS: Record<(typeof TIME_SLOTS)[number], string> = {
  Morning: '8-12',
  Afternoon: '12-18',
  Evening: '18-22',
};

type SlotKey = `${(typeof DAYS)[number]}-${(typeof TIME_SLOTS)[number]}`;

/* ------------------------------------------------------------------ */
/*  Study style options                                                */
/* ------------------------------------------------------------------ */

interface StyleOption {
  value: StudyStyle;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const STUDY_STYLES: StyleOption[] = [
  {
    value: 'solo',
    icon: <UserRound className="w-7 h-7" />,
    label: 'Solo',
    description: 'I prefer studying alone',
  },
  {
    value: 'pair',
    icon: <Users className="w-7 h-7" />,
    label: 'Pair',
    description: 'One study buddy is ideal',
  },
  {
    value: 'group',
    icon: <UsersRound className="w-7 h-7" />,
    label: 'Group',
    description: 'The more the merrier',
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function Step5_Preferences() {
  const navigate = useNavigate();
  const [selectedSlots, setSelectedSlots] = useState<Set<SlotKey>>(new Set());
  const [studyStyle, setStudyStyle] = useState<StudyStyle | null>(null);

  const toggleSlot = (slot: SlotKey) => {
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) {
        next.delete(slot);
      } else {
        next.add(slot);
      }
      return next;
    });
  };

  const canContinue = selectedSlots.size > 0 && studyStyle !== null;

  const goNext = () => {
    if (canContinue) {
      navigate('/onboarding/events');
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-highlight mb-2"
        >
          <Clock className="w-7 h-7 text-primary" />
        </motion.div>
        <h1 className="text-2xl font-bold text-text-primary">
          Study Preferences
        </h1>
        <p className="text-sm text-text-secondary max-w-xs mx-auto">
          When are you usually free? How do you like to study? This helps us find compatible partners.
        </p>
      </div>

      {/* Time grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-8"
      >
        <h2 className="text-sm font-semibold text-text-primary mb-3">
          Available Times
        </h2>

        <div className="overflow-x-auto -mx-1 scrollbar-hide">
          <div className="min-w-fit">
            {/* Header row */}
            <div className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
              <div /> {/* Spacer */}
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-text-secondary py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Time rows */}
            {TIME_SLOTS.map((slot) => (
              <div
                key={slot}
                className="grid gap-1.5 mb-1.5"
                style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}
              >
                {/* Row label */}
                <div className="flex flex-col justify-center text-right pr-2">
                  <span className="text-xs font-medium text-text-primary leading-tight">
                    {slot}
                  </span>
                  <span className="text-[10px] text-text-secondary leading-tight">
                    {TIME_SLOT_LABELS[slot]}
                  </span>
                </div>

                {/* Cells */}
                {DAYS.map((day) => {
                  const key: SlotKey = `${day}-${slot}`;
                  const isActive = selectedSlots.has(key);

                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleSlot(key)}
                      className={[
                        'aspect-square rounded-[var(--radius-sm)] border cursor-pointer',
                        'transition-all duration-150 min-w-[36px]',
                        isActive
                          ? 'bg-secondary border-secondary shadow-sm shadow-secondary/30'
                          : 'bg-surface border-border hover:border-secondary/50 hover:bg-highlight',
                      ].join(' ')}
                      aria-label={`${day} ${slot}`}
                      aria-pressed={isActive}
                    >
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-full h-full flex items-center justify-center"
                        >
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {selectedSlots.size > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-text-secondary mt-2"
          >
            {selectedSlots.size} time slot{selectedSlots.size !== 1 && 's'} selected
          </motion.p>
        )}
      </motion.div>

      {/* Study style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-6"
      >
        <h2 className="text-sm font-semibold text-text-primary mb-3">
          Study Style
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {STUDY_STYLES.map((style) => {
            const isSelected = studyStyle === style.value;

            return (
              <motion.button
                key={style.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStudyStyle(style.value)}
                className={[
                  'flex flex-col items-center gap-2 p-4 rounded-[var(--radius-lg)]',
                  'border-2 cursor-pointer select-none',
                  'transition-all duration-200',
                  isSelected
                    ? 'border-primary bg-highlight shadow-md'
                    : 'border-border bg-surface hover:border-secondary/30 hover:bg-highlight/50',
                ].join(' ')}
              >
                <motion.div
                  animate={isSelected ? { scale: 1.1, y: -2 } : { scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  className={isSelected ? 'text-primary' : 'text-text-secondary'}
                >
                  {style.icon}
                </motion.div>
                <span
                  className={[
                    'text-sm font-semibold',
                    isSelected ? 'text-primary' : 'text-text-primary',
                  ].join(' ')}
                >
                  {style.label}
                </span>
                <span className="text-[10px] text-text-secondary text-center leading-tight">
                  {style.description}
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Continue */}
      <div className="sticky bottom-0 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent">
        <Button
          size="lg"
          className="w-full"
          disabled={!canContinue}
          onClick={goNext}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
