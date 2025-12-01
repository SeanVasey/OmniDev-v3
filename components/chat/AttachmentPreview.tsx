'use client';

import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AttachmentPreviewProps {
  file: File;
  onRemove: () => void;
}

export function AttachmentPreview({ file, onRemove }: AttachmentPreviewProps) {
  const isImage = file.type.startsWith('image/');

  return (
    <motion.div
      layout
      className="relative flex items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-muted)]/60 px-3 py-2 shadow-sm"
    >
      <div className={cn('h-10 w-10 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-muted)] flex items-center justify-center text-xs', !isImage && 'uppercase font-semibold')}
        aria-label={file.type}>
        {isImage ? 'IMG' : (file.type.split('/')[0] || 'FILE').slice(0, 3)}
      </div>
      <div className="flex flex-col min-w-[120px]">
        <span className="text-sm text-[var(--text-primary)] truncate">{file.name}</span>
        <span className="text-xs text-[var(--text-muted)]">{(file.size / 1024).toFixed(1)} KB</span>
      </div>
      <button
        onClick={onRemove}
        className="icon-button text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        aria-label={`Remove ${file.name}`}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
