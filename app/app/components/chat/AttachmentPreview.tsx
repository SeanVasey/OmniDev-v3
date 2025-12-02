'use client';

import { X, FileText, Image as ImageIcon, Video, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatFileSize } from '@/lib/utils';

interface AttachmentPreviewProps {
  file: File;
  onRemove: () => void;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return ImageIcon;
  if (type.startsWith('video/')) return Video;
  if (type.startsWith('audio/')) return Music;
  return FileText;
}

export function AttachmentPreview({ file, onRemove }: AttachmentPreviewProps) {
  const Icon = getFileIcon(file.type);
  const isImage = file.type.startsWith('image/');
  const previewUrl = isImage ? URL.createObjectURL(file) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="
        relative flex-shrink-0
        w-20 h-20
        bg-[var(--bg-elevated)]
        border border-[var(--border-subtle)]
        rounded-xl
        overflow-hidden
      "
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt={file.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
          <Icon className="w-6 h-6 text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-muted)] truncate w-full text-center">
            {formatFileSize(file.size)}
          </span>
        </div>
      )}

      <button
        onClick={onRemove}
        className="
          absolute top-1 right-1
          w-6 h-6
          bg-black/60 backdrop-blur-sm
          rounded-full
          flex items-center justify-center
          text-white
          hover:bg-black/80
          transition-colors
        "
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
