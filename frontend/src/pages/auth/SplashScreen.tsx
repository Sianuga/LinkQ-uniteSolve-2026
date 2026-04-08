import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerChildren = {
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function SplashScreen() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-dvh overflow-hidden pb-safe">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(135deg, #1E3A8A, #3B82F6, #93C5FD, #1E3A8A)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 8s ease infinite',
        }}
      />

      {/* Subtle floating orbs for depth */}
      <div
        className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #93C5FD, transparent)',
          animation: 'float 6s ease-in-out infinite',
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full opacity-15 blur-3xl"
        style={{
          background: 'radial-gradient(circle, #FFFFFF, transparent)',
          animation: 'float 8s ease-in-out infinite reverse',
        }}
      />

      {/* Content */}
      <motion.div
        className="relative flex min-h-dvh flex-col items-center justify-center px-6"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex w-full max-w-md flex-col items-center text-center"
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
        >
          {/* Logo / App name */}
          <motion.div variants={childVariants} className="mb-4">
            <h1 className="text-6xl font-extrabold tracking-tight text-white sm:text-7xl">
              Link
              <span className="text-accent">Q</span>
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p
            variants={childVariants}
            className="mb-16 text-lg font-medium text-white/80 sm:text-xl"
          >
            Turn your calendar into your network
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={childVariants} className="flex w-full flex-col gap-3">
            <Button
              size="lg"
              className="w-full bg-white text-primary font-bold hover:bg-white/90 active:bg-white/80"
              onClick={() => navigate('/register')}
            >
              Get Started
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 active:bg-white/15"
              onClick={() => navigate('/login')}
            >
              I have an account
            </Button>
          </motion.div>

          {/* Footer hint */}
          <motion.p
            variants={childVariants}
            className="mt-12 text-xs text-white/50"
          >
            Built for students, by students
          </motion.p>
        </motion.div>
      </motion.div>

      {/* CSS animation keyframes */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}
