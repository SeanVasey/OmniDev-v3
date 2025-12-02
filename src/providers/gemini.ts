/**
 * Google Gemini LLM Provider
 */

import { BaseLLMProvider, type LLMResponse } from './base.js';
import type { Message } from '../types.js';
import { LLMProviderError } from '../errors.js';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
      role: string;
    };
    finishReason: string;
  }>;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiProvider extends BaseLLMProvider {
  async sendRequest(
    messages: Message[],
    options?: {
      maxTokens?: number;
      temperature?: number;
      model?: string;
    }
  ): Promise<LLMResponse> {
    // Gemini uses API key in URL
    const model = options?.model || 'gemini-1.5-pro';
    const url = `${this.endpoint}/${model}:generateContent?key=${this.apiKey}`;

    const body = {
      contents: messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: options?.temperature,
        maxOutputTokens: options?.maxTokens,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new LLMProviderError(
          `Gemini API error: ${response.status} ${response.statusText} - ${errorText}`,
          response.status
        );
      }

      const data = (await response.json()) as GeminiResponse;

      return {
        content: data.candidates[0]?.content?.parts[0]?.text || '',
        usage: data.usageMetadata
          ? {
              promptTokens: data.usageMetadata.promptTokenCount,
              completionTokens: data.usageMetadata.candidatesTokenCount,
              totalTokens: data.usageMetadata.totalTokenCount,
            }
          : undefined,
        model,
      };
    } catch (error) {
      if (error instanceof LLMProviderError) {
        throw error;
      }
      throw new LLMProviderError(
        `Failed to connect to Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
