import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button, Input } from '@/components/ui';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CreateGroupScreen() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [lookingFor, setLookingFor] = useState<number>(1);
  const [submitted, setSubmitted] = useState(false);

  const isValid = name.trim() !== '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    // In a real app this would POST to the API
    setSubmitted(true);
    setTimeout(() => navigate(`/events/${eventId}`), 600);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-0 pb-8"
    >
      {/* ---- Header ---- */}
      <div className="sticky top-0 z-20 flex items-center gap-3 bg-background px-4 py-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-highlight"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Create Group</h2>
      </div>

      {/* ---- Form ---- */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 pt-2">
        <Input
          label="Group Name"
          placeholder="e.g. ML Study Group"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Textarea (styled to match Input) */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="group-description"
            className="text-sm font-medium text-text-primary"
          >
            Description
          </label>
          <textarea
            id="group-description"
            rows={4}
            placeholder="What is this group about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={[
              'w-full resize-none bg-surface text-text-primary placeholder:text-text-secondary',
              'border rounded-[var(--radius-sm)] px-3 py-3',
              'text-sm leading-5 outline-none',
              'transition-colors duration-150',
              'border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20',
            ].join(' ')}
          />
        </div>

        {/* Looking for (number) */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="looking-for"
            className="text-sm font-medium text-text-primary"
          >
            Looking for
          </label>
          <input
            id="looking-for"
            type="number"
            min={0}
            max={20}
            value={lookingFor}
            onChange={(e) => setLookingFor(Number(e.target.value))}
            className={[
              'w-full bg-surface text-text-primary placeholder:text-text-secondary',
              'border rounded-[var(--radius-sm)] px-3 py-3',
              'text-sm leading-5 outline-none',
              'transition-colors duration-150',
              'border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20',
            ].join(' ')}
          />
          <p className="text-xs text-text-secondary">
            How many additional members are you looking for?
          </p>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="mt-2 w-full"
          disabled={!isValid}
          loading={submitted}
        >
          {submitted ? 'Creating...' : 'Create Group'}
        </Button>
      </form>
    </motion.div>
  );
}
