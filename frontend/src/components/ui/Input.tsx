import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', wrapperClassName = '', id, ...rest }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={['flex flex-col gap-1.5', wrapperClassName].join(' ')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            className={[
              'w-full bg-surface text-text-primary placeholder:text-text-secondary',
              'border rounded-[var(--radius-sm)] px-3 py-3',
              'text-base leading-5 outline-none',
              'transition-colors duration-150',
              icon && 'pl-10',
              error
                ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
                : 'border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20',
              'disabled:bg-disabled/20 disabled:cursor-not-allowed disabled:text-text-secondary',
              className,
            ]
              .filter(Boolean)
              .join(' ')}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error && inputId ? `${inputId}-error` : undefined}
            {...rest}
          />
        </div>

        {error && (
          <p
            id={inputId ? `${inputId}-error` : undefined}
            className="text-xs font-medium text-error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
