import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check, Link2, BookOpen, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const UNIVERSITIES = [
  'TU Darmstadt',
  'TU Munich',
  'Heidelberg University',
  'Humboldt University Berlin',
  'University of Stuttgart',
  'RWTH Aachen',
  'University of Freiburg',
  'Other',
];

const FAKE_COURSES = [
  { name: 'Distributed Systems', code: 'CS-401', semester: 'WiSe 2026' },
  { name: 'Machine Learning', code: 'CS-350', semester: 'WiSe 2026' },
  { name: 'Computer Vision', code: 'CS-380', semester: 'WiSe 2026' },
  { name: 'Software Engineering', code: 'CS-210', semester: 'WiSe 2026' },
  { name: 'Data Structures & Algorithms', code: 'CS-120', semester: 'SoSe 2026' },
];

type Phase = 'select' | 'importing' | 'done';

export default function Step3_Modules() {
  const navigate = useNavigate();
  const [university, setUniversity] = useState('');
  const [phase, setPhase] = useState<Phase>('select');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleConnect = () => {
    if (!university) return;
    setPhase('importing');
    // Simulate OAuth + import delay
    setTimeout(() => setPhase('done'), 2200);
  };

  const goNext = () => navigate('/onboarding/about');

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
          Connect Your Modules
        </h1>
        <p className="text-sm text-text-secondary max-w-xs mx-auto">
          Link your university account to automatically import your enrolled courses.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {/* Phase 1: University selector */}
        {phase === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Custom dropdown */}
            <div className="relative">
              <label className="text-sm font-medium text-text-primary mb-1.5 block">
                University
              </label>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={[
                  'w-full flex items-center justify-between',
                  'bg-surface border rounded-[var(--radius-sm)] px-3 py-3',
                  'text-sm text-left cursor-pointer',
                  'transition-colors duration-150',
                  dropdownOpen ? 'border-secondary ring-2 ring-secondary/20' : 'border-border',
                ].join(' ')}
              >
                <span className={university ? 'text-text-primary' : 'text-text-secondary'}>
                  {university || 'Select your university...'}
                </span>
                <ChevronDown
                  className={[
                    'w-4 h-4 text-text-secondary transition-transform duration-200',
                    dropdownOpen && 'rotate-180',
                  ].filter(Boolean).join(' ')}
                />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.ul
                    initial={{ opacity: 0, y: -4, scaleY: 0.95 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -4, scaleY: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute z-20 mt-1 w-full bg-surface border border-border rounded-[var(--radius-sm)] shadow-lg overflow-hidden origin-top"
                  >
                    {UNIVERSITIES.map((uni) => (
                      <li key={uni}>
                        <button
                          type="button"
                          onClick={() => {
                            setUniversity(uni);
                            setDropdownOpen(false);
                          }}
                          className={[
                            'w-full text-left px-3 py-2.5 min-h-[44px] text-sm cursor-pointer',
                            'hover:bg-highlight transition-colors',
                            university === uni && 'bg-highlight font-medium text-primary',
                          ].filter(Boolean).join(' ')}
                        >
                          {uni}
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={!university}
              onClick={handleConnect}
            >
              <Link2 className="w-4 h-4" />
              Connect with Module System
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
                Connecting to {university}
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
                {FAKE_COURSES.length} courses imported from {university}
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
