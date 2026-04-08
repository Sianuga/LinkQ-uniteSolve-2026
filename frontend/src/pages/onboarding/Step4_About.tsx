import { useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Heart, Wrench, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tag } from '@/components/ui/Tag';

/* ------------------------------------------------------------------ */
/*  Pre-built tag options                                              */
/* ------------------------------------------------------------------ */

const HOBBY_OPTIONS = [
  'Photography', 'Gaming', 'Cooking', 'Reading', 'Hiking', 'Music',
  'Drawing', 'Yoga', 'Climbing', 'Movies', 'Gardening', 'Cycling',
];

const TOPIC_OPTIONS = [
  'AI Ethics', 'Open Source', 'Startups', 'Climate Tech', 'Blockchain',
  'UX Design', 'Robotics', 'Space', 'Neuroscience', 'Philosophy',
];

const SPORT_OPTIONS = [
  'Badminton', 'Football', 'Basketball', 'Swimming', 'Tennis',
  'Running', 'Volleyball', 'Table Tennis', 'Martial Arts',
];

const PROGRAMMING_OPTIONS = [
  'Python', 'TypeScript', 'JavaScript', 'Java', 'C++', 'Rust',
  'Go', 'Swift', 'Kotlin', 'C#', 'Ruby', 'PHP', 'R', 'Scala',
];

const LANGUAGE_OPTIONS = [
  'English', 'German', 'Spanish', 'French', 'Mandarin', 'Japanese',
  'Korean', 'Arabic', 'Hindi', 'Polish', 'Turkish', 'Italian',
];

const TOOL_OPTIONS = [
  'Docker', 'Kubernetes', 'Git', 'VS Code', 'Figma', 'AWS',
  'Linux', 'React', 'Node.js', 'PostgreSQL', 'MongoDB', 'Terraform',
];

const LEARNING_OPTIONS = [
  'Rust', 'System Design', 'ML Engineering', 'DevOps', 'Mobile Dev',
  'UI/UX', 'Data Science', 'Cloud Computing', 'Cybersecurity',
];

const PROGRAMS = [
  'B.Sc. Computer Science',
  'M.Sc. Computer Science',
  'B.Sc. Data Science',
  'M.Sc. Data Science',
  'B.Sc. Electrical Engineering',
  'M.Sc. Electrical Engineering',
  'B.Sc. Mathematics',
  'M.Sc. Mathematics',
  'B.Sc. Physics',
  'M.Sc. Physics',
  'B.Sc. Business Informatics',
  'Other',
];

/* ------------------------------------------------------------------ */
/*  Tab definitions                                                    */
/* ------------------------------------------------------------------ */

type TabId = 'profile' | 'interests' | 'skills' | 'goals';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDef[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'interests', label: 'Interests', icon: <Heart className="w-4 h-4" /> },
  { id: 'skills', label: 'Skills', icon: <Wrench className="w-4 h-4" /> },
  { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> },
];

/* ------------------------------------------------------------------ */
/*  TagPicker component                                                */
/* ------------------------------------------------------------------ */

