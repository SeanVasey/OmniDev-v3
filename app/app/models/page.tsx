'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Cpu,
  Eye,
  Image as ImageIcon,
  Video,
  Brain,
  Globe,
  Sparkles,
  Zap,
  Star,
  MessageSquare,
  Code,
  Lightbulb,
} from 'lucide-react';
import { AI_MODELS, getAllModels } from '@/lib/ai/models';
import { MODEL_PRICING } from '@/types';
import { cn } from '@/lib/utils';
import type { AIModel } from '@/types';

// Provider metadata
const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    color: '#00A67E',
    description: 'Industry leader in large language models. Known for GPT series and DALL-E.',
    website: 'https://openai.com',
    logo: '/logos/openai.svg',
  },
  anthropic: {
    name: 'Anthropic',
    color: '#D4A574',
    description: 'AI safety focused company. Creator of Claude, known for helpfulness and harmlessness.',
    website: 'https://anthropic.com',
    logo: '/logos/anthropic.svg',
  },
  google: {
    name: 'Google',
    color: '#4285F4',
    description: 'Tech giant with cutting-edge AI research. Gemini models offer multimodal capabilities.',
    website: 'https://ai.google',
    logo: '/logos/google.svg',
  },
  xai: {
    name: 'xAI',
    color: '#1DA1F2',
    description: 'Founded by Elon Musk. Grok models integrated with real-time data from X (Twitter).',
    website: 'https://x.ai',
    logo: '/logos/xai.svg',
  },
  mistral: {
    name: 'Mistral AI',
    color: '#FF7000',
    description: 'French AI company known for efficient, open-weight models.',
    website: 'https://mistral.ai',
    logo: '/logos/mistral.svg',
  },
  perplexity: {
    name: 'Perplexity',
    color: '#20B2AA',
    description: 'AI-powered search engine. Sonar models excel at real-time information retrieval.',
    website: 'https://perplexity.ai',
    logo: '/logos/perplexity.svg',
  },
  meta: {
    name: 'Meta',
    color: '#0668E1',
    description: 'Open-source AI leader. LLaMA models available for research and commercial use.',
    website: 'https://ai.meta.com',
    logo: '/logos/meta.svg',
  },
  local: {
    name: 'Local (Ollama)',
    color: '#6B7280',
    description: 'Run models locally on your machine. Privacy-focused, no data leaves your device.',
    website: 'https://ollama.ai',
    logo: '/logos/ollama.svg',
  },
};

