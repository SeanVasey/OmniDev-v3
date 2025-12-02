'use client';

import { useState } from 'react';
import { Menu, ChevronDown, Ghost } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { HAPTIC_TRIGGERS } from '@/lib/haptics/triggers';
import { cn } from '@/lib/utils';
import type { AIModel } from '@/types';

interface ModelSelectorProps {
  currentModel: AIModel;
  isIncognito: boolean;
  onIncognitoToggle: () => void;
  onMenuOpen: () => void;
}

export function ModelSelector({
  currentModel,
  isIncognito,
  onIncognitoToggle,
  onMenuOpen,
}: ModelSelectorProps) {
  const { trigger } = useHaptics();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="
      fixed top-0 left-0 right-0
      pt-[var(--safe-area-top)]
      z-[var(--z-sticky)]
    ">
      {/* Gradient fade */}
      <div className="
        absolute inset-0
        bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-transparent
        pointer-events-none
      " />

      {/* Header content */}
      <div className="
        relative
        flex items-center justify-between
        px-4 py-3
      ">
        {/* Menu Button (Mobile) */}
        <button
          onClick={() => {
            trigger(HAPTIC_TRIGGERS.sidebar.open);
            onMenuOpen();
          }}
          className="
            icon-button
            border border-[var(--border-default)]
            text-[var(--text-muted)]
            hover:text-[var(--text-primary)]
            md:hidden
          "
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Model Selector */}
        <button
          onClick={() => {
            trigger(HAPTIC_TRIGGERS.modelSelector.open);
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className="flex items-center gap-2"
        >
          <span className="text-xl font-semibold text-[var(--text-primary)]">
            {currentModel.name}
          </span>
          <ChevronDown className={cn(
            "w-5 h-5 text-[var(--text-muted)] transition-transform duration-200",
            isDropdownOpen && "rotate-180"
          )} />
          {isIncognito && (
            <span className="text-sm text-[var(--text-muted)]">
              Incognito chat
            </span>
          )}
        </button>

        {/* Ghost Toggle */}
        <button
          onClick={() => {
            trigger(HAPTIC_TRIGGERS.modeToggle.enterIncognito);
            onIncognitoToggle();
          }}
          className={cn(
            "icon-button border transition-all",
            isIncognito
              ? "border-[var(--text-muted)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
              : "border-[var(--border-default)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          )}
        >
          <Ghost className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