function TagPicker({
  label,
  options,
  selected,
  onToggle,
  onAddCustom,
  placeholder,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (tag: string) => void;
  onAddCustom?: (tag: string) => void;
  placeholder?: string;
}) {
  const [customInput, setCustomInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && customInput.trim() && onAddCustom) {
      e.preventDefault();
      onAddCustom(customInput.trim());
      setCustomInput('');
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {options.map((option) => (
            <Tag
              key={option}
              label={option}
              selected={selected.includes(option)}
              onClick={() => onToggle(option)}
            />
          ))}
          {/* Custom tags not in options */}
          {selected
            .filter((t) => !options.includes(t))
            .map((tag) => (
              <Tag
                key={tag}
                label={tag}
                selected
                onRemove={() => onToggle(tag)}
              />
            ))}
        </AnimatePresence>
      </div>
      {onAddCustom && (
        <input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? 'Type and press Enter to add...'}
          className="w-full bg-surface border border-border rounded-[var(--radius-sm)] px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors"
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function Step4_About() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  // Profile state
  const [name, setName] = useState('');
  const [program, setProgram] = useState('');
  const [semester, setSemester] = useState('');

  // Interests state
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [sports, setSports] = useState<string[]>([]);
  const [aboutMe, setAboutMe] = useState('');

  // Skills state
  const [programming, setProgramming] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);

  // Goals state
  const [learning, setLearning] = useState<string[]>([]);
  const [career, setCareer] = useState('');
  const [hereTo, setHereTo] = useState('');

  /* ---- Helpers ---- */

  const toggleTag = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    tag: string,
  ) => {
    setList(list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]);
  };

  const addCustomTag = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    tag: string,
  ) => {
    if (!list.includes(tag)) {
      setList([...list, tag]);
    }
  };

  /* ---- Completion check ---- */

  const profileFilled = name.trim().length > 0 && program.length > 0 && semester.length > 0;
  const interestsFilled = hobbies.length > 0 || topics.length > 0 || sports.length > 0;
  const skillsFilled = programming.length > 0 || languages.length > 0 || tools.length > 0;
  const goalsFilled = learning.length > 0 || career.trim().length > 0;

  const tabCompletions: Record<TabId, boolean> = {
    profile: profileFilled,
    interests: interestsFilled,
    skills: skillsFilled,
    goals: goalsFilled,
  };

  const otherTabsFilled = interestsFilled || skillsFilled || goalsFilled;
  const canContinue = profileFilled && otherTabsFilled;

  const goNext = () => {
    if (canContinue) {
      navigate('/onboarding/preferences');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center space-y-2 mb-4">
        <h1 className="text-2xl font-bold text-text-primary">About You</h1>
        <p className="text-sm text-text-secondary">
          Tell us about yourself so we can find your perfect matches.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-surface rounded-[var(--radius-md)] border border-border mb-5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'relative flex-1 flex items-center justify-center gap-1.5 py-2 px-1 rounded-[var(--radius-sm)]',
              'text-xs font-medium transition-all duration-200 cursor-pointer',
              activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-highlight',
            ].join(' ')}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
            {/* Completion dot */}
            {tabCompletions[tab.id] && activeTab !== tab.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-success"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />

              {/* Program dropdown */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Program</label>
                <select
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  className={[
                    'w-full bg-surface border border-border rounded-[var(--radius-sm)] px-3 py-3',
                    'text-sm outline-none cursor-pointer',
                    'focus:border-secondary focus:ring-2 focus:ring-secondary/20',
                    'transition-colors duration-150',
                    !program && 'text-text-secondary',
                  ].filter(Boolean).join(' ')}
                >
                  <option value="" disabled>Select your program...</option>
                  {PROGRAMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Semester"
                type="number"
                min={1}
                max={20}
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. 3"
              />
            </motion.div>
          )}

          {activeTab === 'interests' && (
            <motion.div
              key="interests"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <TagPicker
                label="Hobbies"
                options={HOBBY_OPTIONS}
                selected={hobbies}
                onToggle={(t) => toggleTag(hobbies, setHobbies, t)}
                onAddCustom={(t) => addCustomTag(hobbies, setHobbies, t)}
                placeholder="Add a custom hobby..."
              />
              <TagPicker
                label="Topics You Follow"
                options={TOPIC_OPTIONS}
                selected={topics}
                onToggle={(t) => toggleTag(topics, setTopics, t)}
                onAddCustom={(t) => addCustomTag(topics, setTopics, t)}
                placeholder="Add a topic..."
              />
              <TagPicker
                label="Sports"
                options={SPORT_OPTIONS}
                selected={sports}
                onToggle={(t) => toggleTag(sports, setSports, t)}
                onAddCustom={(t) => addCustomTag(sports, setSports, t)}
                placeholder="Add a sport..."
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">About Me</label>
                <textarea
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  placeholder="Tell people something fun or interesting about you..."
                  rows={3}
                  className="w-full bg-surface border border-border rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors resize-none"
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <TagPicker
                label="Programming Languages"
                options={PROGRAMMING_OPTIONS}
                selected={programming}
                onToggle={(t) => toggleTag(programming, setProgramming, t)}
                onAddCustom={(t) => addCustomTag(programming, setProgramming, t)}
                placeholder="Add a language..."
              />
              <TagPicker
                label="Spoken Languages"
                options={LANGUAGE_OPTIONS}
                selected={languages}
                onToggle={(t) => toggleTag(languages, setLanguages, t)}
                onAddCustom={(t) => addCustomTag(languages, setLanguages, t)}
                placeholder="Add a language..."
              />
              <TagPicker
                label="Tools & Frameworks"
                options={TOOL_OPTIONS}
                selected={tools}
                onToggle={(t) => toggleTag(tools, setTools, t)}
                onAddCustom={(t) => addCustomTag(tools, setTools, t)}
                placeholder="Add a tool..."
              />
            </motion.div>
          )}

          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <TagPicker
                label="I'm Learning..."
                options={LEARNING_OPTIONS}
                selected={learning}
                onToggle={(t) => toggleTag(learning, setLearning, t)}
                onAddCustom={(t) => addCustomTag(learning, setLearning, t)}
                placeholder="Add something you're learning..."
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Career Direction</label>
                <Input
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  placeholder="e.g. ML engineering, frontend development..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">I'm here to...</label>
                <textarea
                  value={hereTo}
                  onChange={(e) => setHereTo(e.target.value)}
                  placeholder="e.g. meet people in my courses and find study partners..."
                  rows={3}
                  className="w-full bg-surface border border-border rounded-[var(--radius-sm)] px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors resize-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Continue */}
      <div className="sticky bottom-0 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent">
        {!canContinue && (
          <p className="text-xs text-text-secondary text-center mb-2">
            Fill out Profile + at least one other tab to continue
          </p>
        )}
        <Button
          size="lg"
          className="w-full"
          disabled={!canContinue}
          onClick={goNext}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}
