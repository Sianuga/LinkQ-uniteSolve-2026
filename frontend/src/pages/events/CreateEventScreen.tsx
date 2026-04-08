import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import type { EventCategory } from '@/types';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const categories: EventCategory[] = [
  'lecture',
  'seminar',
  'hackathon',
  'club',
  'social',
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CreateEventScreen() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState<EventCategory>('lecture');
  const [submitted, setSubmitted] = useState(false);

  const isValid =
    title.trim() !== '' &&
    description.trim() !== '' &&
    location.trim() !== '' &&
    date !== '' &&
    time !== '';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    // In a real app this would POST to the API
    setSubmitted(true);
    setTimeout(() => navigate('/events'), 600);
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
          <ArrowLeft className="h-5 w-5 text-text-secondary" />
        </button>
        <h2 className="text-lg font-semibold text-text-primary">Create Event</h2>
      </div>

      {/* ---- Form ---- */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-4 pt-2">
        <Input
          label="Title"
          placeholder="e.g. AI Workshop"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* Textarea (styled to match Input) */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="event-description"
            className="text-sm font-medium text-text-primary"
          >
            Description
          </label>
          <textarea
            id="event-description"
            rows={4}
            placeholder="What is this event about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className={[
              'w-full resize-none bg-surface text-text-primary placeholder:text-text-secondary',
              'border rounded-[var(--radius-sm)] px-3 py-3',
              'text-base leading-5 outline-none',
              'transition-colors duration-150',
              'border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20',
            ].join(' ')}
          />
        </div>

        <Input
          label="Location"
          placeholder="e.g. Main Campus, Hall A"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Input
          label="Time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
        />

        {/* Category select */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="event-category"
            className="text-sm font-medium text-text-primary"
          >
            Category
          </label>
          <select
            id="event-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as EventCategory)}
            className={[
              'w-full bg-surface text-text-primary',
              'border rounded-[var(--radius-sm)] px-3 py-3',
              'text-base leading-5 outline-none',
              'transition-colors duration-150',
              'border-border focus:border-secondary focus:ring-2 focus:ring-secondary/20',
              'cursor-pointer',
            ].join(' ')}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          className="mt-2 w-full"
          disabled={!isValid}
          loading={submitted}
        >
          {submitted ? 'Creating...' : 'Create Event'}
        </Button>
      </form>
    </motion.div>
  );
}
