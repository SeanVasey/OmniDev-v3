'use client';

import { useState, useEffect, useRef } from 'react';
import { Menu, ChevronDown, Ghost } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { HAPTIC_TRIGGERS } from '@/lib/haptics/triggers';
import { cn } from '@/lib/utils';
import { getAllModels } from '@/lib/ai/models';
import type { AIModel } from '@/types';

interface ModelSelectorProps {
  currentModel: AIModel;
  isIncognito: boolean;
  onModelChange: (model: AIModel) => void;
  onIncognitoToggle: () => void;
  onMenuOpen: () => void;
}

export function ModelSelector({
  currentModel,
  isIncognito,
  onModelChange,
  onIncognitoToggle,
  onMenuOpen,
}: ModelSelectorProps) {
  const { trigger } = useHaptics();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const allModels = getAllModels();

  // Group models by provider
  const modelsByProvider = allModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleModelSelect = (model: AIModel) => {
    trigger(HAPTIC_TRIGGERS.modelSelector.select);
    onModelChange(model);
    setIsDropdownOpen(false);
  };

  const providerNames: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
    xai: 'xAI',
    mistral: 'Mistral AI',
    perplexity: 'Perplexity',
    meta: 'Meta',
    local: 'Local',
  };

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
        <div className="relative" ref={dropdownRef}>
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

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="
              absolute top-full mt-2 left-1/2 -translate-x-1/2
              w-80 max-h-96 overflow-y-auto
              bg-[var(--bg-elevated)] border border-[var(--border-default)]
              rounded-2xl shadow-xl
              z-50
            ">
              {Object.entries(modelsByProvider).map(([provider, models]) => (
                <div key={provider} className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    {providerNames[provider] || provider}
                  </div>
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model)}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg text-left transition-colors",
                        "hover:bg-[var(--bg-muted)]",
                        currentModel.id === model.id && "bg-[var(--accent-primary)] text-white"
                      )}
                    >
                      <div className="font-medium text-sm">{model.name}</div>
                      {model.contextWindow > 0 && (
                        <div className="text-xs text-[var(--text-muted)] mt-0.5">
                          {(model.contextWindow / 1000).toFixed(0)}K context
                          {model.supportsVision && ' • Vision'}
                          {model.supportsImageGen && ' • Image Gen'}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

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
