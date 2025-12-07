'use client';

import { useState } from 'react';
import { Copy, Check, Sparkles, User } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { useHaptics } from '@/hooks/useHaptics';
import { HAPTIC_TRIGGERS } from '@/lib/haptics/triggers';
import { cn } from '@/lib/utils';
import { ThinkingProcess } from './ThinkingProcess';
import { MediaGenerationPlaceholder } from './MediaGenerationPlaceholder';
import type { Message, AspectRatio } from '@/types';
import 'highlight.js/styles/github-dark.css';

interface MessageBubbleProps {
  message: Message;
  thinkingContent?: string;
  isThinkingComplete?: boolean;
  isThinkingStreaming?: boolean;
  thinkingDuration?: number;
  isGeneratingMedia?: boolean;
  mediaProgress?: number;
  mediaType?: 'image' | 'video';
  mediaPreviewUrl?: string;
}

export function MessageBubble({
  message,
  thinkingContent,
  isThinkingComplete = true,
  isThinkingStreaming = false,
  thinkingDuration,
  isGeneratingMedia = false,
  mediaProgress = 0,
  mediaType,
  mediaPreviewUrl,
}: MessageBubbleProps) {
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

  // Check if message contains an image (markdown image syntax)
  const hasImage = message.content.includes('![');

  // Extract aspect ratio from message content if present
  const aspectRatioMatch = message.content.match(/\[Aspect Ratio: (\d+:\d+)\]/);
  const extractedAspectRatio = aspectRatioMatch?.[1] as AspectRatio | undefined;
  const aspectRatio = message.aspect_ratio || extractedAspectRatio || '1:1';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-3 px-4 py-5',
        isUser && 'justify-end',
        isAssistant && 'bg-[var(--bg-elevated)]/50'
      )}
    >
      <div className={cn('flex gap-4 max-w-3xl w-full', isUser && 'flex-row-reverse')}>
        {/* Avatar */}
        <div
          className={cn(
            'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg',
            isUser
              ? 'bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-hover)] shadow-[var(--purple-glow)]/30'
              : 'bg-[var(--bg-muted)]/80 border border-[var(--border-subtle)] shadow-black/20'
          )}
        >
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Thinking Process (for assistant messages with thinking content) */}
          {isAssistant && thinkingContent && (
            <ThinkingProcess
              content={thinkingContent}
              isComplete={isThinkingComplete}
              isStreaming={isThinkingStreaming}
              thinkingDuration={thinkingDuration}
            />
          )}

          {/* Media Generation Placeholder */}
          {isAssistant && isGeneratingMedia && mediaType && !hasImage && (
            <div className="mb-4">
              <MediaGenerationPlaceholder
                type={mediaType}
                aspectRatio={aspectRatio}
                progress={mediaProgress}
                prompt={message.content}
                previewUrl={mediaPreviewUrl}
                isComplete={mediaProgress >= 100}
              />
            </div>
          )}

          {/* Main message content */}
          <div
            className={cn(
              'rounded-2xl',
              isUser
                ? 'bg-[var(--accent-primary)] text-white px-4 py-3 ml-auto max-w-[85%] shadow-lg shadow-[var(--purple-glow)]/20'
                : 'text-[var(--text-primary)]'
            )}
          >
            {isUser ? (
              <p className="text-base whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
            ) : (
              <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-[var(--bg-muted)] prose-pre:border prose-pre:border-[var(--border-subtle)] prose-pre:rounded-xl prose-code:text-[var(--accent-primary)] prose-headings:text-[var(--text-primary)] prose-img:rounded-xl prose-img:shadow-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Actions (for assistant messages) */}
          {isAssistant && (
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-1.5",
                  "px-3 py-1.5",
                  "text-xs font-medium",
                  "rounded-lg",
                  "border border-[var(--border-subtle)]/50",
                  "transition-all duration-200",
                  isCopied
                    ? "text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]/50 hover:border-[var(--border-default)]"
                )}
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Timestamp */}
          <div className={cn(
            "text-xs text-[var(--text-muted)]/70 mt-2",
            isUser && "text-right"
          )}>
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
