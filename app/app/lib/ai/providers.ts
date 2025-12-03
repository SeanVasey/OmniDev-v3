import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';
import { mistral } from '@ai-sdk/mistral';
import { xai } from '@ai-sdk/xai';
import { perplexity } from '@ai-sdk/perplexity';
import { togetherai } from '@ai-sdk/togetherai';
import { ollama } from 'ollama-ai-provider';

export const AI_PROVIDERS = {
  openai: {
    // GPT-5.1 Series
    'gpt-5.1': openai('gpt-5.1-2025-11-13'),
    'gpt-5.1-chat': openai('gpt-5.1-chat-2025-11-13'),
    'gpt-5.1-codex': openai('gpt-5.1-codex-2025-11-13'),
    'gpt-5.1-codex-mini': openai('gpt-5.1-codex-mini-2025-11-13'),
    'gpt-5.1-codex-max': openai('gpt-5.1-codex-max-2025-11-19'),
    // GPT-5 Series
    'gpt-5': openai('gpt-5-2025-08-07'),
    'gpt-5-mini': openai('gpt-5-mini-2025-08-07'),
    'gpt-5-nano': openai('gpt-5-nano-2025-08-07'),
    'gpt-5-chat': openai('gpt-5-chat-2025-10-03'),
    'gpt-5-codex': openai('gpt-5-codex-2025-09-11'),
    'gpt-5-pro': openai('gpt-5-pro-2025-10-06'),
    // GPT-4 Series
    'gpt-4o': openai('gpt-4o'),
    // Image Generation
    'dall-e-3': openai('dall-e-3'),
    'image-1': openai('image-1'),
    // Video Generation
    'sora-2': openai('sora-2'),
    'sora-2-pro': openai('sora-2-pro'),
  },
  anthropic: {
    'claude-4.5-sonnet': anthropic('claude-4-5-sonnet-20250514'),
    'claude-4.5-opus': anthropic('claude-4-5-opus-20250514'),
    'claude-4.5-haiku': anthropic('claude-4-5-haiku-20250514'),
  },
  google: {
    'gemini-3-pro': google('gemini-3.0-pro-latest'),
    'gemini-2.5-pro': google('gemini-2.5-pro-latest'),
    'gemini-2.5-flash': google('gemini-2.5-flash-latest'),
    'gemini-1.5-pro': google('gemini-1.5-pro'),
  },
  mistral: {
    'mistral-large': mistral('mistral-large-latest'),
  },
  xai: {
    'grok-4.1': xai('grok-4.1'),
    'grok-4': xai('grok-4'),
  },
  perplexity: {
    'sonar-large': perplexity('llama-3.1-sonar-large-128k-online'),
  },
  meta: {
    'llama-3.1-70b': togetherai('meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'),
  },
  local: {
    'llama-3.1-local': ollama('llama3.1'),
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

  // OpenAI Image Generation
  if (modelId === 'dall-e-3' || modelId === 'image-1') {
    return AI_PROVIDERS.openai[modelId as keyof typeof AI_PROVIDERS.openai];
  }

  // OpenAI Video Generation
  if (modelId === 'sora-2' || modelId === 'sora-2-pro') {
    return AI_PROVIDERS.openai[modelId as keyof typeof AI_PROVIDERS.openai];
  }

  // Anthropic models
  if (modelId.includes('claude')) {
    return (
      AI_PROVIDERS.anthropic[modelId as keyof typeof AI_PROVIDERS.anthropic] ||
      AI_PROVIDERS.anthropic['claude-4.5-sonnet']
    );
  }

  // Google models
  if (modelId.includes('gemini')) {
    return (
      AI_PROVIDERS.google[modelId as keyof typeof AI_PROVIDERS.google] ||
      AI_PROVIDERS.google['gemini-2.5-pro']
    );
  }

  // Mistral models
  if (modelId.includes('mistral')) {
    return AI_PROVIDERS.mistral['mistral-large'];
  }

  // xAI models
  if (modelId.includes('grok')) {
    return (
      AI_PROVIDERS.xai[modelId as keyof typeof AI_PROVIDERS.xai] || AI_PROVIDERS.xai['grok-4.1']
    );
  }

  // Perplexity models
  if (modelId.includes('sonar') || modelId.includes('perplexity')) {
    return AI_PROVIDERS.perplexity['sonar-large'];
  }

  // Meta/Together AI models
  if (modelId.includes('llama') && modelId.includes('70b')) {
    return AI_PROVIDERS.meta['llama-3.1-70b'];
  }

  // Local Ollama models
  if (modelId.includes('local') || modelId.includes('ollama')) {
    return AI_PROVIDERS.local['llama-3.1-local'];
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

    case 'video':
      return 'You are an AI assistant helping with video generation. Understand user requests and provide detailed, creative prompts optimized for text-to-video and image-to-video generation. Consider motion, cinematography, pacing, and visual storytelling.';

    default:
      return 'You are a helpful, creative, and friendly AI assistant. Provide clear, concise, and accurate responses to help users with their tasks.';
  }
}
