import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import {
  mockMessages,
  mockConversations,
  mockCurrentUser,
  mockUsers,
} from '@/data/mockData';
import type { Message } from '@/types';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------
const pageVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

const messageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Determines if a sender_id belongs to the current user. */
function isCurrentUser(senderId: string): boolean {
  return (
    senderId === mockCurrentUser.id ||
    senderId === 'u-me' ||
    senderId === 'u-001'
  );
}

// ---------------------------------------------------------------------------
// Shared-context map (keyed by participant id)
// ---------------------------------------------------------------------------
const sharedContextMap: Record<string, string> = {
  'u-002': "You're both attending Distributed Systems",
  'u-003': "You're both attending Spring Hackathon 2026",
  'u-2': "You're both attending Spring Hackathon 2026",
  'u-1': "You're both attending Intro to Machine Learning",
};

const matchScoreMap: Record<string, number> = {
  'u-002': 87,
  'u-003': 72,
  'u-2': 72,
  'u-1': 87,
  'u-004': 79,
  'u-005': 65,
  'u-006': 51,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ChatScreen() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();

  // Find the conversation metadata
  const conversation = useMemo(
    () => mockConversations?.find((c) => c.id === conversationId),
    [conversationId],
  );
  const participant = conversation?.participant;

  // Messages state -- seeded from mock data
  const initialMessages = useMemo(
    () => (conversationId && mockMessages ? mockMessages[conversationId] ?? [] : []),
    [conversationId],
  );
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');

  // Scroll-to-bottom ref
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll on mount and when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Derive match score and shared context from participant
  const participantId = participant?.id ?? '';
  const matchScore = matchScoreMap[participantId] ?? 87;
  const sharedContext =
    sharedContextMap[participantId] ?? "You're both attending Distributed Systems";

  // Handle send
  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      sender_id: mockCurrentUser.id,
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Fallback if conversation not found
  if (!participant) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6">
        <p className="text-sm text-text-secondary">Conversation not found.</p>
        <button
          type="button"
          onClick={() => navigate('/messages')}
          className="text-sm font-medium text-secondary transition-colors hover:text-secondary/80"
        >
          Back to messages
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="flex h-dvh flex-col bg-background"
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ---- Header ---- */}
      <div className="shrink-0 border-b border-border bg-surface shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-highlight"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <Avatar
            name={participant.name}
            avatarType={participant.avatar}
            size="sm"
            className="!h-8 !w-8 !border-0"
          />

          <div className="flex flex-1 items-center gap-2 min-w-0">
            <span className="truncate text-sm font-semibold text-text-primary">
              {participant.name}
            </span>
            <span className="inline-flex shrink-0 items-center rounded-full bg-secondary/15 px-2 py-0.5 text-[11px] font-semibold text-secondary">
              {matchScore}% Match
            </span>
          </div>
        </div>

        {/* Shared context chip */}
        <div className="px-4 pb-3">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-accent/25"
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
            {sharedContext}
          </button>
        </div>
      </div>

      {/* ---- Message List ---- */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isOwn = isCurrentUser(msg.sender_id);

              return (
                <motion.div
                  key={msg.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="visible"
                  layout
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={[
                      'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                      isOwn
                        ? 'rounded-br-md bg-secondary text-white'
                        : 'rounded-bl-md bg-highlight text-text-primary',
                    ].join(' ')}
                  >
                    {msg.content}
                  </div>
                  <span
                    className={`mt-1 text-[10px] text-text-secondary ${isOwn ? 'mr-1' : 'ml-1'}`}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>
      </div>

      {/* ---- Input Bar ---- */}
      <div className="shrink-0 border-t border-border bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-highlight px-4 py-2.5 text-base text-text-primary placeholder:text-text-secondary/60 outline-none transition-colors focus:bg-background focus:ring-2 focus:ring-secondary/30"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-white transition-all hover:bg-secondary/90 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
