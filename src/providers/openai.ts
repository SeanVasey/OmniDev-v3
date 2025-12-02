/**
 * OpenAI LLM Provider
 */

import { BaseLLMProvider, type LLMResponse } from './base.js';
import type { Message } from '../types.js';
import { LLMProviderError } from '../errors.js';

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
}

export class OpenAIProvider extends BaseLLMProvider {
  async sendRequest(
    messages: Message[],
    options?: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
    }
  ): Promise<LLMResponse> {
    const body = {
      model: options?.model || 'gpt-3.5-turbo',
      messages: messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      max_tokens: options?.maxTokens,
      temperature: options?.temperature,
    };

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new LLMProviderError(
          `OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`,
          response.status
        );
      }

      const data = (await response.json()) as OpenAIResponse;

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
        `Failed to connect to OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
