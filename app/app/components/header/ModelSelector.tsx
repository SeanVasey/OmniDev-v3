'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, ChevronDown, Ghost, User, LogOut, Settings, Crown } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { HAPTIC_TRIGGERS } from '@/lib/haptics/triggers';
import { cn } from '@/lib/utils';
import { getAllModels } from '@/lib/ai/models';
import { ProviderIcon } from '@/components/ui/ProviderIcon';
import { useAuth } from '@/lib/auth/AuthContext';
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
  const router = useRouter();
  const { trigger } = useHaptics();
  const { user, isAuthenticated, isGuest, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const allModels = getAllModels();

  // Group models by provider
  const modelsByProvider = allModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, AIModel[]>);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    if (isDropdownOpen || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen, isUserMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

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
                  <div className="px-3 py-2 flex items-center gap-2">
                    <ProviderIcon provider={provider} size={16} />
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                      {providerNames[provider] || provider}
                    </span>
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
                          {model.supportsVideoGen && ' • Video Gen'}
                          {model.supportsThinking && ' • Thinking'}
                          {model.supportsResearch && ' • Research'}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
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

          {/* User Profile / Auth Button */}
          <div className="relative" ref={userMenuRef}>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--border-default)] hover:border-[var(--purple-500)] transition-colors"
                >
                  {user?.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.full_name || 'User'}
                      width={40}
                      height={40}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--purple-600)] to-[var(--purple-700)] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl shadow-xl overflow-hidden z-50">
                    {/* User Info Header */}
                    <div className="p-4 border-b border-[var(--border-subtle)]">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[var(--purple-600)] to-[var(--purple-700)] flex items-center justify-center">
                          {user?.avatar_url ? (
                            <Image
                              src={user.avatar_url}
                              alt={user.full_name || 'User'}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <User className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[var(--text-primary)] truncate">
                            {user?.full_name || 'User'}
                          </p>
                          <p className="text-sm text-[var(--text-muted)] truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      {/* Subscription Badge */}
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--purple-900)]/50 text-[var(--purple-400)] text-xs font-medium">
                        <Crown className="w-3 h-3" />
                        <span>{user?.subscription_tier === 'pro' ? 'Pro' : user?.subscription_tier === 'enterprise' ? 'Enterprise' : 'Free'} Plan</span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)] transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Profile Settings</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--purple-600)] to-[var(--purple-500)] text-white text-sm font-medium hover:from-[var(--purple-500)] hover:to-[var(--purple-400)] transition-all shadow-lg shadow-[var(--purple-glow)]/30"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
