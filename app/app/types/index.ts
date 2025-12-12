export type ContextMode = 'thinking' | 'search' | 'research' | 'image' | 'video' | null;
export type AspectRatio = '1:1' | '3:4' | '4:3' | '16:9' | '9:16';

export interface BillingAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  occupation?: string;
  mobile_number?: string;
  billing_address?: BillingAddress;
  subscription_tier?: 'free' | 'pro' | 'enterprise';
  subscription_status?: 'active' | 'inactive' | 'trial';
  google_id?: string;
  preferences?: {
    theme?: 'dark' | 'light';
    haptics_enabled?: boolean;
    default_model?: string;
    notifications_enabled?: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  workspace_id?: string;
  title: string;
  model_id: string;
  context_mode?: ContextMode;
  is_pinned: boolean;
  is_archived: boolean;
  is_incognito: boolean;
  is_starred: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  aspect_ratio?: AspectRatio;
  metrics?: {
    tokens_input?: number;
    tokens_output?: number;
    cost?: number;
    latency_ms?: number;
  };
  created_at: string;
}

export interface Attachment {
  id: string;
  user_id: string;
  message_id?: string;
  storage_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url?: string;
  created_at: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'mistral' | 'perplexity' | 'meta' | 'local';
  contextWindow: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsImageGen: boolean;
  supportsVideoGen?: boolean;
  supportsThinking?: boolean;
  supportsResearch?: boolean;
  maxTokens: number;
}

export interface MediaGeneration {
  id: string;
  user_id: string;
  type: 'image' | 'video';
  prompt: string;
  url: string;
  thumbnail_url?: string;
  model_id: string;
  aspect_ratio?: AspectRatio;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ProjectSettings {
  id: string;
  workspace_id: string;
  system_instruction?: string;
  default_model_id?: string;
  characteristics?: string[];
  created_at: string;
  updated_at: string;
}

export type ProjectIcon = 'folder' | 'code' | 'design' | 'data' | 'research' | 'writing' | 'image' | 'video' | 'music' | 'chat';
export type ProjectColor = 'orange' | 'blue' | 'green' | 'purple' | 'pink' | 'red' | 'yellow' | 'teal';

// ============================================================================
// Usage & Billing Types
// ============================================================================

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';

export interface TierLimits {
  tokensPerMonth: number;
  tokensPerDay: number;
  imagesPerMonth: number;
  videosPerMonth: number;
  maxFileSize: number; // in bytes
  maxContextWindow: number;
  modelsAllowed: string[]; // model IDs allowed for this tier
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    tokensPerMonth: 100000,      // 100K tokens/month
    tokensPerDay: 10000,         // 10K tokens/day
    imagesPerMonth: 10,
    videosPerMonth: 0,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxContextWindow: 32000,
    modelsAllowed: ['gpt-5.1-chat', 'claude-4.5-haiku', 'gemini-2.5-flash', 'llama-3.1-70b'],
  },
  pro: {
    tokensPerMonth: 2000000,     // 2M tokens/month
    tokensPerDay: 100000,        // 100K tokens/day
    imagesPerMonth: 100,
    videosPerMonth: 20,
    maxFileSize: 25 * 1024 * 1024, // 25MB
    maxContextWindow: 200000,
    modelsAllowed: ['*'], // All models
  },
  enterprise: {
    tokensPerMonth: 10000000,    // 10M tokens/month
    tokensPerDay: 500000,        // 500K tokens/day
    imagesPerMonth: 500,
    videosPerMonth: 100,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxContextWindow: 2000000,
    modelsAllowed: ['*'], // All models
  },
};

export interface UsageLog {
  id: string;
  user_id: string;
  model_id: string;
  provider: string;
  type: 'chat' | 'image' | 'video' | 'embedding';
  tokens_input: number;
  tokens_output: number;
  cost: number;
  latency_ms: number;
  context_mode?: ContextMode;
  created_at: string;
}

export interface UsageSummary {
  period: 'day' | 'week' | 'month' | 'all';
  tokensUsed: number;
  tokensLimit: number;
  tokensRemaining: number;
  percentUsed: number;
  imagesGenerated: number;
  imagesLimit: number;
  videosGenerated: number;
  videosLimit: number;
  totalCost: number;
  requestCount: number;
  averageLatency: number;
  topModels: { modelId: string; count: number; tokens: number }[];
  dailyUsage: { date: string; tokens: number; cost: number }[];
}

