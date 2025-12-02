/**
 * LLaMA LLM Provider (via Ollama or LM Studio)
 * OpenAI-compatible local inference
 */

import { BaseLLMProvider, type LLMResponse } from './base.js';
import type { Message } from '../types.js';
import { LLMProviderError } from '../errors.js';

interface LLaMAResponse {
  id?: string;
  object?: string;
  created?: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LLaMAProvider extends BaseLLMProvider {
  async sendRequest(
    messages: Message[],
    options?: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
    }
  ): Promise<LLMResponse> {
    const body = {
      model: options?.model || 'llama3.1',
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: options?.maxTokens,
      temperature: options?.temperature,
      stream: false,
    };

    try {
      // LLaMA via Ollama/LM Studio usually doesn't require auth
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Only add auth if API key is provided
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new LLMProviderError(
          `LLaMA API error: ${response.status} ${response.statusText} - ${errorText}`,
          response.status
        );
      }

      const data = (await response.json()) as LLaMAResponse;

      return {
        content: data.choices[0]?.message?.content || '',
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
        model: data.model,
      };
    } catch (error) {
      if (error instanceof LLMProviderError) {
        throw error;
      }
      throw new LLMProviderError(
        `Failed to connect to LLaMA: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
