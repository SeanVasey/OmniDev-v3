'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Clock,
  X,
  Mic,
  ArrowUp,
  Sparkles,
  Globe,
  GraduationCap,
  Palette,
  AudioLines,
  ChevronDown,
  Cpu,
  Code2,
  Image as ImageIcon,
  Video,
  Search,
  Zap,
} from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { HAPTIC_TRIGGERS } from '@/lib/haptics/triggers';
import { useAutoResizeTextarea } from '@/hooks/useAutoResizeTextarea';
import { cn } from '@/lib/utils';
import { UploadMenu } from './UploadMenu';
import { AspectRatioSelector } from './AspectRatioSelector';
import { AttachmentPreview } from './AttachmentPreview';
import { ProviderIcon } from '@/components/ui/ProviderIcon';
import { getAllModels } from '@/lib/ai/models';
import type { ContextMode, AspectRatio, AIModel } from '@/types';

interface ComposerProps {
  onSubmit: (message: string, attachments: File[], context: ContextMode, aspectRatio?: AspectRatio) => void;
  isIncognito: boolean;
  onIncognitoToggle: () => void;
  disabled?: boolean;
  currentModel: AIModel;
  onModelChange: (model: AIModel) => void;
}

// Model category types
type ModelCategory = 'chat' | 'code' | 'image' | 'video' | 'research';

interface ModelCategoryInfo {
  id: ModelCategory;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const modelCategories: ModelCategoryInfo[] = [
  { id: 'chat', name: 'Chat', icon: <Cpu className="w-4 h-4" />, description: 'General conversation' },
  { id: 'code', name: 'Code', icon: <Code2 className="w-4 h-4" />, description: 'Programming assistance' },
  { id: 'image', name: 'Image', icon: <ImageIcon className="w-4 h-4" />, description: 'Image generation' },
  { id: 'video', name: 'Video', icon: <Video className="w-4 h-4" />, description: 'Video generation' },
  { id: 'research', name: 'Research', icon: <Search className="w-4 h-4" />, description: 'Deep research & search' },
];

// Context mode definitions
const contextModes = [
  { id: 'thinking' as ContextMode, label: 'Think', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'search' as ContextMode, label: 'Search', icon: <Globe className="w-3.5 h-3.5" /> },
  { id: 'research' as ContextMode, label: 'Research', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { id: 'image' as ContextMode, label: 'Image', icon: <Palette className="w-3.5 h-3.5" /> },
];

function categorizeModel(model: AIModel): ModelCategory {
  if (model.supportsImageGen) return 'image';
  if (model.supportsVideoGen) return 'video';
  if (model.name.toLowerCase().includes('codex') || model.name.toLowerCase().includes('code')) return 'code';
  if (model.supportsResearch) return 'research';
  return 'chat';
}

export function Composer({
  onSubmit,
  isIncognito,
  onIncognitoToggle,
  disabled = false,
  currentModel,
  onModelChange,
}: ComposerProps) {
  const { trigger } = useHaptics();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [activeContext, setActiveContext] = useState<ContextMode>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ModelCategory>('chat');

  const allModels = getAllModels();

  // Group models by category
  const modelsByCategory = allModels.reduce((acc, model) => {
    const category = categorizeModel(model);
    if (!acc[category]) acc[category] = [];
    acc[category].push(model);
    return acc;
  }, {} as Record<ModelCategory, AIModel[]>);

  const {
    isRecording,
    fullTranscript,
    isSupported: isVoiceSupported,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useVoiceRecording();

  useAutoResizeTextarea(textareaRef, message);

  // Close model dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setShowModelSelector(false);
      }
    }
    if (showModelSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showModelSelector]);

  // Update message with voice transcript
  useEffect(() => {
    if (fullTranscript && isRecording) {
      setMessage(fullTranscript);
    }
  }, [fullTranscript, isRecording]);

  // Handle voice recording toggle
  useEffect(() => {
    if (isVoiceActive && !isRecording) {
      startRecording();
    } else if (!isVoiceActive && isRecording) {
      stopRecording();
    }
  }, [isVoiceActive, isRecording, startRecording, stopRecording]);

  const handleSubmit = useCallback(() => {
    if (!message.trim() && attachments.length === 0) return;

    trigger(HAPTIC_TRIGGERS.composer.send);
    onSubmit(
      message.trim(),
      attachments,
      activeContext,
      activeContext === 'image' ? aspectRatio : undefined
    );

    setMessage('');
    setAttachments([]);
    setIsVoiceActive(false);
    clearTranscript();
    textareaRef.current?.focus();
  }, [message, attachments, activeContext, aspectRatio, trigger, onSubmit, clearTranscript]);

