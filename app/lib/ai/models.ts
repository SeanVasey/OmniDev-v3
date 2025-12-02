import type { AIModel } from '@/types';

export const AI_MODELS: Record<string, AIModel> = {
  // OpenAI
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    maxTokens: 4096,
  },
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    maxTokens: 4096,
  },
  'dall-e-3': {
    id: 'dall-e-3',
    name: 'DALL·E 3',
    provider: 'openai',
    contextWindow: 0,
    supportsStreaming: false,
    supportsVision: false,
    supportsImageGen: true,
    maxTokens: 0,
  },

  // Anthropic
  'claude-3.5-sonnet': {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    contextWindow: 200000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    maxTokens: 8192,
  },
  'claude-3-opus': {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    contextWindow: 200000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    maxTokens: 4096,
  },

  // Google
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    contextWindow: 1000000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    maxTokens: 8192,
  },

  // xAI
  'grok-beta': {
    id: 'grok-beta',
    name: 'Grok Beta',
    provider: 'xai',
    contextWindow: 131072,
    supportsStreaming: true,
    supportsVision: false,
    supportsImageGen: false,
    maxTokens: 4096,
  },

  // Mistral
  'mistral-large': {
    id: 'mistral-large-latest',
    name: 'Mistral Large',
    provider: 'mistral',
    contextWindow: 32000,
    supportsStreaming: true,
    supportsVision: false,
    supportsImageGen: false,
    maxTokens: 4096,
  },

  // Perplexity
  'sonar-large': {
    id: 'llama-3.1-sonar-large-128k-online',
    name: 'Sonar Large',
    provider: 'perplexity',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: false,
    supportsImageGen: false,
    maxTokens: 4096,
  },

  // Meta (via Together AI)
  'llama-3.1-70b': {
    id: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
    name: 'LLaMA 3.1 70B',
    provider: 'meta',
    contextWindow: 131072,
    supportsStreaming: true,
    supportsVision: false,
    supportsImageGen: false,
    maxTokens: 4096,
  },

  // Local (Ollama)
  'llama-3.1-local': {
    id: 'llama3.1',
    name: 'LLaMA 3.1 (Local)',
    provider: 'local',
    contextWindow: 8192,
    supportsStreaming: true,
    supportsVision: false,
    supportsImageGen: false,
    maxTokens: 2048,
  },
};

export function getModel(modelId: string): AIModel | undefined {
  return AI_MODELS[modelId];
}

export function getModelsByProvider(provider: string): AIModel[] {
  return Object.values(AI_MODELS).filter((model) => model.provider === provider);
}

export function getAllModels(): AIModel[] {
  return Object.values(AI_MODELS);
}
