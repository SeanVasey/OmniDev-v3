'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Image as ImageIcon, Video, Music } from 'lucide-react';
import { useHaptics, HAPTIC_TRIGGERS } from '@/hooks/useHaptics';

interface UploadMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: File[]) => void;
}

const uploadOptions = [
  { id: 'document', icon: FileText, label: 'Upload document', accept: '.pdf,.doc,.docx,.txt,.md' },
  { id: 'image', icon: ImageIcon, label: 'Upload Image', accept: 'image/*' },
  { id: 'video', icon: Video, label: 'Upload Video', accept: 'video/*' },
  { id: 'audio', icon: Music, label: 'Upload Audio', accept: 'audio/*' },
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[var(--z-modal)]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-4 bottom-28 z-[calc(var(--z-modal)+1)] bg-[var(--glass-bg-elevated)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl overflow-hidden shadow-2xl min-w-[220px]"
          >
            {uploadOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  trigger(HAPTIC_TRIGGERS.uploadMenu.selectOption);
                  handleFileSelect(option.accept);
                  onClose();
                }}
                className="w-full flex items-center justify-between px-4 py-4 text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors border-b border-[var(--glass-border)] last:border-b-0 touch-target"
              >
                <span className="text-base font-medium">{option.label}</span>
                <option.icon className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            ))}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
