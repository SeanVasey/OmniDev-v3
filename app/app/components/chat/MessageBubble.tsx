'use client';

import { useState, useCallback } from 'react';
import { Copy, Check, Sparkles, User, Code2 } from 'lucide-react';
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

// Language display names
const LANGUAGE_NAMES: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  scala: 'Scala',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  sql: 'SQL',
  json: 'JSON',
  yaml: 'YAML',
  xml: 'XML',
  markdown: 'Markdown',
  bash: 'Bash',
  shell: 'Shell',
  powershell: 'PowerShell',
  dockerfile: 'Dockerfile',
  graphql: 'GraphQL',
  tsx: 'TSX',
  jsx: 'JSX',
  vue: 'Vue',
  svelte: 'Svelte',
  r: 'R',
  matlab: 'MATLAB',
  perl: 'Perl',
  lua: 'Lua',
  dart: 'Dart',
  elixir: 'Elixir',
  haskell: 'Haskell',
  clojure: 'Clojure',
  erlang: 'Erlang',
  zig: 'Zig',
  nim: 'Nim',
  ocaml: 'OCaml',
  fsharp: 'F#',
  solidity: 'Solidity',
  plaintext: 'Plain Text',
  text: 'Plain Text',
};

// Code block component with copy functionality
function CodeBlock({
  language,
  children,
}: {
  language?: string;
  children: string;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const { trigger } = useHaptics();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(children);
      trigger(HAPTIC_TRIGGERS.chat.copyToClipboard);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [children, trigger]);

  const displayLanguage = language
    ? LANGUAGE_NAMES[language.toLowerCase()] || language.toUpperCase()
    : 'Code';

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-[var(--border-subtle)]">
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--bg-muted)] border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[var(--accent-primary)]" />
          <span className="text-xs font-medium text-[var(--text-secondary)]">
            {displayLanguage}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all',
            isCopied
              ? 'text-[var(--color-success)] bg-[var(--color-success)]/10'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
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
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto bg-[#0d1117]">
        <pre className="!m-0 !p-4 !bg-transparent text-sm leading-relaxed">
          <code className={language ? `language-${language} hljs` : 'hljs'}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
}

// Inline code component
function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded-md bg-[var(--bg-muted)] text-[var(--accent-primary)] text-sm font-mono">
      {children}
    </code>
  );
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
              <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-headings:text-[var(--text-primary)] prose-strong:text-[var(--text-primary)] prose-a:text-[var(--accent-primary)] prose-a:no-underline hover:prose-a:underline">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    // Custom code block renderer
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match && !className;
                      const codeContent = String(children).replace(/\n$/, '');

                      if (isInline) {
                        return <InlineCode>{children}</InlineCode>;
                      }

                      return (
                        <CodeBlock language={match?.[1]}>
                          {codeContent}
                        </CodeBlock>
                      );
                    },
                    // Override pre to not add extra wrapper
                    pre({ children }) {
                      return <>{children}</>;
                    },
                    // Style links
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent-primary)] hover:underline"
                        >
                          {children}
                        </a>
                      );
                    },
                    // Style lists
                    ul({ children }) {
                      return <ul className="list-disc pl-6 space-y-1">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal pl-6 space-y-1">{children}</ol>;
                    },
                    // Style blockquotes
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-4 border-[var(--accent-primary)]/50 pl-4 italic text-[var(--text-secondary)]">
                          {children}
                        </blockquote>
                      );
                    },
                    // Style tables
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-4">
                          <table className="min-w-full border border-[var(--border-subtle)] rounded-lg overflow-hidden">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    th({ children }) {
                      return (
                        <th className="px-4 py-2 bg-[var(--bg-muted)] text-left text-sm font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)]">
                          {children}
                        </th>
                      );
                    },
                    td({ children }) {
                      return (
                        <td className="px-4 py-2 text-sm text-[var(--text-secondary)] border-b border-[var(--border-subtle)]">
                          {children}
                        </td>
                      );
                    },
                  }}
                >
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
