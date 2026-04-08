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
// Validation schema
// ---------------------------------------------------------------------------
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Demo data
// ---------------------------------------------------------------------------
const DEMO_EMAIL = 'demo@tu-darmstadt.de';

const demoUser: User = {
  id: 'user_demo_001',
  name: 'Akira Tanaka',
  email: DEMO_EMAIL,
  university: 'TU Darmstadt',
  program: 'M.Sc. Computer Science',
  semester: 3,
  avatar: 'banana_guy',
  onboarding_complete: true,
  bio: 'International CS student from Tokyo. Love distributed systems and climbing.',
  academic: {
    courses: ['Distributed Systems', 'Machine Learning', 'Computer Vision'],
    degree: 'M.Sc. Computer Science',
    thesis_topic: 'Federated Learning for Edge Devices',
  },
  interests: {
    hobbies: ['climbing', 'photography', 'cooking'],
    topics: ['AI ethics', 'open source', 'sustainability'],
    music: 'j-pop',
    sports: 'badminton',
  },
  skills: {
    programming: ['Python', 'TypeScript', 'Go'],
    languages: ['English', 'German', 'Japanese'],
    tools: ['Docker', 'Kubernetes', 'PyTorch'],
  },
  goals: {
    learning: ['Rust', 'system design'],
    career: 'ML Engineering',
    short_term: 'Find study group for exam prep',
    here_to: 'Meet people in my courses and find study partners',
  },
  availability: {
    preferred_times: ['evenings', 'weekends'],
    study_style: 'pair',
    timezone: 'CET',
  },
  events: {
    attended: ['event_001', 'event_002'],
    interested: ['event_003'],
    categories: ['hackathon', 'seminar'],
  },
};

function createFreshUser(email: string): User {
  return {
    id: 'user_' + Date.now(),
    name: '',
    email,
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
}

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
export function LoginScreen() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    setToken('demo-token');

    const isDemo = data.email.toLowerCase() === DEMO_EMAIL;
    const user = isDemo ? demoUser : createFreshUser(data.email);
    setUser(user);

    // Route based on onboarding status
    if (user.onboarding_complete) {
      navigate('/home', { replace: true });
    } else {
      navigate('/onboarding/verify', { replace: true });
    }
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

      {/* Form area */}
      <div className="flex flex-1 flex-col justify-center px-6 pb-8">
        <div className="mx-auto w-full max-w-md">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Sign in to continue where you left off
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
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
                  autoComplete="current-password"
                  placeholder="Enter your password"
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

            {/* Forgot password link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary transition-colors hover:text-secondary"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              loading={isSubmitting}
              className="w-full"
            >
              Log In
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 rounded-[var(--radius-md)] border border-border bg-highlight px-4 py-3">
            <p className="text-xs text-text-secondary">
              <span className="font-semibold text-text-primary">Demo mode:</span>{' '}
              Sign in with{' '}
              <span className="font-mono text-primary">{DEMO_EMAIL}</span>{' '}
              and any password to see a complete profile.
            </p>
          </div>

          {/* Footer link */}
          <p className="mt-8 text-center text-sm text-text-secondary">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary transition-colors hover:text-secondary"
            >
              Sign up
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
    'block w-full rounded-[var(--radius-md)] border bg-surface px-4 py-3 text-sm text-text-primary',
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
