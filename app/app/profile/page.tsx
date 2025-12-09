'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Camera,
  Save,
  Loader2,
  ArrowLeft,
  Crown,
  Shield,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/database';
import type { User as UserType, BillingAddress } from '@/types';

interface ProfileFormData {
  fullName: string;
  email: string;
  occupation: string;
  mobileNumber: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  avatar: File | null;
  avatarPreview: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserType | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    email: '',
    occupation: '',
    mobileNumber: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    avatar: null,
    avatarPreview: null,
  });

  // Fetch full profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated || !user?.id || !isSupabaseConfigured()) return;

      setIsLoading(true);
      try {
        const supabase = createClient();
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (result.error) throw result.error;

        const data = result.data as any;
        if (data) {
          const billingAddress = (data.billing_address as BillingAddress) || {};
          setProfile({
            id: data.id,
            email: data.email || '',
            full_name: data.full_name || '',
            avatar_url: data.avatar_url || undefined,
            occupation: data.occupation || undefined,
            mobile_number: data.mobile_number || undefined,
            billing_address: billingAddress,
            subscription_tier: data.subscription_tier as UserType['subscription_tier'],
            subscription_status: data.subscription_status as UserType['subscription_status'],
            google_id: data.google_id || undefined,
          });

          setFormData({
            fullName: data.full_name || '',
            email: data.email || '',
            occupation: data.occupation || '',
            mobileNumber: data.mobile_number || '',
            street: billingAddress.street || '',
            city: billingAddress.city || '',
            state: billingAddress.state || '',
            postalCode: billingAddress.postal_code || '',
            country: billingAddress.country || '',
            avatar: null,
            avatarPreview: data.avatar_url || null,
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, user?.id]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const updateFormData = (field: keyof ProfileFormData, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateFormData('avatar', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        updateFormData('avatarPreview', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!user?.id || !isSupabaseConfigured()) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();

      // Upload avatar if changed
      let avatarUrl = profile?.avatar_url;
      if (formData.avatar) {
        const fileExt = formData.avatar.name.split('.').pop();
        const fileName = `${user.id}/avatar.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, formData.avatar, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
          avatarUrl = urlData.publicUrl;
        }
      }

      // Update profile - use type assertion for extended schema
      const { error: updateError } = await (supabase
        .from('profiles') as any)
        .update({
          full_name: formData.fullName,
          avatar_url: avatarUrl,
          occupation: formData.occupation,
          mobile_number: formData.mobileNumber,
          billing_address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const getSubscriptionBadge = () => {
    const tier = profile?.subscription_tier || 'free';
    const badges = {
      free: { icon: Sparkles, text: 'Free Plan', className: 'bg-[var(--grey-700)] text-[var(--text-secondary)]' },
      pro: { icon: Crown, text: 'Pro Plan', className: 'bg-gradient-to-r from-[var(--purple-600)] to-[var(--purple-500)] text-white' },
      enterprise: { icon: Shield, text: 'Enterprise', className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' },
    };
    return badges[tier] || badges.free;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-8 h-8 text-[var(--purple-500)] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const badge = getSubscriptionBadge();
  const BadgeIcon = badge.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-muted)]">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--purple-600)]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--purple-500)]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to chat</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Profile Header */}
          <div className="relative h-32 bg-gradient-to-r from-[var(--purple-700)] via-[var(--purple-600)] to-[var(--purple-500)]">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
          </div>

          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-32 h-32 rounded-full bg-[var(--bg-elevated)] border-4 border-[var(--glass-bg)] cursor-pointer overflow-hidden group shadow-xl"
              >
                {formData.avatarPreview ? (
                  <Image
                    src={formData.avatarPreview}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--purple-600)] to-[var(--purple-700)]">
                    <User className="w-12 h-12 text-white/80" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* Name and Badge */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                  {formData.fullName || 'Your Name'}
                </h1>
                <p className="text-[var(--text-secondary)]">{formData.email}</p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${badge.className}`}>
                <BadgeIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{badge.text}</span>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/20"
              >
                <p className="text-sm text-[var(--color-success)]">{success}</p>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20"
              >
                <p className="text-sm text-[var(--color-error)]">{error}</p>
              </motion.div>
            )}

            {/* Form Sections */}
            <div className="space-y-8">
              {/* Personal Information */}
              <section>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[var(--purple-500)]" />
                  Personal Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => updateFormData('fullName', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50 focus:border-[var(--purple-500)] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Occupation
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        value={formData.occupation}
                        onChange={(e) => updateFormData('occupation', e.target.value)}
                        placeholder="Software Engineer"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50 focus:border-[var(--purple-500)] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                      <input
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={(e) => updateFormData('mobileNumber', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50 focus:border-[var(--purple-500)] transition-all"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Billing Address */}
              <section>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[var(--purple-500)]" />
                  Billing Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => updateFormData('street', e.target.value)}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50 focus:border-[var(--purple-500)] transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => updateFormData('city', e.target.value)}
                        placeholder="New York"
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50 focus:border-[var(--purple-500)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => updateFormData('state', e.target.value)}
                        placeholder="NY"
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50 focus:border-[var(--purple-500)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => updateFormData('postalCode', e.target.value)}
                        placeholder="10001"
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50 focus:border-[var(--purple-500)] transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => updateFormData('country', e.target.value)}
                        placeholder="United States"
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50 focus:border-[var(--purple-500)] transition-all"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Subscription Info */}
              <section>
                <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-[var(--purple-500)]" />
                  Subscription
                </h2>
                <div className="p-6 rounded-2xl bg-gradient-to-r from-[var(--purple-900)]/50 to-[var(--purple-800)]/50 border border-[var(--purple-700)]/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[var(--text-primary)] font-medium">
                        {profile?.subscription_tier === 'free' ? 'Free Plan' :
                         profile?.subscription_tier === 'pro' ? 'Pro Plan' : 'Enterprise Plan'}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">
                        {profile?.subscription_tier === 'free'
                          ? 'Upgrade to unlock premium features'
                          : 'Thank you for being a subscriber!'}
                      </p>
                    </div>
                    {profile?.subscription_tier === 'free' && (
                      <button className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--purple-600)] to-[var(--purple-500)] text-white font-medium hover:from-[var(--purple-500)] hover:to-[var(--purple-400)] transition-all shadow-lg shadow-[var(--purple-glow)]">
                        Upgrade
                      </button>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[var(--purple-600)] to-[var(--purple-500)] text-white font-semibold hover:from-[var(--purple-500)] hover:to-[var(--purple-400)] transition-all shadow-lg shadow-[var(--purple-glow)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
