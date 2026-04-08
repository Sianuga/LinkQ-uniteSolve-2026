import { X } from 'lucide-react';
import { motion } from 'framer-motion';

interface TagProps {
  label: string;
  selected?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  className?: string;
}

export function Tag({
  label,
  selected = false,
  onRemove,
  onClick,
  className = '',
}: TagProps) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={[
        'inline-flex items-center gap-1.5',
        'px-2.5 py-1 rounded-full text-xs font-medium',
        'transition-colors duration-150 select-none',
        selected
          ? 'bg-primary text-white'
          : 'bg-highlight text-primary',
        onClick && 'cursor-pointer hover:brightness-95',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="truncate max-w-[160px]">{label}</span>

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className={[
            'inline-flex items-center justify-center',
            'rounded-full p-0.5 -mr-0.5',
            'transition-colors duration-100 cursor-pointer',
            selected
              ? 'hover:bg-white/20'
              : 'hover:bg-primary/10',
          ].join(' ')}
          aria-label={`Remove ${label}`}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </motion.span>
  );
}
