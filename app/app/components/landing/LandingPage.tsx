'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  MessageSquare,
  Code,
  Image as ImageIcon,
  Video,
  Search,
  Brain,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Zap,
  Shield,
  Globe,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/database';

// Provider brand colors and logos
const providers = [
  {
    id: 'openai',
    name: 'OpenAI',
    logo: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
      </svg>
    ),
    color: 'text-white',
    models: ['GPT-5.1', 'GPT-5.1 Codex', 'GPT-5 Pro', 'DALL·E 3', 'Sora 2'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    logo: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M17.304 3.541l-5.304 16.918-5.304-16.918h-3.196l7 21.918h3l7-21.918h-3.196z"/>
      </svg>
    ),
    color: 'text-[#D4A574]',
    models: ['Claude 4.5 Opus', 'Claude 4.5 Sonnet', 'Claude 4.5 Haiku'],
  },
  {
    id: 'google',
    name: 'Google DeepMind',
    logo: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
      </svg>
    ),
    color: 'text-[#4285F4]',
    models: ['Gemini 3 Pro', 'Gemini 2.5 Pro', 'Gemini 2.5 Flash'],
  },
  {
    id: 'xai',
    name: 'xAI',
    logo: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M2 2l8.5 10L2 22h3l7-8.5L19 22h3l-8.5-10L22 2h-3l-7 8.5L5 2H2z"/>
      </svg>
    ),
    color: 'text-white',
    models: ['Grok 4.1', 'Grok 4'],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    logo: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <rect x="2" y="2" width="6" height="6" rx="1"/>
        <rect x="9" y="2" width="6" height="6" rx="1"/>
        <rect x="16" y="2" width="6" height="6" rx="1"/>
        <rect x="2" y="9" width="6" height="6" rx="1"/>
        <rect x="16" y="9" width="6" height="6" rx="1"/>
        <rect x="2" y="16" width="6" height="6" rx="1"/>
        <rect x="9" y="16" width="6" height="6" rx="1"/>
        <rect x="16" y="16" width="6" height="6" rx="1"/>
      </svg>
    ),
    color: 'text-[#FF7000]',
    models: ['Mistral Large'],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    logo: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2v-4h2v4zm0-6h-2V7h2v4z"/>
      </svg>
    ),
    color: 'text-[#1FB8CD]',
    models: ['Sonar Large'],
  },
  {
    id: 'meta',
    name: 'Meta',
    logo: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="currentColor">
        <path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.94 3.61 9.04 8.33 9.8v-6.93h-2.5v-2.87h2.5v-2.19c0-2.47 1.47-3.83 3.72-3.83 1.08 0 2.21.19 2.21.19v2.43h-1.25c-1.23 0-1.61.76-1.61 1.54v1.86h2.74l-.44 2.87h-2.3v6.93c4.72-.76 8.33-4.86 8.33-9.8 0-5.5-4.46-9.96-9.96-9.96z"/>
      </svg>
    ),
    color: 'text-[#0668E1]',
    models: ['LLaMA 3.1 70B'],
  },
];

const features = [
  {
    icon: MessageSquare,
    title: 'Advanced Chat',
    description: 'Natural conversations with the most capable AI models from multiple providers.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Code,
    title: 'Code Generation',
    description: 'Write, debug, and explain code with specialized coding models like Codex.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: ImageIcon,
    title: 'Image Generation',
    description: 'Create stunning visuals with DALL·E 3 and other image generation models.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Video,
    title: 'Video Creation',
    description: 'Generate videos from text with Sora 2 and next-gen video AI.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Search,
    title: 'Deep Research',
    description: 'Doctoral-level research capabilities with comprehensive analysis and citations.',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    icon: Brain,
    title: 'Agentic Work',
    description: 'Let AI agents complete complex multi-step tasks autonomously.',
    color: 'from-teal-500 to-cyan-500',
  },
];

const capabilities = [
  { icon: Zap, text: 'Real-time streaming responses' },
  { icon: Shield, text: 'Enterprise-grade security' },
  { icon: Globe, text: 'Multi-provider support' },
  { icon: RefreshCw, text: 'Always updating models' },
];

