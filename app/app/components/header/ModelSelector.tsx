'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, Ghost, User, LogOut, Settings, Crown, Sparkles } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { HAPTIC_TRIGGERS } from '@/lib/haptics/triggers';
import { cn } from '@/lib/utils';
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
  currentModel: _currentModel,
  isIncognito,
  onModelChange: _onModelChange,
  onIncognitoToggle,
  onMenuOpen,
}: ModelSelectorProps) {
  const router = useRouter();
  const { trigger } = useHaptics();
  const { user, isAuthenticated, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
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
        {/* Left: Menu Button (Mobile) */}
        <button
          onClick={() => {
            trigger(HAPTIC_TRIGGERS.sidebar.open);
            onMenuOpen();
          }}
          className="
            w-10 h-10
            inline-flex items-center justify-center
            rounded-xl
            bg-[var(--bg-elevated)]/80
            backdrop-blur-xl
            border border-[var(--border-default)]/50
            text-[var(--text-muted)]
            hover:text-[var(--text-primary)]
            hover:bg-[var(--bg-elevated)]
            shadow-lg shadow-black/20
            transition-all duration-200
            md:hidden
          "
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center: Brand / App Name */}
        <div className="flex items-center gap-2">
          <div className="
            w-8 h-8
            rounded-xl
            bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-hover)]
            flex items-center justify-center
            shadow-lg shadow-[var(--purple-glow)]/30
          ">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-[var(--text-primary)]">
            OmniDev
          </span>
          {isIncognito && (
            <span className="
              px-2 py-0.5
              text-xs font-medium
              text-[var(--text-muted)]
              bg-[var(--bg-muted)]/50
              rounded-full
              border border-[var(--border-subtle)]
            ">
              Incognito
            </span>
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
              "w-10 h-10 inline-flex items-center justify-center rounded-xl transition-all duration-200",
              "backdrop-blur-xl shadow-lg shadow-black/20",
              isIncognito
                ? "bg-[var(--bg-elevated)] border border-[var(--text-muted)]/30 text-[var(--text-primary)]"
                : "bg-[var(--bg-elevated)]/80 border border-[var(--border-default)]/50 text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
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
                  className="
                    w-10 h-10
                    rounded-xl
                    overflow-hidden
                    border-2 border-[var(--border-default)]/50
                    hover:border-[var(--accent-primary)]/50
                    transition-all duration-200
                    shadow-lg shadow-black/20
                  "
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
                    <div className="w-full h-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-hover)] flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="
                    absolute right-0 top-full mt-2
                    w-72
                    bg-[var(--bg-elevated)]/98
                    backdrop-blur-2xl
                    border border-[var(--border-default)]/60
                    rounded-2xl
                    shadow-2xl shadow-black/50
                    overflow-hidden
                    z-50
                  ">
                    {/* User Info Header */}
                    <div className="p-4 border-b border-[var(--border-subtle)]/30">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-hover)] flex items-center justify-center shadow-lg">
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
                      <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-xs font-medium border border-[var(--accent-primary)]/20">
                        <Crown className="w-3 h-3" />
                        <span>{user?.subscription_tier === 'pro' ? 'Pro' : user?.subscription_tier === 'enterprise' ? 'Enterprise' : 'Free'} Plan</span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]/50 transition-all"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Profile Settings</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-all"
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
                className="
                  px-4 py-2
                  rounded-xl
                  bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-hover)]
                  text-white text-sm font-medium
                  hover:shadow-lg hover:shadow-[var(--purple-glow)]/40
                  transition-all duration-200
                "
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
