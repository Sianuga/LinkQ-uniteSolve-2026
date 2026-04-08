import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Heart, Wrench, Target, Camera, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tag } from '@/components/ui/Tag';
import { useAuthStore } from '@/store/authStore';

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
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm space-y-3">
      <div className="flex items-start justify-between gap-3">
        <label className="text-sm font-semibold text-text-primary">{label}</label>
        <span className="text-xs text-text-secondary">
          {selected.length > 0 ? `${selected.length} selected` : 'Pick a few'}
        </span>
      </div>

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
        <div className="space-y-1">
          <p className="text-xs text-text-secondary">Add your own</p>
          <input
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder ?? 'Type and press Enter to add...'}
            className="w-full min-h-[44px] bg-background border border-border rounded-[var(--radius-sm)] px-3 py-2.5 text-base text-text-primary placeholder:text-text-secondary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors"
          />
        </div>
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
  const user = useAuthStore((s) => s.user);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  // Profile state
  const [nickname, setNickname] = useState('');
  const [photoName, setPhotoName] = useState('');

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

  const profileFilled = nickname.trim().length > 0;
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

  const studentSummary = useMemo(() => {
    const program = user?.program?.trim() || '';
    const semester = typeof user?.semester === 'number' && user.semester > 0 ? String(user.semester) : '';
    return {
      program: program || 'Imported from Student ID',
      semester: semester || 'Imported from Student ID',
    };
  }, [user?.program, user?.semester]);

  const goNext = () => {
    if (canContinue) {
      navigate('/onboarding/preferences');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center space-y-2 mb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-highlight mx-auto">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary">About You</h1>
        <p className="text-sm text-text-secondary max-w-sm mx-auto">
          A few details go a long way. This helps matches feel natural, not random.
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-5 -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                'relative shrink-0 inline-flex items-center gap-2 min-h-[44px] px-3 rounded-full',
                'text-sm font-semibold transition-all duration-200 cursor-pointer',
                'border',
                activeTab === tab.id
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-surface text-text-primary border-border hover:bg-highlight',
              ].join(' ')}
            >
              <span className={activeTab === tab.id ? 'text-white' : 'text-text-secondary'}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {tabCompletions[tab.id] && (
                <span
                  className={[
                    'ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold',
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-success text-white',
                  ].join(' ')}
                  aria-label={`${tab.label} completed`}
                >
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto pb-6">
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
              <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="h-14 w-14 rounded-2xl bg-highlight border border-border flex items-center justify-center">
                      <Camera className="h-6 w-6 text-text-secondary" />
                    </div>
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md"
                      aria-label="Add photo"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary">Your public profile</p>
                    <p className="mt-0.5 text-xs text-text-secondary">
                      Use a nickname — it’s what people see in events. Photo is optional.
                    </p>
                  </div>
                </div>

                <Input
                  label="Nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Sophie, Alex, Kenji…"
                />

                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={(e) => setPhotoName(e.currentTarget.files?.[0]?.name ?? '')}
                />
                {photoName ? (
                  <p className="text-xs text-text-secondary">
                    Photo selected: <span className="font-medium text-text-primary">{photoName}</span>
                  </p>
                ) : null}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-[var(--radius-md)] border border-border bg-background p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">Program</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">{studentSummary.program}</p>
                  </div>
                  <div className="rounded-[var(--radius-md)] border border-border bg-background p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-text-secondary">Semester</p>
                    <p className="mt-1 text-sm font-semibold text-text-primary">{studentSummary.semester}</p>
                  </div>
                </div>
              </div>
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
              <div className="rounded-[var(--radius-lg)] border border-border bg-highlight p-4">
                <p className="text-sm font-semibold text-text-primary">Make it easy to start a conversation</p>
                <p className="mt-1 text-xs text-text-secondary">
                  Pick a few interests — you’ll get better matches and better openers.
                </p>
              </div>
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

              <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm space-y-2">
                <label className="text-sm font-semibold text-text-primary">About me</label>
                <textarea
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  placeholder="One line is enough. Example: “New to Darmstadt, looking for a DS study group.”"
                  rows={4}
                  className="w-full bg-background border border-border rounded-[var(--radius-sm)] px-3 py-2.5 text-base text-text-primary placeholder:text-text-secondary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors resize-none"
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
              <div className="rounded-[var(--radius-lg)] border border-border bg-highlight p-4">
                <p className="text-sm font-semibold text-text-primary">Find people who complement you</p>
                <p className="mt-1 text-xs text-text-secondary">
                  Add skills to match with people who share tools — or bring what you’re missing.
                </p>
              </div>
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
              <div className="rounded-[var(--radius-lg)] border border-border bg-highlight p-4">
                <p className="text-sm font-semibold text-text-primary">Make your intent clear</p>
                <p className="mt-1 text-xs text-text-secondary">
                  Goals help us match you with the right kind of study partners.
                </p>
              </div>
              <TagPicker
                label="I'm Learning..."
                options={LEARNING_OPTIONS}
                selected={learning}
                onToggle={(t) => toggleTag(learning, setLearning, t)}
                onAddCustom={(t) => addCustomTag(learning, setLearning, t)}
                placeholder="Add something you're learning..."
              />

              <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm space-y-2">
                <label className="text-sm font-semibold text-text-primary">Career direction</label>
                <Input
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  placeholder="e.g. ML engineer, frontend developer…"
                />
              </div>

              <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm space-y-2">
                <label className="text-sm font-semibold text-text-primary">I’m here to…</label>
                <textarea
                  value={hereTo}
                  onChange={(e) => setHereTo(e.target.value)}
                  placeholder="Example: “Find a study buddy for the next assignment.”"
                  rows={4}
                  className="w-full bg-background border border-border rounded-[var(--radius-sm)] px-3 py-2.5 text-base text-text-primary placeholder:text-text-secondary outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-colors resize-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reserve space so sticky footer never overlays content */}
        <div aria-hidden className="h-32" />
      </div>

      {/* Continue */}
      <div className="sticky bottom-0 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent">
        {!canContinue && (
          <p className="text-xs text-text-secondary text-center mb-2">
            Complete Profile + add at least 1 Interest, Skill, or Goal to continue
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
