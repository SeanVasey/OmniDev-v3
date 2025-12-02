'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useHaptics } from '@/hooks/useHaptics';
import { HAPTIC_TRIGGERS } from '@/lib/haptics/triggers';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';
import 'highlight.js/styles/github-dark.css';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { trigger } = useHaptics();
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    trigger(HAPTIC_TRIGGERS.chat.copyToClipboard);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-3 px-4 py-4',
        isUser && 'justify-end',
        isAssistant && 'bg-[var(--bg-elevated)]'
      )}
    >
      <div className={cn('flex gap-3 max-w-3xl w-full', isUser && 'flex-row-reverse')}>
        {/* Avatar */}
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
            isUser
              ? 'bg-[var(--purple-600)] text-white'
              : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
          )}
        >
          {isUser ? 'U' : 'AI'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div
            className={cn(
              'rounded-2xl px-4 py-3',
              isUser
                ? 'bg-[var(--purple-600)] text-white ml-auto max-w-[85%]'
                : 'bg-transparent text-[var(--text-primary)]'
            )}
          >
            {isUser ? (
              <p className="text-base whitespace-pre-wrap break-words">{message.content}</p>
            ) : (
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Actions (for assistant messages) */}
          {isAssistant && (
            <div className="flex items-center gap-2 mt-2 px-2">
              <button
                onClick={handleCopy}
                className="
                  flex items-center gap-1.5
                  px-2 py-1
                  text-xs text-[var(--text-muted)]
                  hover:text-[var(--text-primary)]
                  rounded-lg
                  hover:bg-[var(--bg-muted)]
                  transition-colors
                "
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-[var(--text-muted)] mt-1 px-2">
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
