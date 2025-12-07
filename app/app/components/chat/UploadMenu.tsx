'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image as ImageIcon, Video, Music, X } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { HAPTIC_TRIGGERS } from '@/lib/haptics/triggers';

interface UploadMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: File[]) => void;
}

const uploadOptions = [
  { id: 'document', icon: FileText, label: 'Document', description: 'PDF, DOC, TXT, MD', accept: '.pdf,.doc,.docx,.txt,.md' },
  { id: 'image', icon: ImageIcon, label: 'Image', description: 'PNG, JPG, GIF, WebP', accept: 'image/*' },
  { id: 'video', icon: Video, label: 'Video', description: 'MP4, MOV, WebM', accept: 'video/*' },
  { id: 'audio', icon: Music, label: 'Audio', description: 'MP3, WAV, M4A', accept: 'audio/*' },
];

export function UploadMenu({ isOpen, onClose, onSelect }: UploadMenuProps) {
  const { trigger } = useHaptics();

  const handleFileSelect = (accept: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = true;

    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        trigger(HAPTIC_TRIGGERS.uploadMenu.fileSelected);
        onSelect(files);
      }
    };

    input.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-modal)] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="
              fixed left-4 right-4 bottom-28
              md:left-auto md:right-auto md:bottom-32
              max-w-sm mx-auto
              z-[calc(var(--z-modal)+1)]
              bg-[var(--bg-elevated)]/98
              backdrop-blur-2xl
              border border-[var(--border-default)]/60
              rounded-2xl
              overflow-hidden
              shadow-2xl shadow-black/50
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]/30">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Upload Files</h3>
              <button
                onClick={onClose}
                className="
                  w-7 h-7
                  inline-flex items-center justify-center
                  rounded-lg
                  text-[var(--text-muted)]
                  hover:text-[var(--text-primary)]
                  hover:bg-[var(--bg-muted)]/50
                  transition-all
                "
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Options */}
            <div className="p-2">
              {uploadOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    trigger(HAPTIC_TRIGGERS.uploadMenu.selectOption);
                    handleFileSelect(option.accept);
                    onClose();
                  }}
                  className="
                    w-full flex items-center gap-3
                    px-3 py-3
                    rounded-xl
                    text-left
                    hover:bg-[var(--bg-muted)]/50
                    transition-all duration-200
                    group
                  "
                >
                  <div className="
                    w-10 h-10
                    rounded-xl
                    bg-[var(--bg-muted)]/80
                    border border-[var(--border-subtle)]/50
                    flex items-center justify-center
                    group-hover:border-[var(--accent-primary)]/30
                    group-hover:bg-[var(--accent-primary)]/10
                    transition-all
                  ">
                    <option.icon className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors" />
                  </div>
                  <div className="flex-1">
                    <span className="block text-sm font-medium text-[var(--text-primary)]">{option.label}</span>
                    <span className="block text-xs text-[var(--text-muted)]">{option.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
