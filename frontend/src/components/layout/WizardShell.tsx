import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

interface WizardShellProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  children: ReactNode;
}

export function WizardShell({
  currentStep,
  totalSteps,
  onBack,
  children,
}: WizardShellProps) {
  const progress = currentStep / totalSteps;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-surface px-4 pb-3 pt-4">
        <div className="flex items-center gap-3">
          {/* Back button (hidden on step 1) */}
          {currentStep > 1 && onBack ? (
            <button
              onClick={onBack}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-highlight"
              aria-label="Go back"
            >
              <ArrowLeft size={20} />
            </button>
          ) : (
            <div className="w-9 shrink-0" />
          )}

          {/* Step fraction */}
          <span className="text-sm font-semibold text-text-secondary">
            {currentStep}/{totalSteps}
          </span>

          {/* Spacer */}
          <div className="flex-1" />
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* Content area */}
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
