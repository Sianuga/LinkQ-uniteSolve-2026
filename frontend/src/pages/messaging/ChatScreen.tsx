import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import {
  mockMessages,
  mockConversations,
  mockCurrentUser,
} from '@/data/mockData';
import type { Message } from '@/types';

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

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function normalizeConversationId(id: string): string {
  return id.replace(/_/g, '-');
}

function equivalentConversationIds(id?: string): string[] {
  if (!id) return [];
  const normalized = normalizeConversationId(id);
  const underscored = normalized.replace(/-/g, '_');
  return Array.from(new Set([id, normalized, underscored]));
}

function isCurrentUser(senderId: string): boolean {
  return (
    senderId === mockCurrentUser.id ||
    senderId === 'u-me' ||
    senderId === 'u-001'
  );
}

const sharedContextMap: Record<string, string> = {
  user_002: "You're both interested in language models",
  user_003: "You're both attending Spring Hackathon 2026",
  user_004: "You both care about computer vision",
  user_005: "You both study distributed systems",
  user_006: "You both work with machine learning",
  user_009: "You both like hackathons and coding together",
};

const matchScoreMap: Record<string, number> = {
  user_002: 74,
  user_003: 88,
  user_004: 81,
  user_005: 92,
  user_006: 85,
  user_009: 88,
};

export default function ChatScreen() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const resolvedIds = useMemo(
    () => equivalentConversationIds(conversationId),
    [conversationId],
  );

  const conversation = useMemo(
    () => mockConversations.find((item) => resolvedIds.includes(item.id)),
    [resolvedIds],
  );
  const participant = conversation?.participant;

  const initialMessages = useMemo(() => {
    for (const id of resolvedIds) {
      const messages = mockMessages[id];
      if (messages) return messages;
    }
    return [];
  }, [resolvedIds]);

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const participantId = participant?.id ?? '';
  const matchScore = matchScoreMap[participantId] ?? 80;
  const sharedContext =
    sharedContextMap[participantId] ?? "You're both attending the same event";

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
            className="!border-0"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">
              {participant.name}
            </p>
            <p className="truncate text-xs text-text-secondary">
              {participant.program}
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center rounded-full bg-secondary/15 px-2 py-0.5 text-[11px] font-semibold text-secondary">
            {matchScore}% Match
          </span>
        </div>

        <div className="px-4 pb-3">
          <div className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3 shrink-0 text-secondary" />
            <span className="truncate">{sharedContext}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background via-background to-highlight/20 px-4 py-4">
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
                      'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm',
                      isOwn
                        ? 'rounded-br-md bg-secondary text-white'
                        : 'rounded-bl-md bg-white text-text-primary',
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

      <div className="shrink-0 border-t border-border bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-base text-text-primary placeholder:text-text-secondary/60 outline-none transition-colors focus:bg-gray-50 focus:ring-2 focus:ring-secondary/30"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary text-white transition-all hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <Send className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
