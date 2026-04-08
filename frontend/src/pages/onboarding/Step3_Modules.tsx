import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, Link2, BookOpen, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const DEMO_MOODLE = {
  url: 'https://moodle.tu-darmstadt.de',
  username: 'sophie.meyer',
  password: 'LinkQ-demo-2026',
};

const FAKE_COURSES = [
  { name: 'Distributed Systems', code: 'CS-401', semester: 'WiSe 2026' },
  { name: 'Machine Learning', code: 'CS-350', semester: 'WiSe 2026' },
  { name: 'Computer Vision', code: 'CS-380', semester: 'WiSe 2026' },
  { name: 'Software Engineering', code: 'CS-210', semester: 'WiSe 2026' },
  { name: 'Data Structures & Algorithms', code: 'CS-120', semester: 'SoSe 2026' },
];

type Phase = 'login' | 'importing' | 'done';

export default function Step3_Modules() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('login');
  const [moodleUrl, setMoodleUrl] = useState(DEMO_MOODLE.url);
  const [username, setUsername] = useState(DEMO_MOODLE.username);
  const [password, setPassword] = useState(DEMO_MOODLE.password);
  const [stayLoggedIn, setStayLoggedIn] = useState(true);

  const handleConnect = () => {
    if (!moodleUrl || !username || !password) return;
    setPhase('importing');
    // Simulate Moodle login + import delay
    setTimeout(() => setPhase('done'), 2200);
  };

  const goNext = () => navigate('/onboarding/avatar');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-highlight mb-2"
        >
          <BookOpen className="w-7 h-7 text-primary" />
        </motion.div>
        <h1 className="text-2xl font-bold text-text-primary">
          Connect Moodle
        </h1>
        <p className="text-sm text-text-secondary max-w-xs mx-auto">
          Sign in to import your enrolled courses and lectures automatically.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Phase 1: Fake Moodle login */}
        {phase === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mx-auto w-full max-w-sm space-y-4"
          >
            <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm space-y-3">
              {/* Moodle-ish header */}
              <div className="flex items-center gap-3 pb-2">
                <div className="h-10 w-10 rounded-xl bg-highlight flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary leading-tight">
                    Moodle login
                  </p>
                  <p className="text-xs text-text-secondary truncate">
                    {moodleUrl.replace(/^https?:\/\//, '')}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">
                  Moodle URL
                </label>
                <input
                  value={moodleUrl}
                  onChange={(e) => setMoodleUrl(e.currentTarget.value)}
                  inputMode="url"
                  className="w-full min-h-[44px] bg-background border border-border rounded-[var(--radius-sm)] px-3 py-3 text-sm text-text-primary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">
                  Username
                </label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.currentTarget.value)}
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="username"
                  className="w-full min-h-[44px] bg-background border border-border rounded-[var(--radius-sm)] px-3 py-3 text-sm text-text-primary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">
                  Password
                </label>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  type="password"
                  autoComplete="current-password"
                  className="w-full min-h-[44px] bg-background border border-border rounded-[var(--radius-sm)] px-3 py-3 text-sm text-text-primary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <label className="flex items-center gap-2 text-xs text-text-secondary select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={stayLoggedIn}
                    onChange={(e) => setStayLoggedIn(e.currentTarget.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  Stay logged in
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-secondary hover:text-primary transition-colors"
                  onClick={() => {
                    // Fake: keep the user on the page; in real Moodle this opens a reset page.
                    setPassword('LinkQ-demo-2026');
                  }}
                >
                  Forgot password?
                </button>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed">
                Demo only. This does not access Moodle — it simulates login and imports sample courses.
              </p>
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={!moodleUrl || !username || !password}
              onClick={handleConnect}
            >
              <Link2 className="w-4 h-4" />
              Connect Moodle
            </Button>

            <button
              onClick={goNext}
              className="w-full text-center text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer py-2 min-h-[44px]"
            >
              <span className="flex items-center justify-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add courses manually instead
              </span>
            </button>
          </motion.div>
        )}

        {/* Phase 2: Importing animation */}
        {phase === 'importing' && (
          <motion.div
            key="importing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-12 gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-12 h-12 text-secondary" />
            </motion.div>
            <div className="text-center space-y-1">
              <p className="text-lg font-semibold text-text-primary">
                Importing your courses...
              </p>
              <p className="text-sm text-text-secondary">
                Signing in to Moodle
              </p>
            </div>

            {/* Fake progress dots */}
            <div className="flex gap-1.5 mt-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-secondary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Phase 3: Course list */}
        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                className="w-6 h-6 rounded-full bg-success flex items-center justify-center"
              >
                <Check className="w-3.5 h-3.5 text-white" />
              </motion.div>
              <p className="text-sm font-medium text-success">
                {FAKE_COURSES.length} courses imported from Moodle
              </p>
            </div>

            <div className="space-y-2">
              {FAKE_COURSES.map((course, i) => (
                <motion.div
                  key={course.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3 p-3 bg-surface rounded-[var(--radius-sm)] border border-border"
                >
                  <div className="w-8 h-8 rounded-full bg-highlight flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {course.name}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {course.code} &middot; {course.semester}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Continue (only shown when done) */}
      {phase === 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="sticky bottom-0 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent"
        >
          <Button size="lg" className="w-full" onClick={goNext}>
            Continue
          </Button>
        </motion.div>
      )}
    </div>
  );
}