  const handleContextSelect = useCallback((context: ContextMode) => {
    if (activeContext === context) {
      trigger(HAPTIC_TRIGGERS.composer.contextPillDeselect);
      setActiveContext(null);
    } else {
      trigger(HAPTIC_TRIGGERS.composer.contextPillSelect);
      setActiveContext(context);
    }
  }, [activeContext, trigger]);

  const handleAttachmentAdd = useCallback((files: File[]) => {
    trigger(HAPTIC_TRIGGERS.composer.attachmentAdd);
    setAttachments(prev => [...prev, ...files]);
    setShowUploadMenu(false);
  }, [trigger]);

  const handleAttachmentRemove = useCallback((index: number) => {
    trigger(HAPTIC_TRIGGERS.composer.attachmentRemove);
    setAttachments(prev => prev.filter((_, i) => i !== index));
  }, [trigger]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleModelSelect = (model: AIModel) => {
    trigger(HAPTIC_TRIGGERS.modelSelector.select);
    onModelChange(model);
    setShowModelSelector(false);
  };

  const canSend = message.trim().length > 0 || attachments.length > 0;

  return (
    <div className="
      fixed bottom-0 left-0 right-0
      pb-[calc(var(--safe-area-bottom)+16px)]
      md:pb-[calc(var(--safe-area-bottom)+24px)]
      px-4
      pointer-events-none
      z-[var(--z-docked)]
    ">
      <div className="max-w-3xl mx-auto pointer-events-auto">
        {/* Main Composer Capsule */}
        <div className={cn(
          "relative",
          "bg-[var(--bg-elevated)]/95 backdrop-blur-2xl",
          "border border-[var(--border-default)]/50",
          "rounded-3xl",
          "shadow-2xl shadow-black/40",
          "overflow-hidden",
          "transition-all duration-300",
          disabled && "opacity-50 pointer-events-none"
        )}>
          {/* Top Section: Model Selector & Context Pills */}
          <div className="px-4 pt-3 pb-2 border-b border-[var(--border-subtle)]/30">
            <div className="flex items-center justify-between gap-3">
              {/* Model Selector */}
              <div className="relative" ref={modelDropdownRef}>
                <button
                  onClick={() => {
                    trigger(HAPTIC_TRIGGERS.modelSelector.open);
                    setShowModelSelector(!showModelSelector);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5",
                    "bg-[var(--bg-muted)]/60 hover:bg-[var(--bg-muted)]",
                    "border border-[var(--border-subtle)]/50",
                    "rounded-xl",
                    "transition-all duration-200",
                    "group"
                  )}
                >
                  <ProviderIcon provider={currentModel.provider} size={16} />
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[120px]">
                    {currentModel.name}
                  </span>
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200",
                    showModelSelector && "rotate-180"
                  )} />
                </button>

