'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  User,
  Phone,
  Briefcase,
  MapPin,
  Camera,
  ArrowRight,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/database';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
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

const initialFormData: FormData = {
  email: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  occupation: '',
  mobileNumber: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  avatar: null,
  avatarPreview: null,
};

const steps = [
  { id: 1, title: 'Account', description: 'Create your login credentials' },
  { id: 2, title: 'Profile', description: 'Tell us about yourself' },
  { id: 3, title: 'Contact', description: 'Add your contact details' },
];

export default function SignupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFormData = (field: keyof FormData, value: string | File | null) => {
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

  const validateStep = (step: number): boolean => {
    setError(null);
    switch (step) {
      case 1:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          setError('Please fill in all required fields');
          return false;
        }
        if (formData.password.length < 8) {
          setError('Password must be at least 8 characters');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        return true;
      case 2:
        if (!formData.fullName) {
          setError('Please enter your full name');
          return false;
        }
        return true;
      case 3:
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    if (!isSupabaseConfigured()) {
      setError('Authentication is not configured. Please contact support.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      if (!supabase) {
        setError('Supabase client not available');
        setIsLoading(false);
        return;
      }

      // Sign up the user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            occupation: formData.occupation,
            mobile_number: formData.mobileNumber,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Upload avatar if provided
        let avatarUrl: string | null = null;
        if (formData.avatar) {
          const fileExt = formData.avatar.name.split('.').pop();
          const fileName = `${data.user.id}/avatar.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, formData.avatar, { upsert: true });

          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
            avatarUrl = urlData.publicUrl;
          }
        }

        // Create profile - use type assertion for extended schema
        await (supabase.from('profiles') as any).insert({
          id: data.user.id,
          email: formData.email,
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
          subscription_tier: 'free',
          subscription_status: 'active',
          preferences: {
            theme: 'dark',
            haptics_enabled: true,
            notifications_enabled: true,
          },
        });

        router.push('/');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    if (!isSupabaseConfigured()) {
      setError('Authentication is not configured. Please contact support.');
      return;
    }

    setIsGoogleLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      if (!supabase) {
        setError('Supabase client not available');
        setIsGoogleLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        setIsGoogleLoading(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-muted)] p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--purple-600)]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[var(--purple-500)]/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--purple-700)]/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-3xl p-8 shadow-2xl">
          {/* Logo and Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--purple-500)] to-[var(--purple-700)] mb-4 shadow-lg shadow-[var(--purple-glow)]"
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Create your account</h1>
            <p className="text-[var(--text-secondary)] mt-1">Start your AI journey with OmniDev</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor:
                        currentStep >= step.id
                          ? 'var(--purple-600)'
                          : 'var(--bg-elevated)',
                      borderColor:
                        currentStep >= step.id
                          ? 'var(--purple-500)'
                          : 'var(--border-default)',
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      currentStep >= step.id
                        ? 'shadow-lg shadow-[var(--purple-glow)]'
                        : ''
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          currentStep >= step.id
                            ? 'text-white'
                            : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {step.id}
                      </span>
                    )}
                  </motion.div>
                  <span
                    className={`text-xs mt-1.5 font-medium ${
                      currentStep >= step.id
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-2 mt-[-18px] ${
                      currentStep > step.id
                        ? 'bg-[var(--purple-500)]'
                        : 'bg-[var(--border-default)]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-xl bg-[var(--color-error)]/10 border border-[var(--color-error)]/20"
              >
                <p className="text-sm text-[var(--color-error)]">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Sign Up (only on first step) */}
          {currentStep === 1 && (
            <>
              <button
                onClick={handleGoogleSignup}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white text-gray-800 font-medium hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-subtle)]" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[var(--glass-bg)] text-[var(--text-muted)]">
                    or create with email
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Form Steps */}
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {/* Step 1: Account Credentials */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Email address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50 focus:border-[var(--purple-500)] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        placeholder="Min. 8 characters"
                        required
                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50 focus:border-[var(--purple-500)] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Confirm password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50 focus:border-[var(--purple-500)] transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Profile Information */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Avatar Upload */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-full bg-[var(--bg-elevated)] border-2 border-dashed border-[var(--border-default)] flex items-center justify-center cursor-pointer hover:border-[var(--purple-500)] transition-colors overflow-hidden"
                      >
                        {formData.avatarPreview ? (
                          <Image
                            src={formData.avatarPreview}
                            alt="Avatar preview"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Camera className="w-8 h-8 text-[var(--text-muted)]" />
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[var(--purple-600)] flex items-center justify-center cursor-pointer shadow-lg">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Full name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => updateFormData('fullName', e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50 focus:border-[var(--purple-500)] transition-all"
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
                      Mobile number
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
                </motion.div>
              )}

              {/* Step 3: Contact & Billing */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-[var(--text-muted)] mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Billing address (optional, for future subscriptions)
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                      Street address
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => updateFormData('street', e.target.value)}
                      placeholder="123 Main Street"
                      className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50 focus:border-[var(--purple-500)] transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => updateFormData('state', e.target.value)}
                        placeholder="NY"
                        className="w-full px-4 py-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)]/50 focus:border-[var(--purple-500)] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                        Postal code
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3.5 rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)] font-medium hover:bg-[var(--bg-elevated)] transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[var(--purple-600)] to-[var(--purple-500)] text-white font-semibold hover:from-[var(--purple-500)] hover:to-[var(--purple-400)] transition-all shadow-lg shadow-[var(--purple-glow)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[var(--purple-600)] to-[var(--purple-500)] text-white font-semibold hover:from-[var(--purple-500)] hover:to-[var(--purple-400)] transition-all shadow-lg shadow-[var(--purple-glow)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    'Create account'
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Sign In Link */}
          <p className="mt-6 text-center text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-[var(--purple-400)] hover:text-[var(--purple-300)] font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-[var(--text-muted)] mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}
