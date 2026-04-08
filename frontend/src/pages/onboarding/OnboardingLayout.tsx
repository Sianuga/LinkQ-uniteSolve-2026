import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';

const STEP_ROUTES = [
  '/onboarding/verify',
  '/onboarding/avatar',
  '/onboarding/modules',
  '/onboarding/about',
  '/onboarding/preferences',
  '/onboarding/events',
] as const;

function getStepIndex(pathname: string): number {
  const idx = STEP_ROUTES.findIndex((r) => pathname.startsWith(r));
  return idx === -1 ? 0 : idx;
}

export default function OnboardingLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const stepIndex = getStepIndex(location.pathname);
  const stepNumber = stepIndex + 1;
  const totalSteps = STEP_ROUTES.length;
  const progress = (stepNumber / totalSteps) * 100;
  const isFirstStep = stepIndex === 0;

  const handleBack = () => {
    if (!isFirstStep) {
      navigate(STEP_ROUTES[stepIndex - 1]);
    }
  };

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-lg mx-auto px-4 pt-3 pb-2">
          {/* Step indicator + back */}
          <div className="flex items-center gap-3 mb-2">
            {!isFirstStep ? (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleBack}
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-highlight transition-colors cursor-pointer"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-text-primary" />
              </motion.button>
            ) : (
              <div className="w-8" />
            )}

            <div className="flex-1 text-center">
              <span className="text-xs font-semibold text-text-secondary tracking-wide uppercase">
                Step {stepNumber} of {totalSteps}
              </span>
            </div>

            <div className="w-8" />
          </div>

          {/* Progress bar */}
          <ProgressBar value={progress} label={`Onboarding step ${stepNumber} of ${totalSteps}`} />
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
