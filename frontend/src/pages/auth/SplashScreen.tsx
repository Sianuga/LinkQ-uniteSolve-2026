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
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary pb-safe">
      {/* Background: blue gradient + subtle grid + glow */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(1200px 600px at 20% 10%, rgba(59,130,246,0.35), transparent 55%), radial-gradient(900px 600px at 80% 30%, rgba(147,197,253,0.20), transparent 60%), radial-gradient(900px 700px at 50% 100%, rgba(30,58,138,0.35), transparent 55%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage: 'radial-gradient(circle at 50% 40%, black, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 40%, black, transparent 70%)',
          }}
        />
      </div>

      <motion.div
        className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
        >
          {/* Logo / App name */}
          <motion.div variants={childVariants} className="mb-4">
            <h1 className="text-6xl font-extrabold tracking-tight text-white sm:text-7xl">
              Nex
              <span className="text-accent">us</span>
            </h1>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={childVariants}
            className="text-left text-3xl font-semibold leading-tight tracking-tight text-white"
          >
            Turn campus events into real connections.
          </motion.h1>

          <motion.p
            variants={childVariants}
            className="mt-2 text-left text-sm leading-relaxed text-white/70"
          >
            See who’s attending, connect before you show up, and find study partners based on shared courses and interests.
          </motion.p>

          {/* Feature bullets */}
          <motion.ul
            variants={childVariants}
            className="mt-5 space-y-2 text-left text-sm text-white/70"
          >
            <li className="flex gap-3">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              <span>Browse events and participants, instantly.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              <span>Match by academic context, not random bios.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              <span>Join or create study groups for your next event.</span>
            </li>
          </motion.ul>

          {/* CTAs */}
          <motion.div variants={childVariants} className="mt-6 flex flex-col gap-3">
            <Button
              size="lg"
              className="w-full bg-white text-primary font-semibold hover:bg-white/90 active:bg-white/80"
              onClick={() => navigate('/register')}
            >
              Create account
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full border-white/15 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10 active:bg-white/5"
              onClick={() => navigate('/login')}
            >
              I have an account
            </Button>
          </motion.div>

          <motion.div variants={childVariants} className="mt-6 flex items-center justify-between">
            <p className="text-xs text-white/45">Built for students, by students</p>
            <button
              type="button"
              className="text-xs font-medium text-white/70 underline decoration-white/30 underline-offset-4 hover:text-white"
              onClick={() => navigate('/login')}
            >
              Use demo account
            </button>
          </motion.div>
        </motion.div>

        {/* Bottom safe-area spacing / subtle hint */}
        <motion.p variants={childVariants} className="mt-4 text-center text-[11px] text-white/35">
          Tip: use “demo@tu-darmstadt.de” with any password.
        </motion.p>
      </motion.div>
    </div>
  );
}
