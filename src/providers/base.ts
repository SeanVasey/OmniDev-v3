/**
 * Base LLM Provider interface
 */

import type { Message } from '../types.js';

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

export abstract class BaseLLMProvider {
  protected endpoint: string;
  protected apiKey?: string;
  protected name: string;

  constructor(name: string, endpoint: string, apiKey?: string) {
    this.name = name;
    this.endpoint = endpoint;
    this.apiKey = apiKey;
  }

  abstract sendRequest(
    _messages: Message[],
    _options?: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
    }
  ): Promise<LLMResponse>;

  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }
}