export function LandingPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured()) {
      setError('Authentication is not configured. Please contact support.');
      return;
    }
    setIsGoogleLoading(true);
    setError(null);
    try {
      const supabase = createClient();
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

  const handleAppleLogin = async () => {
    if (!isSupabaseConfigured()) {
      setError('Authentication is not configured. Please contact support.');
      return;
    }
    setIsAppleLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
        setIsAppleLoading(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsAppleLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    if (!isSupabaseConfigured()) {
      setError('Authentication is not configured. Please contact support.');
      return;
    }
    setIsMicrosoftLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'openid profile email',
        },
      });
      if (error) {
        setError(error.message);
        setIsMicrosoftLoading(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setIsMicrosoftLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--accent-primary)]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute -bottom-40 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-dark)] flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-[var(--text-primary)]">OmniDev</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-primary-dark)] transition-colors shadow-lg shadow-[var(--accent-primary)]/30"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 pt-16 pb-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-sm mb-8">
            <RefreshCw className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-sm text-[var(--text-secondary)]">Models always updating</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[var(--text-primary)] mb-6 leading-tight">
            One Interface.
            <br />
            <span className="bg-gradient-to-r from-[var(--accent-primary)] via-blue-400 to-purple-500 bg-clip-text text-transparent">
              Every AI Model.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto mb-12">
            Access GPT-5, Claude, Gemini, Grok, and more from a single, beautiful interface.
            Text generation, image creation, video, coding, and doctoral-level research — all in one place.
          </p>

          {/* Capability pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {capabilities.map((cap, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
              >
                <cap.icon className="w-4 h-4 text-[var(--accent-primary)]" />
                <span className="text-sm text-[var(--text-secondary)]">{cap.text}</span>
              </motion.div>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white text-gray-800 font-medium hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAppleLogin}
              disabled={isAppleLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-black text-white font-medium hover:bg-gray-900 transition-all shadow-xl hover:shadow-2xl disabled:opacity-50"
            >
              {isAppleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span>Continue with Apple</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMicrosoftLogin}
              disabled={isMicrosoftLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-[#2F2F2F] text-white font-medium hover:bg-[#3F3F3F] transition-all shadow-xl hover:shadow-2xl disabled:opacity-50"
            >
              {isMicrosoftLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#F25022" d="M1 1h10v10H1z"/>
                    <path fill="#00A4EF" d="M1 13h10v10H1z"/>
                    <path fill="#7FBA00" d="M13 1h10v10H13z"/>
                    <path fill="#FFB900" d="M13 13h10v10H13z"/>
                  </svg>
                  <span>Continue with Microsoft</span>
                </>
              )}
            </motion.button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[var(--color-error)] text-sm mb-4"
            >
              {error}
            </motion.p>
          )}

          <p className="text-sm text-[var(--text-muted)]">
            Or{' '}
            <Link href="/signup" className="text-[var(--accent-primary)] hover:underline">
              create an account with email
            </Link>
          </p>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Everything you need, unified
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
            From creative writing to doctoral-level research, OmniDev provides specialized AI capabilities for every task.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-6 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-sm hover:border-[var(--accent-primary)]/50 transition-all hover:shadow-xl hover:shadow-[var(--accent-primary)]/10"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{feature.title}</h3>
              <p className="text-[var(--text-secondary)] text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Models Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24 bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-sm mb-6">
              <RefreshCw className="w-4 h-4 text-[var(--accent-primary)] animate-spin-slow" />
              <span className="text-sm text-[var(--text-secondary)]">Models continuously updated</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
              Industry-leading AI providers
            </h2>
            <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
              Access the latest models from the world&apos;s top AI companies. We add new models as they&apos;re released.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {providers.map((provider, i) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="relative"
              >
                <button
                  onClick={() => setExpandedProvider(expandedProvider === provider.id ? null : provider.id)}
                  className="w-full p-5 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-sm hover:border-[var(--accent-primary)]/50 transition-all text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={provider.color}>
                        {provider.logo}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--text-primary)]">{provider.name}</h3>
                        <p className="text-xs text-[var(--text-muted)]">{provider.models.length} models</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${expandedProvider === provider.id ? 'rotate-180' : ''}`} />
                  </div>

                  <AnimatePresence>
                    {expandedProvider === provider.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 mt-4 border-t border-[var(--border-subtle)]">
                          <ul className="space-y-2">
                            {provider.models.map((model) => (
                              <li key={model} className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" />
                                {model}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-6">
            Ready to get started?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Create your free account and start using the most powerful AI models today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[var(--accent-primary)] text-white font-semibold hover:bg-[var(--accent-primary-dark)] transition-colors shadow-xl shadow-[var(--accent-primary)]/30"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold hover:bg-[var(--bg-muted)] transition-colors border border-[var(--border-default)]"
            >
              Sign In
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 lg:px-12 py-12 border-t border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-dark)] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-[var(--text-primary)] font-semibold">OmniDev</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
            <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Terms</a>
            <a href="#" className="hover:text-[var(--text-secondary)] transition-colors">Contact</a>
          </div>
          <p className="text-sm text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} OmniDev. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
