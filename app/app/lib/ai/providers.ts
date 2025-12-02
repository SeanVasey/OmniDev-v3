import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';

export const AI_PROVIDERS = {
  openai: {
    'gpt-5.1': openai('gpt-5.1'),
    'gpt-5.1-chat': openai('gpt-5.1-chat'),
    'gpt-5.1-codex': openai('gpt-5.1-codex'),
    'gpt-5.1-codex-mini': openai('gpt-5.1-codex-mini'),
    'gpt-5.1-mini': openai('gpt-5.1-mini'),
    'gpt-5': openai('gpt-5'),
    'gpt-5-mini': openai('gpt-5-mini'),
    'gpt-5-nano': openai('gpt-5-nano'),
    'gpt-5-pro': openai('gpt-5-pro'),
    'gpt-4o': openai('gpt-4o'),
  },
  anthropic: {
    'claude-3.5-sonnet': anthropic('claude-3-5-sonnet-20241022'),
    'claude-3-opus': anthropic('claude-3-opus-20240229'),
    'claude-3-sonnet': anthropic('claude-3-sonnet-20240229'),
    'claude-3-haiku': anthropic('claude-3-haiku-20240307'),
  },
} as const;

export function getAIModel(modelId: string) {
  // OpenAI GPT-5 models
  if (modelId.startsWith('gpt-5')) {
    return (
      AI_PROVIDERS.openai[modelId as keyof typeof AI_PROVIDERS.openai] ||
      AI_PROVIDERS.openai['gpt-5.1']
    );
  }

  // OpenAI GPT-4 models
  if (modelId.startsWith('gpt-4') || modelId === 'gpt-4o') {
    return (
      AI_PROVIDERS.openai[modelId as keyof typeof AI_PROVIDERS.openai] ||
      AI_PROVIDERS.openai['gpt-4o']
    );
  }

  // Anthropic models
  if (modelId.includes('claude')) {
    return AI_PROVIDERS.anthropic['claude-3.5-sonnet'];
  }

  // Default to GPT-5.1
  return AI_PROVIDERS.openai['gpt-5.1'];
}

export function getSystemPrompt(contextMode: string | null): string {
  switch (contextMode) {
    case 'thinking':
      return 'You are a helpful AI assistant with extended reasoning capabilities. Take your time to think through problems carefully and provide detailed, well-reasoned responses.';

    case 'search':
      return 'You are a helpful AI assistant with web search capabilities. Provide current, factual information and cite sources when possible.';

    case 'research':
      return 'You are a research assistant specializing in comprehensive, in-depth analysis. Provide thorough research with multiple perspectives, sources, and detailed explanations.';

    case 'image':
      return 'You are an AI assistant helping with image generation. Understand user requests and provide detailed, creative prompts optimized for image generation models.';

    default:
      return 'You are a helpful, creative, and friendly AI assistant. Provide clear, concise, and accurate responses to help users with their tasks.';
  }
}
