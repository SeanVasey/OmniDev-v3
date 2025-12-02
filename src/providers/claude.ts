/**
 * Anthropic Claude LLM Provider
 */

import { BaseLLMProvider, type LLMResponse } from './base.js';
import type { Message } from '../types.js';
import { LLMProviderError } from '../errors.js';

interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class ClaudeProvider extends BaseLLMProvider {
  async sendRequest(
    messages: Message[],
    options?: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
    }
  ): Promise<LLMResponse> {
    const body = {
      model: options?.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options?.maxTokens || 4096,
      messages: messages.map((msg) => ({
        role: msg.role === 'system' ? 'user' : msg.role,
        content: msg.content,
      })),
      temperature: options?.temperature,
    };

    try {
      const headers = this.getHeaders();
      headers['anthropic-version'] = '2023-06-01';
      headers['x-api-key'] = this.apiKey || '';

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new LLMProviderError(
          `Claude API error: ${response.status} ${response.statusText} - ${errorText}`,
          response.status
        );
      }

      const data = (await response.json()) as ClaudeResponse;

      return {
        content: data.content[0]?.text || '',
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens,
        },
        model: data.model,
      };
    } catch (error) {
      if (error instanceof LLMProviderError) {
        throw error;
      }
      throw new LLMProviderError(
        `Failed to connect to Claude: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
