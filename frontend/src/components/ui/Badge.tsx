type BadgeVariant = 'primary' | 'error';

interface BadgeProps {
  count: number;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary text-white',
  error: 'bg-error text-white',
};

export function Badge({ count, variant = 'error', className = '' }: BadgeProps) {
  if (count <= 0) return null;

  const display = count > 99 ? '99+' : String(count);

  return (
    <span
      className={[
        'absolute -top-1.5 -right-1.5 z-10',
        'inline-flex items-center justify-center',
        'min-w-[18px] h-[18px] px-1',
        'rounded-full text-[10px] font-bold leading-none',
        'ring-2 ring-surface',
        variantStyles[variant],
        className,
      ].join(' ')}
      aria-label={`${count} notifications`}
    >
      {display}
    </span>
  );
}
