import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface MatchRingProps {
  /** Match percentage 0-100 */
  score: number;
  /** Diameter in px (default 120) */
  size?: number;
  /** Stroke width in px (default 8) */
  strokeWidth?: number;
  /** Custom class name */
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MatchRing({
  score,
  size = 120,
  strokeWidth = 8,
  className = '',
}: MatchRingProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Animated number counter
  const motionScore = useMotionValue(0);
  const displayScore = useTransform(motionScore, (v) => Math.round(v));

  // Animated stroke offset
  const motionOffset = useMotionValue(circumference);

  useEffect(() => {
    const targetOffset = circumference - (clampedScore / 100) * circumference;

    const scoreAnim = animate(motionScore, clampedScore, {
      duration: 0.8,
      type: 'spring',
      stiffness: 400,
      damping: 30,
    });

    const offsetAnim = animate(motionOffset, targetOffset, {
      duration: 0.8,
      type: 'spring',
      stiffness: 400,
      damping: 30,
    });

    return () => {
      scoreAnim.stop();
      offsetAnim.stop();
    };
  }, [clampedScore, circumference, motionScore, motionOffset]);

  // Color based on score
  const getColor = (s: number): string => {
    if (s >= 80) return '#10B981'; // emerald-500 (great match)
    if (s >= 60) return '#3B82F6'; // blue-500 (good match)
    if (s >= 40) return '#F59E0B'; // amber-500 (moderate)
    return '#EF4444'; // red-500 (low)
  };

  const strokeColor = getColor(clampedScore);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />

        {/* Animated fill arc */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: motionOffset }}
        />
      </svg>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-2xl font-bold leading-none text-gray-900"
          style={{ fontSize: size * 0.22 }}
        >
          {displayScore}
        </motion.span>
        <span
          className="mt-0.5 font-medium text-gray-400"
          style={{ fontSize: size * 0.1 }}
        >
          % match
        </span>
      </div>
    </div>
  );
}

export default MatchRing;
