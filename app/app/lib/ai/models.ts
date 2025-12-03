import type { AIModel } from '@/types';

export const AI_MODELS: Record<string, AIModel> = {
  // OpenAI - GPT-5.1 Series (November 2025)
  'gpt-5.1': {
    id: 'gpt-5.1-2025-11-13',
    name: 'GPT-5.1',
    provider: 'openai',
    contextWindow: 256000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    supportsThinking: true,
    supportsResearch: true,
    maxTokens: 32768,
  },
  'gpt-5.1-chat': {
    id: 'gpt-5.1-chat-2025-11-13',
    name: 'GPT-5.1 Chat',
    provider: 'openai',
    contextWindow: 256000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    supportsThinking: true,
    maxTokens: 32768,
  },
  'gpt-5.1-codex': {
    id: 'gpt-5.1-codex-2025-11-13',
    name: 'GPT-5.1 Codex',
    provider: 'openai',
    contextWindow: 256000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    supportsThinking: true,
    maxTokens: 32768,
  },
  'gpt-5.1-codex-mini': {
    id: 'gpt-5.1-codex-mini-2025-11-13',
    name: 'GPT-5.1 Codex Mini',
    provider: 'openai',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    supportsThinking: true,
    maxTokens: 16384,
  },
  'gpt-5.1-codex-max': {
    id: 'gpt-5.1-codex-max-2025-11-19',
    name: 'GPT-5.1 Codex Max',
    provider: 'openai',
    contextWindow: 512000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    supportsThinking: true,
    maxTokens: 64000,
  },

  // OpenAI - GPT-5 Series (August-October 2025)
  'gpt-5': {
    id: 'gpt-5-2025-08-07',
    name: 'GPT-5',
    provider: 'openai',
    contextWindow: 256000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    supportsThinking: true,
    supportsResearch: true,
    maxTokens: 32768,
  },
  'gpt-5-mini': {
    id: 'gpt-5-mini-2025-08-07',
    name: 'GPT-5 Mini',
    provider: 'openai',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    maxTokens: 16384,
  },
  'gpt-5-nano': {
    id: 'gpt-5-nano-2025-08-07',
    name: 'GPT-5 Nano',
    provider: 'openai',
    contextWindow: 64000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    maxTokens: 8192,
  },
  'gpt-5-chat': {
    id: 'gpt-5-chat-2025-10-03',
    name: 'GPT-5 Chat',
    provider: 'openai',
    contextWindow: 256000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    supportsThinking: true,
    maxTokens: 32768,
  },
  'gpt-5-codex': {
    id: 'gpt-5-codex-2025-09-11',
    name: 'GPT-5 Codex',
    provider: 'openai',
    contextWindow: 256000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    supportsThinking: true,
    maxTokens: 32768,
  },
  'gpt-5-pro': {
    id: 'gpt-5-pro-2025-10-06',
    name: 'GPT-5 Pro',
    provider: 'openai',
    contextWindow: 512000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    supportsThinking: true,
    supportsResearch: true,
    maxTokens: 64000,
  },
  'gpt-4o': {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    contextWindow: 128000,
    supportsStreaming: true,
    supportsVision: true,
    supportsImageGen: false,
    maxTokens: 16384,
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
    supportsThinking: true,
    supportsResearch: true,
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
    supportsThinking: true,
    supportsResearch: true,
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
    supportsThinking: true,
    supportsResearch: true,
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
    supportsResearch: true,
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
