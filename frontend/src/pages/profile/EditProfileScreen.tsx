import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Button, Tag, Input, Card } from '@/components/ui';
import { currentUser } from '@/data/mockData';

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

/* ------------------------------------------------------------------ */
/*  Tag Editor                                                         */
/* ------------------------------------------------------------------ */

function TagEditor({
  label,
  tags,
  placeholder,
  onChange,
}: {
  label: string;
  tags: string[];
  placeholder?: string;
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = useState('');

  function addTag() {
    const trimmed = input.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    onChange([...tags, trimmed]);
    setInput('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-text-primary">{label}</p>
      <AnimatePresence>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Tag
              key={tag}
              label={tag}
              selected
              onRemove={() => onChange(tags.filter((t) => t !== tag))}
            />
          ))}
        </div>
      </AnimatePresence>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder ?? `Add ${label.toLowerCase()}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={addTag}
          disabled={!input.trim()}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Textarea field                                                     */
/* ------------------------------------------------------------------ */

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={[
          'w-full bg-surface text-text-primary placeholder:text-text-secondary',
          'border border-border rounded-[var(--radius-sm)] px-3 py-3',
          'text-sm leading-5 outline-none resize-none',
          'transition-colors duration-150',
          'focus:border-secondary focus:ring-2 focus:ring-secondary/20',
        ].join(' ')}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function EditProfileScreen() {
  const navigate = useNavigate();

  /* ---- Form state, pre-filled from current user ---- */
  const [name, setName] = useState(currentUser.name);
  const [program, setProgram] = useState(currentUser.program);
  const [semester, setSemester] = useState(String(currentUser.semester));
  const [bio, setBio] = useState(currentUser.bio ?? '');

  // Interests
  const [hobbies, setHobbies] = useState(currentUser.interests.hobbies);
  const [topics, setTopics] = useState(currentUser.interests.topics);

  // Skills
  const [programming, setProgramming] = useState(currentUser.skills.programming);
  const [tools, setTools] = useState(currentUser.skills.tools);
  const [languages, setLanguages] = useState(currentUser.skills.languages);

  // Goals
  const [learningGoals, setLearningGoals] = useState(currentUser.goals.learning);
  const [career, setCareer] = useState(currentUser.goals.career);
  const [shortTerm, setShortTerm] = useState(currentUser.goals.short_term);

  const [saving, setSaving] = useState(false);

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    setSaving(true);
    // Simulate save
    setTimeout(() => {
      setSaving(false);
      navigate(-1);
    }, 600);
  }

  return (
    <div className="min-h-dvh bg-background flex flex-col">
      <Header title="Edit Profile" showBack />

      <motion.form
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto pb-28"
      >
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="flex flex-col gap-4 px-4 pt-5"
        >
          {/* ---- Basic Info ---- */}
          <motion.div variants={fadeUp}>
            <Card className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-text-primary">Basic Information</h3>
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              <Input
                label="Program"
                value={program}
                onChange={(e) => setProgram(e.target.value)}
                placeholder="e.g. M.Sc. Computer Science"
              />
              <Input
                label="Semester"
                type="number"
                min={1}
                max={20}
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g. 3"
              />
              <TextareaField
                label="Bio"
                value={bio}
                onChange={setBio}
                placeholder="Tell others about yourself..."
                rows={4}
              />
            </Card>
          </motion.div>

          {/* ---- Interests ---- */}
          <motion.div variants={fadeUp}>
            <Card className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-text-primary">Interests</h3>
              <TagEditor
                label="Hobbies"
                tags={hobbies}
                onChange={setHobbies}
                placeholder="Add a hobby..."
              />
              <TagEditor
                label="Topics"
                tags={topics}
                onChange={setTopics}
                placeholder="Add a topic..."
              />
            </Card>
          </motion.div>

          {/* ---- Skills ---- */}
          <motion.div variants={fadeUp}>
            <Card className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-text-primary">Skills</h3>
              <TagEditor
                label="Programming Languages"
                tags={programming}
                onChange={setProgramming}
                placeholder="e.g. Python, TypeScript..."
              />
              <TagEditor
                label="Tools & Frameworks"
                tags={tools}
                onChange={setTools}
                placeholder="e.g. Docker, React..."
              />
              <TagEditor
                label="Spoken Languages"
                tags={languages}
                onChange={setLanguages}
                placeholder="e.g. English, German (B1)..."
              />
            </Card>
          </motion.div>

          {/* ---- Goals ---- */}
          <motion.div variants={fadeUp}>
            <Card className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-text-primary">Goals</h3>
              <TagEditor
                label="Learning Goals"
                tags={learningGoals}
                onChange={setLearningGoals}
                placeholder="What do you want to learn?"
              />
              <TextareaField
                label="Career Direction"
                value={career}
                onChange={setCareer}
                placeholder="e.g. ML engineering, startup founder..."
                rows={2}
              />
              <TextareaField
                label="Short-term Goal"
                value={shortTerm}
                onChange={setShortTerm}
                placeholder="What are you working on right now?"
                rows={2}
              />
            </Card>
          </motion.div>
        </motion.div>
      </motion.form>

      {/* ---- Fixed Save Button ---- */}
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 25 }}
        className="fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-border px-4 py-3 safe-area-bottom"
      >
        <div className="max-w-lg mx-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            loading={saving}
            onClick={() => handleSubmit()}
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
