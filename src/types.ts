/**
 * Type definitions for OmniDev V3.0
 */

export interface LLMProvider {
  name: string;
  endpoint: string;
  apiKey?: string;
}

export interface OmniDevConfig {
  provider: LLMProvider;
  maxTokens?: number;
  temperature?: number;
  verbose?: boolean;
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