// Best use cases for each model
const MODEL_USE_CASES: Record<string, { bestFor: string[]; tips: string[] }> = {
  'gpt-5.1': {
    bestFor: ['Complex reasoning', 'Long-form content', 'Research tasks', 'Code generation'],
    tips: ['Use for tasks requiring deep analysis', 'Enable thinking mode for complex problems', 'Great for multi-step reasoning'],
  },
  'gpt-5.1-chat': {
    bestFor: ['General conversation', 'Quick Q&A', 'Brainstorming', 'Creative writing'],
    tips: ['Optimized for conversational flow', 'Best default model for most tasks', 'Fast and efficient responses'],
  },
  'gpt-5.1-pro': {
    bestFor: ['Enterprise tasks', 'Advanced research', 'Complex projects', 'Maximum capability'],
    tips: ['512K context window', 'Best for mission-critical tasks', 'Supports thinking and research modes'],
  },
  'gpt-5.1-nano': {
    bestFor: ['Quick responses', 'Simple queries', 'Cost-effective tasks', 'High-volume processing'],
    tips: ['Fastest GPT-5.1 variant', 'Lowest cost per token', 'Good for simple automations'],
  },
  'gpt-5.1-mini': {
    bestFor: ['Balanced tasks', 'Moderate complexity', 'General purpose', 'Interactive apps'],
    tips: ['Good balance of speed and capability', '128K context', 'Supports thinking mode'],
  },
  'gpt-5.1-codex': {
    bestFor: ['Code generation', 'Debugging', 'Code review', 'Technical documentation'],
    tips: ['Specialized for programming tasks', 'Supports all major languages', 'Use for refactoring and optimization'],
  },
  'gpt-5.1-codex-mini': {
    bestFor: ['Quick code snippets', 'Simple scripts', 'Code completion'],
    tips: ['Faster than full Codex', 'Good for smaller code tasks', 'Lower token cost'],
  },
  'gpt-5.1-codex-max': {
    bestFor: ['Large codebase analysis', 'Complex refactoring', 'Architecture design'],
    tips: ['Maximum context for large projects', 'Use for full-file or multi-file tasks', 'Best for enterprise codebases'],
  },
  'claude-4.5-opus': {
    bestFor: ['Nuanced writing', 'Ethical analysis', 'Long documents', 'Creative tasks'],
    tips: ['Best for tasks requiring careful consideration', 'Excellent at following complex instructions', 'Great for sensitive topics'],
  },
  'claude-4.5-sonnet': {
    bestFor: ['Balanced tasks', 'Professional writing', 'Analysis', 'Coding'],
    tips: ['Great balance of speed and quality', 'Good default for most Claude tasks', 'Excellent instruction following'],
  },
  'claude-4.5-haiku': {
    bestFor: ['Quick responses', 'Simple tasks', 'High-volume processing'],
    tips: ['Fastest Claude model', 'Cost-effective for simple tasks', 'Good for automation'],
  },
  'gemini-3-pro': {
    bestFor: ['Multimodal tasks', 'Long documents', 'Research', 'Data analysis'],
    tips: ['2M token context - largest available', 'Excellent for document analysis', 'Native thinking mode'],
  },
  'gemini-2.5-pro': {
    bestFor: ['Complex reasoning', 'Visual understanding', 'Code generation'],
    tips: ['Strong multimodal capabilities', 'Good for image + text tasks'],
  },
  'gemini-2.5-flash': {
    bestFor: ['Fast responses', 'Simple queries', 'Real-time applications'],
    tips: ['Optimized for speed', 'Good for interactive apps', 'Cost-effective'],
  },
  'grok-4.1': {
    bestFor: ['Current events', 'Social media analysis', 'Trending topics'],
    tips: ['Real-time X (Twitter) integration', 'Best for recent information', 'Witty and engaging responses'],
  },
  'grok-4': {
    bestFor: ['General conversation', 'Current events', 'Entertainment'],
    tips: ['Good for casual conversation', 'Real-time data access'],
  },
  'mistral-large': {
    bestFor: ['European language tasks', 'Multilingual content', 'Efficient processing'],
    tips: ['Strong multilingual support', 'Good for European markets', 'Efficient architecture'],
  },
  'sonar-large': {
    bestFor: ['Fact-checking', 'Research', 'Current information', 'Citations'],
    tips: ['Always provides sources', 'Best for factual queries', 'Real-time web search'],
  },
  'llama-3.1-70b': {
    bestFor: ['Open-source projects', 'Custom fine-tuning', 'Cost-effective AI'],
    tips: ['Free tier friendly', 'Good for experimentation', 'Strong open-source community'],
  },
  'llama-3.1-local': {
    bestFor: ['Privacy-sensitive tasks', 'Offline use', 'Custom deployments'],
    tips: ['No data leaves your device', 'Requires local setup', 'Performance depends on hardware'],
  },
  'dall-e-3': {
    bestFor: ['Image generation', 'Creative visuals', 'Marketing assets'],
    tips: ['Best prompt understanding', 'High-quality outputs', 'Use detailed descriptions'],
  },
  'image-1': {
    bestFor: ['Fast image generation', 'Simple visuals', 'Prototyping'],
    tips: ['Quicker than DALL-E 3', 'Good for iteration'],
  },
  'sora-2': {
    bestFor: ['Video generation', 'Short clips', 'Creative content'],
    tips: ['State-of-the-art video AI', 'Use detailed scene descriptions'],
  },
  'sora-2-pro': {
    bestFor: ['Professional video', 'Long-form content', 'Commercial projects'],
    tips: ['Higher quality output', 'Better for production use'],
  },
};

type FilterType = 'all' | 'chat' | 'code' | 'vision' | 'image' | 'video' | 'research';