export interface ModelPricing {
  modelId: string;
  inputPer1kTokens: number;  // USD per 1K input tokens
  outputPer1kTokens: number; // USD per 1K output tokens
  imagePerGeneration?: number;
  videoPerSecond?: number;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  // GPT-5.2 Series (Current Frontier)
  'gpt-5.2': { modelId: 'gpt-5.2', inputPer1kTokens: 0.012, outputPer1kTokens: 0.036 },
  'gpt-5.2-chat-latest': { modelId: 'gpt-5.2-chat-latest', inputPer1kTokens: 0.006, outputPer1kTokens: 0.018 },
  'gpt-5.2-pro': { modelId: 'gpt-5.2-pro', inputPer1kTokens: 0.02, outputPer1kTokens: 0.06 },
  // GPT-5.1 Series
  'gpt-5.1': { modelId: 'gpt-5.1', inputPer1kTokens: 0.01, outputPer1kTokens: 0.03 },
  'gpt-5.1-chat': { modelId: 'gpt-5.1-chat', inputPer1kTokens: 0.005, outputPer1kTokens: 0.015 },
  'gpt-5.1-pro': { modelId: 'gpt-5.1-pro', inputPer1kTokens: 0.015, outputPer1kTokens: 0.045 },
  'gpt-5.1-nano': { modelId: 'gpt-5.1-nano', inputPer1kTokens: 0.001, outputPer1kTokens: 0.003 },
  'gpt-5.1-mini': { modelId: 'gpt-5.1-mini', inputPer1kTokens: 0.003, outputPer1kTokens: 0.009 },
  'gpt-5.1-codex': { modelId: 'gpt-5.1-codex', inputPer1kTokens: 0.008, outputPer1kTokens: 0.024 },
  'gpt-5.1-codex-mini': { modelId: 'gpt-5.1-codex-mini', inputPer1kTokens: 0.004, outputPer1kTokens: 0.012 },
  'gpt-5.1-codex-max': { modelId: 'gpt-5.1-codex-max', inputPer1kTokens: 0.02, outputPer1kTokens: 0.06 },
  // Claude 4.5 Series
  'claude-4.5-opus': { modelId: 'claude-4.5-opus', inputPer1kTokens: 0.015, outputPer1kTokens: 0.075 },
  'claude-4.5-sonnet': { modelId: 'claude-4.5-sonnet', inputPer1kTokens: 0.003, outputPer1kTokens: 0.015 },
  'claude-4.5-haiku': { modelId: 'claude-4.5-haiku', inputPer1kTokens: 0.00025, outputPer1kTokens: 0.00125 },
  // Gemini Series
  'gemini-3-pro': { modelId: 'gemini-3-pro', inputPer1kTokens: 0.00125, outputPer1kTokens: 0.005 },
  'gemini-2.5-pro': { modelId: 'gemini-2.5-pro', inputPer1kTokens: 0.00125, outputPer1kTokens: 0.005 },
  'gemini-2.5-flash': { modelId: 'gemini-2.5-flash', inputPer1kTokens: 0.000075, outputPer1kTokens: 0.0003 },
  // Other Providers
  'grok-4.1': { modelId: 'grok-4.1', inputPer1kTokens: 0.003, outputPer1kTokens: 0.015 },
  'grok-4': { modelId: 'grok-4', inputPer1kTokens: 0.002, outputPer1kTokens: 0.01 },
  'mistral-large': { modelId: 'mistral-large', inputPer1kTokens: 0.002, outputPer1kTokens: 0.006 },
  'sonar-large': { modelId: 'sonar-large', inputPer1kTokens: 0.001, outputPer1kTokens: 0.001 },
  'llama-3.1-70b': { modelId: 'llama-3.1-70b', inputPer1kTokens: 0.0009, outputPer1kTokens: 0.0009 },
  // Image & Video Generation
  'dall-e-3': { modelId: 'dall-e-3', inputPer1kTokens: 0, outputPer1kTokens: 0, imagePerGeneration: 0.04 },
  'image-1': { modelId: 'image-1', inputPer1kTokens: 0, outputPer1kTokens: 0, imagePerGeneration: 0.02 },
  'sora-2': { modelId: 'sora-2', inputPer1kTokens: 0, outputPer1kTokens: 0, videoPerSecond: 0.05 },
  'sora-2-pro': { modelId: 'sora-2-pro', inputPer1kTokens: 0, outputPer1kTokens: 0, videoPerSecond: 0.10 },
};
