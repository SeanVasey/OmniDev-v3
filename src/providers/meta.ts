/**
 * Meta LLaMA LLM Provider (via OpenAI-compatible API)
 */

import { BaseLLMProvider, type LLMResponse } from './base.js';
import type { Message } from '../types.js';
import { LLMProviderError } from '../errors.js';

interface MetaResponse {
  id: string;
  object: string;
  created: number;
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

export class MetaProvider extends BaseLLMProvider {
  async sendRequest(
    messages: Message[],
    options?: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
    }
  ): Promise<LLMResponse> {
    const body = {
      model: options?.model || 'meta-llama/Meta-Llama-3.1-70B-Instruct',
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
          `Meta API error: ${response.status} ${response.statusText} - ${errorText}`,
          response.status
        );
      }

      const data = (await response.json()) as MetaResponse;

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
        `Failed to connect to Meta: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