                {/* Model Dropdown */}
                <AnimatePresence>
                  {showModelSelector && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="
                        absolute bottom-full mb-2 left-0
                        w-80 max-h-[400px]
                        bg-[var(--bg-elevated)]/98 backdrop-blur-2xl
                        border border-[var(--border-default)]/60
                        rounded-2xl
                        shadow-2xl shadow-black/50
                        overflow-hidden
                        z-50
                      "
                    >
                      {/* Category Tabs */}
                      <div className="flex gap-1 p-2 border-b border-[var(--border-subtle)]/30 overflow-x-auto scrollbar-hide">
                        {modelCategories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                              activeCategory === category.id
                                ? "bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--purple-glow)]/30"
                                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]/50"
                            )}
                          >
                            {category.icon}
                            <span>{category.name}</span>
                          </button>
                        ))}
                      </div>

                      {/* Model List */}
                      <div className="max-h-[300px] overflow-y-auto p-2">
                        {modelsByCategory[activeCategory]?.length > 0 ? (
                          <div className="space-y-1">
                            {modelsByCategory[activeCategory].map((model) => (
                              <button
                                key={model.id}
                                onClick={() => handleModelSelect(model)}
                                className={cn(
                                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all",
                                  "hover:bg-[var(--bg-muted)]/60",
                                  currentModel.id === model.id && "bg-[var(--accent-primary)]/15 border border-[var(--accent-primary)]/30"
                                )}
                              >
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center",
                                  "bg-[var(--bg-muted)]/80"
                                )}>
                                  <ProviderIcon provider={model.provider} size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-[var(--text-primary)]">
                                      {model.name}
                                    </span>
                                    {currentModel.id === model.id && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-[var(--text-muted)]">
                                      {model.contextWindow > 0 ? `${(model.contextWindow / 1000).toFixed(0)}K` : 'N/A'}
                                    </span>
                                    {model.supportsVision && (
                                      <span className="text-xs text-[var(--purple-400)]">Vision</span>
                                    )}
                                    {model.supportsThinking && (
                                      <span className="text-xs text-[var(--blue-400)]">Thinking</span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="py-8 text-center text-[var(--text-muted)] text-sm">
                            No models in this category
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Context Pills - Inline */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                {contextModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleContextSelect(mode.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                      activeContext === mode.id
                        ? "bg-[var(--accent-primary)] text-white shadow-md shadow-[var(--purple-glow)]/40"
                        : "bg-[var(--bg-muted)]/50 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] border border-[var(--border-subtle)]/30"
                    )}
                  >
                    {mode.icon}
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Aspect Ratio Selector (for Image mode) */}
          <AnimatePresence>
            {activeContext === 'image' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-2 border-b border-[var(--border-subtle)]/30"
              >
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

          {/* Attachment Previews */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-3 flex gap-2 overflow-x-auto border-b border-[var(--border-subtle)]/30"
              >
                {attachments.map((file, index) => (
                  <AttachmentPreview
                    key={`${file.name}-${index}`}
                    file={file}
                    onRemove={() => handleAttachmentRemove(index)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Row */}
          <div className="flex items-end gap-2 p-3">
            {/* Attachment Button */}
            <button
              onClick={() => {
                trigger(HAPTIC_TRIGGERS.uploadMenu.open);
                setShowUploadMenu(true);
              }}
              className="
                flex-shrink-0
                w-10 h-10
                inline-flex items-center justify-center
                rounded-xl
                bg-[var(--bg-muted)]/60
                border border-[var(--border-subtle)]/30
                text-[var(--text-muted)]
                hover:text-[var(--text-primary)]
                hover:bg-[var(--bg-muted)]
                hover:border-[var(--border-default)]
                transition-all duration-200
              "
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Textarea */}
            <div className="flex-1 min-h-[24px]">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message OmniDev..."
                rows={1}
                disabled={disabled}
                className="
                  w-full
                  resize-none
                  bg-transparent
                  text-[var(--text-primary)]
                  placeholder:text-[var(--text-placeholder)]
                  text-base leading-relaxed
                  focus:outline-none
                  max-h-32 overflow-y-auto
                  scrollbar-hide
                "
                style={{
                  height: 'auto',
                  minHeight: '24px',
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex-shrink-0 flex items-center gap-1.5">
              {/* Temporary/Incognito Toggle */}
              <button
                onClick={() => {
                  trigger(HAPTIC_TRIGGERS.modeToggle.enterIncognito);
                  onIncognitoToggle();
                }}
                className={cn(
                  "w-10 h-10 inline-flex items-center justify-center rounded-xl transition-all duration-200",
                  isIncognito
                    ? "bg-[var(--blue-500)]/20 text-[var(--blue-400)] border border-[var(--blue-500)]/30"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]/50"
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

              {/* Voice Button */}
              {isVoiceSupported && (
                <button
                  onClick={() => {
                    const newState = !isVoiceActive;
                    trigger(newState
                      ? HAPTIC_TRIGGERS.composer.voiceStart
                      : HAPTIC_TRIGGERS.composer.voiceStop
                    );
                    setIsVoiceActive(newState);
                  }}
                  disabled={disabled}
                  className={cn(
                    "w-10 h-10 inline-flex items-center justify-center rounded-xl transition-all duration-200",
                    isVoiceActive
                      ? "bg-[var(--accent-primary)] text-white scale-105 shadow-lg shadow-[var(--purple-glow)]/50"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]/50",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isVoiceActive ? (
                    <AudioLines className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                </button>
              )}

              {/* Send Button */}
              <AnimatePresence>
                {canSend && (
                  <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    onClick={handleSubmit}
                    className="
                      w-10 h-10
                      inline-flex items-center justify-center
                      rounded-xl
                      bg-[var(--accent-primary)]
                      text-white
                      hover:bg-[var(--accent-primary-hover)]
                      shadow-lg shadow-[var(--purple-glow)]/50
                      transition-all duration-200
                    "
                  >
                    <ArrowUp className="w-5 h-5" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Upload Menu */}
        <UploadMenu
          isOpen={showUploadMenu}
          onClose={() => setShowUploadMenu(false)}
          onSelect={handleAttachmentAdd}
        />
      </div>
    </div>
  );
}