export default function ModelsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [expandedModel, setExpandedModel] = useState<string | null>(null);

  const allModels = useMemo(() => getAllModels(), []);

  const filteredModels = useMemo(() => {
    return allModels.filter((model) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchQuery.toLowerCase());

      // Provider filter
      const matchesProvider = !selectedProvider || model.provider === selectedProvider;

      // Type filter
      let matchesType = true;
      switch (filterType) {
        case 'chat':
          matchesType = model.supportsStreaming && !model.supportsImageGen && !model.supportsVideoGen;
          break;
        case 'code':
          matchesType = model.name.toLowerCase().includes('codex');
          break;
        case 'vision':
          matchesType = model.supportsVision;
          break;
        case 'image':
          matchesType = model.supportsImageGen || false;
          break;
        case 'video':
          matchesType = model.supportsVideoGen || false;
          break;
        case 'research':
          matchesType = model.supportsResearch || false;
          break;
      }

      return matchesSearch && matchesProvider && matchesType;
    });
  }, [allModels, searchQuery, selectedProvider, filterType]);

  const groupedByProvider = useMemo(() => {
    const groups: Record<string, AIModel[]> = {};
    filteredModels.forEach((model) => {
      if (!groups[model.provider]) {
        groups[model.provider] = [];
      }
      groups[model.provider].push(model);
    });
    return groups;
  }, [filteredModels]);

  const formatContextWindow = (tokens: number) => {
    if (tokens === 0) return 'N/A';
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toString();
  };

  const getModelKey = (model: AIModel) => {
    // Find the key in AI_MODELS that matches this model
    return Object.entries(AI_MODELS).find(([, m]) => m.id === model.id)?.[0] || model.id;
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">AI Models</h1>
              <p className="text-sm text-[var(--text-muted)]">
                {filteredModels.length} models available
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="
                w-full pl-12 pr-4 py-3
                bg-[var(--bg-elevated)] border border-[var(--border-subtle)]
                rounded-xl text-[var(--text-primary)]
                placeholder:text-[var(--text-muted)]
                focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50
              "
            />
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { type: 'all' as FilterType, label: 'All', icon: Sparkles },
              { type: 'chat' as FilterType, label: 'Chat', icon: MessageSquare },
              { type: 'code' as FilterType, label: 'Code', icon: Code },
              { type: 'vision' as FilterType, label: 'Vision', icon: Eye },
              { type: 'image' as FilterType, label: 'Image Gen', icon: ImageIcon },
              { type: 'video' as FilterType, label: 'Video Gen', icon: Video },
              { type: 'research' as FilterType, label: 'Research', icon: Globe },
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                  filterType === type
                    ? 'bg-[var(--accent-primary)] text-white'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Provider Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedProvider(null)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                !selectedProvider
                  ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
              )}
            >
              All Providers
            </button>
            {Object.entries(PROVIDERS).map(([key, provider]) => (
              <button
                key={key}
                onClick={() => setSelectedProvider(key)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  selectedProvider === key
                    ? 'text-white'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                )}
                style={selectedProvider === key ? { backgroundColor: provider.color } : {}}
              >
                {provider.name}
              </button>
            ))}
          </div>
        </div>

        {/* Models by Provider */}
        <div className="space-y-8">
          {Object.entries(groupedByProvider).map(([provider, models]) => {
            const providerInfo = PROVIDERS[provider as keyof typeof PROVIDERS];
            return (
              <motion.section
                key={provider}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Provider Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${providerInfo.color}20` }}
                  >
                    <Cpu className="w-5 h-5" style={{ color: providerInfo.color }} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                      {providerInfo.name}
                    </h2>
                    <p className="text-sm text-[var(--text-muted)]">{providerInfo.description}</p>
                  </div>
                </div>

                {/* Models Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {models.map((model) => {
                    const modelKey = getModelKey(model);
                    const useCase = MODEL_USE_CASES[modelKey];
                    const pricing = MODEL_PRICING[modelKey];
                    const isExpanded = expandedModel === model.id;

                    return (
                      <motion.div
                        key={model.id}
                        layout
                        className={cn(
                          'p-4 rounded-2xl bg-[var(--bg-elevated)] border transition-all cursor-pointer',
                          isExpanded
                            ? 'border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/20'
                            : 'border-[var(--border-subtle)] hover:border-[var(--border-medium)]'
                        )}
                        onClick={() => setExpandedModel(isExpanded ? null : model.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">{model.name}</h3>
                            <p className="text-xs text-[var(--text-muted)]">{model.id}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {model.supportsThinking && (
                              <span className="p-1.5 rounded-lg bg-purple-500/10" title="Thinking Mode">
                                <Brain className="w-3.5 h-3.5 text-purple-500" />
                              </span>
                            )}
                            {model.supportsVision && (
                              <span className="p-1.5 rounded-lg bg-blue-500/10" title="Vision">
                                <Eye className="w-3.5 h-3.5 text-blue-500" />
                              </span>
                            )}
                            {model.supportsResearch && (
                              <span className="p-1.5 rounded-lg bg-green-500/10" title="Research">
                                <Globe className="w-3.5 h-3.5 text-green-500" />
                              </span>
                            )}
                            {model.supportsImageGen && (
                              <span className="p-1.5 rounded-lg bg-pink-500/10" title="Image Gen">
                                <ImageIcon className="w-3.5 h-3.5 text-pink-500" />
                              </span>
                            )}
                            {model.supportsVideoGen && (
                              <span className="p-1.5 rounded-lg bg-orange-500/10" title="Video Gen">
                                <Video className="w-3.5 h-3.5 text-orange-500" />
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-3">
                          <span className="flex items-center gap-1">
                            <Cpu className="w-3 h-3" />
                            {formatContextWindow(model.contextWindow)} context
                          </span>
                          {pricing && (
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              ${pricing.inputPer1kTokens}/1K in
                            </span>
                          )}
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && useCase && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-3 border-t border-[var(--border-subtle)] space-y-3"
                          >
                            {/* Best For */}
                            <div>
                              <h4 className="text-xs font-medium text-[var(--text-muted)] mb-2 flex items-center gap-1">
                                <Star className="w-3 h-3" /> Best For
                              </h4>
                              <div className="flex flex-wrap gap-1.5">
                                {useCase.bestFor.map((use) => (
                                  <span
                                    key={use}
                                    className="px-2 py-1 text-xs rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]"
                                  >
                                    {use}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Tips */}
                            <div>
                              <h4 className="text-xs font-medium text-[var(--text-muted)] mb-2 flex items-center gap-1">
                                <Lightbulb className="w-3 h-3" /> Tips
                              </h4>
                              <ul className="space-y-1">
                                {useCase.tips.map((tip, i) => (
                                  <li key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                                    <span className="text-[var(--accent-primary)]">-</span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Pricing */}
                            {pricing && (
                              <div className="pt-2 border-t border-[var(--border-subtle)]">
                                <h4 className="text-xs font-medium text-[var(--text-muted)] mb-2">Pricing</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="p-2 rounded-lg bg-[var(--bg-muted)]">
                                    <span className="text-[var(--text-muted)]">Input:</span>
                                    <span className="ml-1 text-[var(--text-primary)]">
                                      ${pricing.inputPer1kTokens}/1K tokens
                                    </span>
                                  </div>
                                  <div className="p-2 rounded-lg bg-[var(--bg-muted)]">
                                    <span className="text-[var(--text-muted)]">Output:</span>
                                    <span className="ml-1 text-[var(--text-primary)]">
                                      ${pricing.outputPer1kTokens}/1K tokens
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-8 p-4 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Capability Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-purple-500/10">
                <Brain className="w-3.5 h-3.5 text-purple-500" />
              </span>
              <span className="text-xs text-[var(--text-secondary)]">Thinking Mode</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10">
                <Eye className="w-3.5 h-3.5 text-blue-500" />
              </span>
              <span className="text-xs text-[var(--text-secondary)]">Vision</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-green-500/10">
                <Globe className="w-3.5 h-3.5 text-green-500" />
              </span>
              <span className="text-xs text-[var(--text-secondary)]">Research</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-pink-500/10">
                <ImageIcon className="w-3.5 h-3.5 text-pink-500" />
              </span>
              <span className="text-xs text-[var(--text-secondary)]">Image Gen</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-500/10">
                <Video className="w-3.5 h-3.5 text-orange-500" />
              </span>
              <span className="text-xs text-[var(--text-secondary)]">Video Gen</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
