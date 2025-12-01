'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, X, Mic, ArrowUp, Sparkles, Globe, GraduationCap, Palette, AudioLines } from 'lucide-react';
import { useHaptics, HAPTIC_TRIGGERS } from '@/hooks/useHaptics';
import { useAutoResizeTextarea } from '@/hooks/useAutoResizeTextarea';
import { cn } from '@/lib/utils';
import { ContextPill } from './ContextPill';
import { UploadMenu } from './UploadMenu';
import { AspectRatioSelector } from './AspectRatioSelector';
import { AttachmentPreview } from './AttachmentPreview';

type ContextMode = 'thinking' | 'search' | 'research' | 'image' | null;
export type AspectRatio = '1:1' | '3:4' | '4:3' | '16:9' | '9:16';

interface ComposerProps {
  onSubmit: (message: string, attachments: File[], context: ContextMode, aspectRatio?: AspectRatio) => void;
  isIncognito: boolean;
  onIncognitoToggle: () => void;
  disabled?: boolean;
}

export function Composer({ onSubmit, isIncognito, onIncognitoToggle, disabled = false }: ComposerProps) {
  const { trigger } = useHaptics();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [activeContext, setActiveContext] = useState<ContextMode>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);

  useAutoResizeTextarea(textareaRef, message);

  const handleSubmit = useCallback(() => {
    if (!message.trim() && attachments.length === 0) return;

    trigger(HAPTIC_TRIGGERS.composer.send);
    onSubmit(message.trim(), attachments, activeContext, activeContext === 'image' ? aspectRatio : undefined);

    setMessage('');
    setAttachments([]);
    textareaRef.current?.focus();
  }, [message, attachments, activeContext, aspectRatio, trigger, onSubmit]);

  const handleContextSelect = useCallback(
    (context: ContextMode) => {
      if (activeContext === context) {
        trigger(HAPTIC_TRIGGERS.composer.contextPillDeselect);
        setActiveContext(null);
      } else {
        trigger(HAPTIC_TRIGGERS.composer.contextPillSelect);
        setActiveContext(context);
      }
    },
    [activeContext, trigger]
  );

  const handleAttachmentAdd = useCallback(
    (files: File[]) => {
      trigger(HAPTIC_TRIGGERS.composer.attachmentAdd);
      setAttachments((prev) => [...prev, ...files]);
      setShowUploadMenu(false);
    },
    [trigger]
  );

  const handleAttachmentRemove = useCallback(
    (index: number) => {
      trigger(HAPTIC_TRIGGERS.composer.attachmentRemove);
      setAttachments((prev) => prev.filter((_, i) => i !== index));
    },
    [trigger]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const canSend = message.trim().length > 0 || attachments.length > 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 pb-[calc(var(--safe-area-bottom)+16px)] md:pb-[calc(var(--safe-area-bottom)+24px)] px-4 pointer-events-none z-[var(--z-docked)]">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          <ContextPill
            icon={<Sparkles className="w-4 h-4" />}
            label="Thinking"
            active={activeContext === 'thinking'}
            accentColor="purple"
            onPress={() => handleContextSelect('thinking')}
          />
          <ContextPill
            icon={<Globe className="w-4 h-4" />}
            label="Search"
            active={activeContext === 'search'}
            accentColor="purple"
            onPress={() => handleContextSelect('search')}
          />
          <ContextPill
            icon={<GraduationCap className="w-4 h-4" />}
            label="Deep Research"
            active={activeContext === 'research'}
            accentColor="orange"
            onPress={() => handleContextSelect('research')}
          />
          <ContextPill
            icon={<Palette className="w-4 h-4" />}
            label="Image Gen"
            active={activeContext === 'image'}
            accentColor="coral"
            onPress={() => handleContextSelect('image')}
          />
        </div>

        <AnimatePresence>
          {activeContext === 'image' && (
            <motion.div initial={{ opacity: 0, y: 10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: 10, height: 0 }} className="mb-3">
              <AspectRatioSelector
                selected={aspectRatio}
                onSelect={(ratio) => {
                  trigger(HAPTIC_TRIGGERS.composer.aspectRatioChange);
                  setAspectRatio(ratio);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className={cn(
            'relative',
            'bg-[var(--glass-bg)] backdrop-blur-xl',
            'border border-[var(--glass-border)]',
            'rounded-[2rem]',
            'shadow-2xl',
            'overflow-hidden',
            'transition-all duration-200',
            disabled && 'opacity-50 pointer-events-none'
          )}
        >
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-4 pt-3 flex gap-2 overflow-x-auto">
                {attachments.map((file, index) => (
                  <AttachmentPreview key={`${file.name}-${index}`} file={file} onRemove={() => handleAttachmentRemove(index)} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-end gap-2 p-3">
            <button
              onClick={() => {
                trigger(HAPTIC_TRIGGERS.uploadMenu.open);
                setShowUploadMenu(true);
              }}
              className="flex-shrink-0 icon-button bg-[var(--bg-muted)]/50 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
            >
              <Plus className="w-5 h-5" />
            </button>

            <div className="flex-1 min-h-[24px]">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Chat with OmniDev..."
                rows={1}
                disabled={disabled}
                className="w-full resize-none bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] text-base leading-relaxed focus:outline-none max-h-32 overflow-y-auto scrollbar-hide"
                style={{ height: 'auto', minHeight: '24px' }}
              />
            </div>

            <div className="flex-shrink-0 flex items-center gap-1">
              <button
                onClick={() => {
                  trigger(HAPTIC_TRIGGERS.modeToggle.enterIncognito);
                  onIncognitoToggle();
                }}
                className={cn(
                  'icon-button transition-all',
                  isIncognito
                    ? 'bg-[var(--blue-500)]/20 text-[var(--blue-400)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                {isIncognito ? (
                  <div className="flex items-center gap-0.5">
                    <Clock className="w-4 h-4" />
                    <X className="w-3 h-3" />
                  </div>
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={() => {
                  const newState = !isVoiceActive;
                  trigger(newState ? HAPTIC_TRIGGERS.composer.voiceStart : HAPTIC_TRIGGERS.composer.voiceStop);
                  setIsVoiceActive(newState);
                }}
                className={cn(
                  'icon-button transition-all',
                  isVoiceActive
                    ? 'bg-[var(--purple-600)] text-white scale-110'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                {isVoiceActive ? <AudioLines className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
              </button>

              <AnimatePresence>
                {canSend && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    onClick={handleSubmit}
                    className="icon-button bg-[var(--purple-600)] text-white hover:bg-[var(--purple-500)]"
                  >
                    <ArrowUp className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <UploadMenu isOpen={showUploadMenu} onClose={() => setShowUploadMenu(false)} onSelect={handleAttachmentAdd} />
      </div>
    </div>
  );
}
