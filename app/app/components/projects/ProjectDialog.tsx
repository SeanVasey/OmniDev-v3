'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { createWorkspace } from '@/lib/supabase/database';
import { cn } from '@/lib/utils';

interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectId: string) => void;
  userId: string;
}

const COLORS = [
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
  { name: 'Red', value: 'red', class: 'bg-red-500' },
];

const ICONS = [
  { name: 'Folder', value: 'folder' },
  { name: 'Code', value: 'code' },
  { name: 'Design', value: 'design' },
  { name: 'Data', value: 'data' },
  { name: 'Research', value: 'research' },
  { name: 'Writing', value: 'writing' },
];

export function ProjectDialog({ isOpen, onClose, onSuccess, userId }: ProjectDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('orange');
  const [icon, setIcon] = useState('folder');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setIsCreating(true);
    try {
      const project = await createWorkspace(userId, name.trim(), {
        description: description.trim() || undefined,
        color,
        icon,
      });

      if (!project) {
        throw new Error('Failed to create project');
      }

      const projectId = project.id;

      toast.success('Project created successfully');
      onSuccess(projectId);
      handleClose();
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setColor('orange');
    setIcon('folder');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-[var(--bg-primary)] rounded-2xl shadow-xl border border-[var(--border-subtle)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Create New Project</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Project"
                className="w-full px-4 py-2.5 bg-[var(--bg-muted)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                maxLength={50}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this project about?"
                rows={3}
                className="w-full px-4 py-2.5 bg-[var(--bg-muted)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
                maxLength={200}
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                <Palette className="w-4 h-4 inline mr-1" />
                Color
              </label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setColor(c.value)}
                    className={cn(
                      'w-10 h-10 rounded-lg transition-all',
                      c.class,
                      color === c.value ? 'ring-2 ring-offset-2 ring-[var(--accent-primary)]' : 'opacity-60 hover:opacity-100'
                    )}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                <Folder className="w-4 h-4 inline mr-1" />
                Icon
              </label>
              <div className="flex gap-2 flex-wrap">
                {ICONS.map((i) => (
                  <button
                    key={i.value}
                    onClick={() => setIcon(i.value)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm transition-all',
                      icon === i.value
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                    )}
                  >
                    {i.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-6 py-4 border-t border-[var(--border-subtle)]">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-elevated)] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating || !name.trim()}
              className="flex-1 px-4 py-2.5 bg-[var(--accent-primary)] text-white rounded-xl hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
