'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ChevronDown, Ghost } from 'lucide-react';
import { useHaptics, HAPTIC_TRIGGERS } from '@/hooks/useHaptics';
import { cn } from '@/lib/utils';
import { ModelDropdown } from './ModelDropdown';
import type { AIModel } from '@/types';

interface ModelSelectorProps {
  currentModel: AIModel;
  isIncognito: boolean;
  onModelChange: (model: AIModel) => void;
  onIncognitoToggle: () => void;
  onMenuOpen: () => void;
}

export function ModelSelector({ currentModel, isIncognito, onModelChange, onIncognitoToggle, onMenuOpen }: ModelSelectorProps) {
  const { trigger } = useHaptics();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 pt-[var(--safe-area-top)] z-[var(--z-sticky)]">
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-transparent pointer-events-none" />

      <div className="relative flex items-center justify-between px-4 py-3">
        <button
          onClick={() => {
            trigger(HAPTIC_TRIGGERS.sidebar.open);
            onMenuOpen();
          }}
          className="icon-button border border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-primary)] md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            trigger(HAPTIC_TRIGGERS.modelSelector.open);
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className="flex items-center gap-2"
        >
          <span className="text-xl font-semibold text-[var(--text-primary)]">{currentModel.name}</span>
          <ChevronDown
            className={cn(
              'w-5 h-5 text-[var(--text-muted)] transition-transform duration-200',
              isDropdownOpen && 'rotate-180'
            )}
          />
          {isIncognito && <span className="text-sm text-[var(--text-muted)]">Incognito chat</span>}
        </button>

        <button
          onClick={() => {
            trigger(HAPTIC_TRIGGERS.modeToggle.enterIncognito);
            onIncognitoToggle();
          }}
          className={cn(
            'icon-button border transition-all',
            isIncognito
              ? 'border-[var(--text-muted)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
              : 'border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          )}
        >
          <Ghost className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {isDropdownOpen && (
          <ModelDropdown
            currentModel={currentModel}
            onSelect={(model) => {
              trigger(HAPTIC_TRIGGERS.modelSelector.select);
              onModelChange(model);
              setIsDropdownOpen(false);
            }}
            onClose={() => {
              trigger(HAPTIC_TRIGGERS.modelSelector.close);
              setIsDropdownOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
