'use client';

import { motion } from 'framer-motion';
import { useHaptics, HAPTIC_TRIGGERS } from '@/hooks/useHaptics';
import type { AIModel } from '@/types';

interface ModelDropdownProps {
  currentModel: AIModel;
  onSelect: (model: AIModel) => void;
  onClose: () => void;
}

const models: AIModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Balanced generalist' },
  { id: 'claude-3.5', name: 'Claude 3.5', description: 'Long context reasoning' },
  { id: 'qwen-vl', name: 'Qwen-VL', description: 'Vision + language creative' },
];

export function ModelDropdown({ currentModel, onSelect, onClose }: ModelDropdownProps) {
  const { trigger } = useHaptics();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="absolute left-4 right-4 mt-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg-elevated)] backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      {models.map((model) => {
        const active = model.id === currentModel.id;
        return (
          <button
            key={model.id}
            onClick={() => {
              trigger(HAPTIC_TRIGGERS.modelSelector.select);
              onSelect(model);
            }}
            className={`flex w-full items-center justify-between px-4 py-4 text-left transition-colors touch-target ${
              active ? 'bg-[var(--purple-600)]/15 text-[var(--text-primary)]' : 'hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
            }`}
          >
            <div>
              <div className="text-base font-semibold">{model.name}</div>
              <div className="text-sm text-[var(--text-muted)]">{model.description}</div>
            </div>
            {active && <span className="text-xs px-2 py-1 rounded-full bg-[var(--purple-600)]/20 text-[var(--purple-400)]">Active</span>}
          </button>
        );
      })}
      <button
        onClick={() => {
          trigger(HAPTIC_TRIGGERS.modelSelector.close);
          onClose();
        }}
        className="w-full px-4 py-3 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-elevated)]"
      >
        Close
      </button>
    </motion.div>
  );
}
