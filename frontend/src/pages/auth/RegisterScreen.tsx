import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types';

// ---------------------------------------------------------------------------
// Validation schema (Zod v4)
// ---------------------------------------------------------------------------
const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(64, 'Name is too long'),
  email: z
    .string()
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password needs at least one uppercase letter')
    .regex(/[0-9]/, 'Password needs at least one number'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function RegisterScreen() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    // Set demo token
    setToken('demo-token');

    // Create mock user with onboarding_complete: false
    const mockUser: User = {
      id: 'user_new_' + Date.now(),
      name: data.name,
      email: data.email,
      university: '',
      program: '',
      semester: 1,
      avatar: 'mystery_silhouette',
      onboarding_complete: false,
      academic: { courses: [], degree: '' },
      interests: { hobbies: [], topics: [] },
      skills: { programming: [], languages: [], tools: [] },
      goals: { learning: [], career: '', short_term: '' },
      availability: { preferred_times: [], study_style: 'solo', timezone: 'CET' },
      events: { attended: [], interested: [], categories: [] },
    };
    setUser(mockUser);

    navigate('/onboarding/verify');
  };

  return (
    <motion.div
      className="flex min-h-dvh flex-col bg-background overflow-x-hidden"
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

      {/* Form area */}
      <div className="flex flex-1 flex-col justify-center px-6 pb-8 pb-safe">
        <div className="mx-auto w-full max-w-md">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Join LinkQ and start connecting with fellow students
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Akira Tanaka"
                className={inputClass(!!errors.name)}
                {...register('name')}
              />
              {errors.name && <FieldError message={errors.name.message} />}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                University email
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

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-text-primary"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  className={inputClass(!!errors.password, 'pr-11')}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary transition-colors hover:text-text-primary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && <FieldError message={errors.password.message} />}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              loading={isSubmitting}
              className="mt-2 w-full"
            >
              Create Account
            </Button>
          </form>

          {/* Footer link */}
          <p className="mt-8 text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary transition-colors hover:text-secondary"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function inputClass(hasError: boolean, extra = '') {
  return [
    'block w-full rounded-[var(--radius-md)] border bg-surface px-4 py-3 text-base text-text-primary',
    'placeholder:text-text-secondary/60',
    'outline-none transition-colors duration-150',
    'focus:border-secondary focus:ring-2 focus:ring-secondary/30',
    hasError
      ? 'border-error focus:border-error focus:ring-error/30'
      : 'border-border',
    extra,
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
