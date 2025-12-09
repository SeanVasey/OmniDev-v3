'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Settings,
  Bell,
  Moon,
  Sun,
  Vibrate,
  MessageSquare,
  Image as ImageIcon,
  Palette,
  Shield,
  ArrowLeft,
  Save,
  Loader2,
  ChevronRight,
  Crown,
  Sparkles,
  LogOut,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/AuthContext';
import { useUIStore } from '@/stores/uiStore';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/database';
import { cn } from '@/lib/utils';

interface PreferencesFormData {
  theme: 'dark' | 'light';
  hapticsEnabled: boolean;
  notificationsEnabled: boolean;
  defaultModel: string;
  autoSaveChats: boolean;
  compactMode: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const { setTheme } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [_activeSection] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<PreferencesFormData>({
    theme: 'dark',
    hapticsEnabled: true,
    notificationsEnabled: true,
    defaultModel: 'gpt-5.1-chat',
    autoSaveChats: true,
    compactMode: false,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id || !isSupabaseConfigured()) return;

      setIsLoading(true);
      try {
        const supabase = createClient();
        const result: { data: any; error: any } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();

        if (!result.error && result.data) {
          const prefs = result.data.preferences;
          if (prefs) {
            setPreferences({
              theme: prefs.theme || 'dark',
              hapticsEnabled: prefs.haptics_enabled ?? true,
              notificationsEnabled: prefs.notifications_enabled ?? true,
              defaultModel: prefs.default_model || 'gpt-5.1-chat',
              autoSaveChats: prefs.auto_save_chats ?? true,
              compactMode: prefs.compact_mode ?? false,
            });

            // Sync theme with UI store
            if (prefs.theme) {
              setTheme(prefs.theme);
            }
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user?.id, setTheme]);

  const handleSave = async () => {
    if (!user?.id || !isSupabaseConfigured()) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await (supabase.from('profiles') as any).update({
        preferences: {
          theme: preferences.theme,
          haptics_enabled: preferences.hapticsEnabled,
          notifications_enabled: preferences.notificationsEnabled,
          default_model: preferences.defaultModel,
          auto_save_chats: preferences.autoSaveChats,
          compact_mode: preferences.compactMode,
        },
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);

      if (error) throw error;

      // Update UI theme
      setTheme(preferences.theme);
      document.body.setAttribute('data-theme', preferences.theme);

      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const updatePreference = <K extends keyof PreferencesFormData>(
    key: K,
    value: PreferencesFormData[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
      </div>
    );
  }

  const SettingRow = ({
    icon: Icon,
    label,
    description,
    children,
    onClick,
  }: {
    icon: any;
    label: string;
    description?: string;
    children?: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 p-4 rounded-xl transition-colors text-left',
        onClick && 'hover:bg-[var(--bg-elevated)]'
      )}
    >
      <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-[var(--accent-primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[var(--text-primary)]">{label}</p>
        {description && (
          <p className="text-sm text-[var(--text-muted)] truncate">{description}</p>
        )}
      </div>
      {children ? (
        children
      ) : onClick ? (
        <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
      ) : null}
    </button>
  );

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={cn(
        'w-12 h-7 rounded-full transition-colors flex-shrink-0',
        enabled ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-muted)]'
      )}
    >
      <motion.div
        className="w-5 h-5 rounded-full bg-white shadow-md"
        animate={{ x: enabled ? 26 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[var(--glass-bg)] border-b border-[var(--border-subtle)]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
            </button>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Settings</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all',
              'bg-[var(--accent-primary)] text-white hover:opacity-90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden"
        >
          <button
            onClick={() => router.push('/profile')}
            className="w-full p-5 flex items-center gap-4 hover:bg-[var(--bg-muted)]/50 transition-colors"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-hover)] flex items-center justify-center shadow-lg">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.full_name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-white" />
              )}
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-[var(--text-primary)]">
                {user?.full_name || 'Guest User'}
              </p>
              <p className="text-sm text-[var(--text-muted)]">{user?.email || 'Not signed in'}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
          </button>

          {/* Subscription Badge */}
          <div className="px-5 pb-5">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[var(--purple-900)]/30 to-[var(--purple-800)]/30 border border-[var(--purple-700)]/20">
              {user?.subscription_tier === 'pro' ? (
                <Crown className="w-5 h-5 text-yellow-500" />
              ) : (
                <Sparkles className="w-5 h-5 text-[var(--accent-primary)]" />
              )}
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {user?.subscription_tier === 'pro' ? 'Pro Plan' :
                 user?.subscription_tier === 'enterprise' ? 'Enterprise Plan' : 'Free Plan'}
              </span>
              {user?.subscription_tier === 'free' && (
                <button className="ml-auto text-sm font-medium text-[var(--accent-primary)]">
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </motion.section>

        {/* Appearance */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)]"
        >
          <h2 className="px-4 pt-4 pb-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Appearance
          </h2>

          <SettingRow
            icon={preferences.theme === 'dark' ? Moon : Sun}
            label="Theme"
            description={preferences.theme === 'dark' ? 'Dark mode' : 'Light mode'}
          >
            <div className="flex gap-2">
              <button
                onClick={() => updatePreference('theme', 'light')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  preferences.theme === 'light'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                )}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                onClick={() => updatePreference('theme', 'dark')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  preferences.theme === 'dark'
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-muted)] text-[var(--text-muted)]'
                )}
              >
                <Moon className="w-4 h-4" />
              </button>
            </div>
          </SettingRow>

          <SettingRow
            icon={Vibrate}
            label="Haptic Feedback"
            description="Vibration feedback on interactions"
          >
            <Toggle
              enabled={preferences.hapticsEnabled}
              onChange={() => updatePreference('hapticsEnabled', !preferences.hapticsEnabled)}
            />
          </SettingRow>

          <SettingRow
            icon={Settings}
            label="Compact Mode"
            description="Reduce spacing in the interface"
          >
            <Toggle
              enabled={preferences.compactMode}
              onChange={() => updatePreference('compactMode', !preferences.compactMode)}
            />
          </SettingRow>
        </motion.section>

        {/* Chat Settings */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)]"
        >
          <h2 className="px-4 pt-4 pb-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Chat Settings
          </h2>

          <SettingRow
            icon={MessageSquare}
            label="Auto-save Chats"
            description="Automatically save conversations"
          >
            <Toggle
              enabled={preferences.autoSaveChats}
              onChange={() => updatePreference('autoSaveChats', !preferences.autoSaveChats)}
            />
          </SettingRow>

          <SettingRow
            icon={Bell}
            label="Notifications"
            description="Push notifications for responses"
          >
            <Toggle
              enabled={preferences.notificationsEnabled}
              onChange={() => updatePreference('notificationsEnabled', !preferences.notificationsEnabled)}
            />
          </SettingRow>
        </motion.section>

        {/* Content Generation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)]"
        >
          <h2 className="px-4 pt-4 pb-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Content Generation
          </h2>

          <SettingRow
            icon={ImageIcon}
            label="Image Generation"
            description="Configure DALL-E and image settings"
            onClick={() => router.push('/settings/image-generation')}
          />

          <SettingRow
            icon={Palette}
            label="Default Styles"
            description="Set default styles for generations"
            onClick={() => router.push('/settings/default-styles')}
          />
        </motion.section>

        {/* Privacy & Security */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[var(--bg-elevated)] rounded-2xl border border-[var(--border-subtle)]"
        >
          <h2 className="px-4 pt-4 pb-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Privacy & Security
          </h2>

          <SettingRow
            icon={Shield}
            label="Privacy Settings"
            description="Manage your data and privacy"
            onClick={() => router.push('/settings/privacy')}
          />

          <SettingRow
            icon={Info}
            label="About OmniDev"
            description="Version 3.0.0"
            onClick={() => router.push('/settings/about')}
          />
        </motion.section>

        {/* Sign Out */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleSignOut}
            className="w-full p-4 rounded-2xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 flex items-center justify-center gap-3 text-[var(--color-error)] font-medium hover:bg-[var(--color-error)]/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </motion.section>
      </main>
    </div>
  );
}
