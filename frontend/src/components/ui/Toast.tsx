import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-success shrink-0" />,
  error: <AlertCircle className="h-5 w-5 text-error shrink-0" />,
  info: <Info className="h-5 w-5 text-secondary shrink-0" />,
};

// ---------- Global toast state ----------

type ToastListener = (toasts: ToastMessage[]) => void;

let toasts: ToastMessage[] = [];
const listeners = new Set<ToastListener>();

function emit() {
  listeners.forEach((fn) => fn([...toasts]));
}

let nextId = 0;

/** Imperatively show a toast from anywhere. */
export function toast(message: string, type: ToastType = 'info') {
  const id = String(++nextId);
  toasts = [...toasts, { id, message, type }];
  emit();

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 3000);
}

// ---------- Toast Container (mount once at app root) ----------

export function ToastContainer() {
  const [items, setItems] = useState<ToastMessage[]>([]);

  useEffect(() => {
    listeners.add(setItems);
    return () => {
      listeners.delete(setItems);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, []);

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none"
      aria-live="polite"
    >
      <AnimatePresence mode="popLayout">
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={[
              'pointer-events-auto',
              'flex items-center gap-3',
              'px-4 py-3 rounded-[var(--radius-sm)]',
              'bg-text-primary text-white',
              'shadow-lg',
              'min-w-[280px] max-w-[420px]',
              'text-sm font-medium',
            ].join(' ')}
            role="alert"
          >
            {icons[t.type]}
            <span className="flex-1">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-full p-0.5 hover:bg-white/15 transition-colors cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
