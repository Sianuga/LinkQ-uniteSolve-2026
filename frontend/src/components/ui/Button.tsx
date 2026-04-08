import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:brightness-110 active:brightness-95',
  secondary:
    'bg-surface text-text-primary border border-border hover:bg-highlight active:bg-border',
  danger:
    'bg-error text-white hover:brightness-110 active:brightness-95',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 text-sm min-h-[44px]',
  md: 'px-4 py-3 text-sm min-h-[44px]',
  lg: 'px-6 py-3.5 text-base min-h-[52px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold',
        'rounded-[var(--radius-md)] cursor-pointer',
        'transition-colors duration-100 ease-out',
        'select-none outline-none',
        'focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2',
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...(rest as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {children}
    </motion.button>
  );
}
