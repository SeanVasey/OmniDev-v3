'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageBubble } from './MessageBubble';
import { StreamingIndicator } from './StreamingIndicator';
import type { Message } from '@/types';

interface MessageListProps {
  messages: Message[];
  isStreaming?: boolean;
}

export function MessageList({ messages, isStreaming = false }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  if (messages.length === 0 && !isStreaming) {
    return (
      <div className="flex items-center justify-center h-full px-4">
        <div className="text-center space-y-3 max-w-md">
          <div className="text-4xl">👋</div>
          <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
            Start a conversation
          </h2>
          <p className="text-[var(--text-secondary)]">
            Ask me anything or select a context mode to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div ref={scrollRef} className="flex flex-col">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isStreaming && <StreamingIndicator />}
      </div>
    </ScrollArea>
  );
}
