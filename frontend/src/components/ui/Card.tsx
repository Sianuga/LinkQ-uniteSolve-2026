import type { HTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = '', onClick, ...rest }: CardProps) {
  const isClickable = !!onClick;

  return (
    <motion.div
      whileHover={isClickable ? { y: -2 } : undefined}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={[
        'bg-surface rounded-[var(--radius-lg)] p-4',
        'shadow-md',
        'max-w-full overflow-hidden',
        isClickable && 'cursor-pointer select-none',
        'transition-shadow duration-150',
        isClickable && 'hover:shadow-lg',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...(rest as React.ComponentPropsWithoutRef<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
}
