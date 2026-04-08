import { motion } from 'framer-motion';

interface ProgressBarProps {
  /** Value between 0 and 100. */
  value: number;
  /** Whether to animate the fill on mount. Defaults to true. */
  animated?: boolean;
  /** Optional CSS class for the outer track. */
  className?: string;
  /** Optional label for accessibility. */
  label?: string;
}

export function ProgressBar({
  value,
  animated = true,
  className = '',
  label,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      className={[
        'w-full h-1 bg-border rounded-full overflow-hidden',
        className,
      ].join(' ')}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <motion.div
        className="h-full bg-primary rounded-full"
        initial={animated ? { width: 0 } : { width: `${clamped}%` }}
        animate={{ width: `${clamped}%` }}
        transition={
          animated
            ? { duration: 0.6, ease: 'easeOut' }
            : { duration: 0 }
        }
      />
    </div>
  );
}
