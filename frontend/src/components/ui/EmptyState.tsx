import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={[
        'flex flex-col items-center justify-center text-center',
        'py-12 px-6',
        className,
      ].join(' ')}
    >
      <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full bg-highlight">
        <Icon className="h-8 w-8 text-secondary" />
      </div>

      <h3 className="text-base font-semibold text-text-primary mb-1">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-text-secondary max-w-[280px] mb-5">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
