'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Folder,
  Palette,
  MessageSquare,
  Settings2,
  Save,
  Loader2,
  Trash2,
  Code,
  Paintbrush,
  Database,
  FileSearch,
  FileText,
  Image,
  Video,
  Music,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { updateWorkspace, deleteWorkspace } from '@/lib/supabase/database';
import { cn } from '@/lib/utils';
import type { Project, ProjectIcon, ProjectColor } from '@/types';

interface ProjectSettingsDialogProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (project: Project) => void;
  onDelete: (projectId: string) => void;
}

const COLORS: { name: string; value: ProjectColor; class: string }[] = [
  { name: 'Orange', value: 'orange', class: 'bg-orange-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
  { name: 'Red', value: 'red', class: 'bg-red-500' },
  { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
  { name: 'Teal', value: 'teal', class: 'bg-teal-500' },
];

const ICONS: { name: string; value: ProjectIcon; icon: any }[] = [
  { name: 'Folder', value: 'folder', icon: Folder },
  { name: 'Code', value: 'code', icon: Code },
  { name: 'Design', value: 'design', icon: Paintbrush },
  { name: 'Data', value: 'data', icon: Database },
  { name: 'Research', value: 'research', icon: FileSearch },
  { name: 'Writing', value: 'writing', icon: FileText },
  { name: 'Image', value: 'image', icon: Image },
  { name: 'Video', value: 'video', icon: Video },
  { name: 'Music', value: 'music', icon: Music },
  { name: 'Chat', value: 'chat', icon: MessageCircle },
];

export function ProjectSettingsDialog({
  project,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: ProjectSettingsDialogProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [color, setColor] = useState<ProjectColor>((project.color as ProjectColor) || 'orange');
  const [icon, setIcon] = useState<ProjectIcon>((project.icon as ProjectIcon) || 'folder');
  const [systemInstruction, setSystemInstruction] = useState('');
  const [characteristics, setCharacteristics] = useState<string[]>([]);
  const [newCharacteristic, setNewCharacteristic] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'instructions' | 'chats'>('general');

  useEffect(() => {
    if (isOpen) {
      setName(project.name);
      setDescription(project.description || '');
      setColor((project.color as ProjectColor) || 'orange');
      setIcon((project.icon as ProjectIcon) || 'folder');
      // Load system instruction from metadata if available
      const metadata = (project as any).metadata;
      if (metadata) {
        setSystemInstruction(metadata.system_instruction || '');
        setCharacteristics(metadata.characteristics || []);
      }
    }
  }, [isOpen, project]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateWorkspace(project.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        icon,
      });

      if (updated) {
        toast.success('Project updated successfully');
        onUpdate(updated);
        onClose();
      } else {
        throw new Error('Failed to update project');
      }
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteWorkspace(project.id);
      if (success) {
        toast.success('Project deleted');
        onDelete(project.id);
        onClose();
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const addCharacteristic = () => {
    if (newCharacteristic.trim() && !characteristics.includes(newCharacteristic.trim())) {
      setCharacteristics([...characteristics, newCharacteristic.trim()]);
      setNewCharacteristic('');
    }
  };

  const removeCharacteristic = (char: string) => {
    setCharacteristics(characteristics.filter(c => c !== char));
  };

  if (!isOpen) return null;

  const IconComponent = ICONS.find(i => i.value === icon)?.icon || Folder;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg max-h-[85vh] overflow-hidden bg-[var(--bg-primary)] rounded-2xl shadow-xl border border-[var(--border-subtle)] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  COLORS.find(c => c.value === color)?.class || 'bg-orange-500'
                )}
              >
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">Project Settings</h2>
                <p className="text-sm text-[var(--text-muted)]">{project.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-[var(--border-subtle)]">
            {[
              { id: 'general', label: 'General', icon: Settings2 },
              { id: 'instructions', label: 'Instructions', icon: MessageSquare },
              { id: 'chats', label: 'Chats', icon: MessageCircle },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && (
              <div className="space-y-5">
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
                    Description
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
                  <div className="flex gap-2 flex-wrap">
                    {COLORS.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setColor(c.value)}
                        className={cn(
                          'w-10 h-10 rounded-lg transition-all',
                          c.class,
                          color === c.value
                            ? 'ring-2 ring-offset-2 ring-offset-[var(--bg-primary)] ring-[var(--accent-primary)]'
                            : 'opacity-60 hover:opacity-100'
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
                          'p-2.5 rounded-xl transition-all',
                          icon === i.value
                            ? 'bg-[var(--accent-primary)] text-white'
                            : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]'
                        )}
                        title={i.name}
                      >
                        <i.icon className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'instructions' && (
              <div className="space-y-5">
                {/* System Instruction */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    System Instruction
                  </label>
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    Set a custom instruction for AI responses in this project
                  </p>
                  <textarea
                    value={systemInstruction}
                    onChange={(e) => setSystemInstruction(e.target.value)}
                    placeholder="e.g., You are a helpful coding assistant focused on React and TypeScript..."
                    rows={5}
                    className="w-full px-4 py-2.5 bg-[var(--bg-muted)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] resize-none"
                  />
                </div>

                {/* Characteristics */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Characteristics
                  </label>
                  <p className="text-xs text-[var(--text-muted)] mb-2">
                    Add keywords or traits for the AI to embody
                  </p>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newCharacteristic}
                      onChange={(e) => setNewCharacteristic(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCharacteristic()}
                      placeholder="Add characteristic..."
                      className="flex-1 px-4 py-2 bg-[var(--bg-muted)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]"
                    />
                    <button
                      onClick={addCharacteristic}
                      className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-xl hover:opacity-90 transition-opacity"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {characteristics.map((char) => (
                      <span
                        key={char}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] rounded-full text-sm"
                      >
                        {char}
                        <button
                          onClick={() => removeCharacteristic(char)}
                          className="hover:text-[var(--color-error)]"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                    {characteristics.length === 0 && (
                      <p className="text-sm text-[var(--text-muted)]">No characteristics added</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chats' && (
              <div className="space-y-4">
                <p className="text-sm text-[var(--text-muted)]">
                  Manage chats within this project. You can view, rename, or remove chats.
                </p>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <MessageCircle className="w-12 h-12 text-[var(--text-muted)]/30 mb-3" />
                  <p className="text-[var(--text-secondary)]">No chats in this project yet</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    Assign chats to this project from the chat list
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[var(--border-subtle)]">
            {!showDeleteConfirm ? (
              <>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2.5 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-xl transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4 inline mr-1" />
                  Delete
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-elevated)] transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !name.trim()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--accent-primary)] text-white rounded-xl hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-[var(--text-secondary)]">
                  Are you sure? This cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2.5 bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-xl hover:bg-[var(--bg-elevated)] transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-error)] text-white rounded-xl hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete Project
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
