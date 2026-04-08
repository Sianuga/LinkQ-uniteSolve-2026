import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const successVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ForgotPasswordScreen() {
  const navigate = useNavigate();
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1000));
    setSentEmail(data.email);
    setSent(true);
  };

  return (
    <motion.div
      className="flex min-h-dvh flex-col bg-background"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-safe-top h-14">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-highlight"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-center px-6 pb-8">
        <div className="mx-auto w-full max-w-md">
          <AnimatePresence mode="wait">
            {!sent ? (
              /* ---------- Form state ---------- */
              <motion.div
                key="form"
                variants={successVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Icon */}
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-highlight">
                  <Mail className="h-7 w-7 text-primary" />
                </div>

                {/* Heading */}
                <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
                  Reset your password
                </h1>
                <p className="mt-2 mb-8 text-sm text-text-secondary">
                  Enter the email address you used to register and we'll send you a
                  link to reset your password.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-1.5 block text-sm font-medium text-text-primary"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@university.edu"
                      className={inputClass(!!errors.email)}
                      {...register('email')}
                    />
                    {errors.email && <FieldError message={errors.email.message} />}
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    loading={isSubmitting}
                    className="w-full"
                  >
                    Send Reset Link
                  </Button>
                </form>

                {/* Back to login */}
                <p className="mt-8 text-center text-sm text-text-secondary">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-primary transition-colors hover:text-secondary"
                  >
                    Log in
                  </Link>
                </p>
              </motion.div>
            ) : (
              /* ---------- Success state ---------- */
              <motion.div
                key="success"
                variants={successVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col items-center text-center"
              >
                {/* Success icon */}
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>

                <h1 className="text-2xl font-bold text-text-primary">
                  Check your email
                </h1>
                <p className="mt-3 text-sm text-text-secondary leading-relaxed">
                  We've sent a password reset link to{' '}
                  <span className="font-semibold text-text-primary">{sentEmail}</span>.
                  <br />
                  It may take a minute to arrive. Check your spam folder if you
                  don't see it.
                </p>

                {/* Actions */}
                <div className="mt-8 flex w-full flex-col gap-3">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => navigate('/login')}
                  >
                    Back to Log In
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={() => {
                      setSent(false);
                      setSentEmail('');
                    }}
                  >
                    Didn't receive it? Try again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function inputClass(hasError: boolean) {
  return [
    'block w-full rounded-[var(--radius-md)] border bg-surface px-4 py-3 text-sm text-text-primary',
    'placeholder:text-text-secondary/60',
    'outline-none transition-colors duration-150',
    'focus:border-secondary focus:ring-2 focus:ring-secondary/30',
    hasError
      ? 'border-error focus:border-error focus:ring-error/30'
      : 'border-border',
  ]
    .filter(Boolean)
    .join(' ');
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-1.5 text-xs text-error"
    >
      {message}
    </motion.p>
  );
}
