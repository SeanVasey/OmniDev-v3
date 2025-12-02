/**
 * OmniDev - Personal LLM Tool Core Class
 */

import type { OmniDevConfig, Message } from './types.js';
import { Logger, LogLevel } from './logger.js';
import { ConfigurationError, ValidationError } from './errors.js';
import { BaseLLMProvider, OpenAIProvider } from './providers/index.js';

export class OmniDev {
  private config: OmniDevConfig;
  private logger: Logger;
  private provider: BaseLLMProvider;

  constructor(config: OmniDevConfig) {
    this.validateConfig(config);
    this.config = config;
    this.logger = new Logger('OmniDev', config.verbose ? LogLevel.DEBUG : LogLevel.INFO);
    this.provider = this.createProvider();
  }

  /**
   * Validate configuration
   */
  private validateConfig(config: OmniDevConfig): void {
    if (!config.provider) {
      throw new ConfigurationError('Provider configuration is required');
    }
    if (!config.provider.name) {
      throw new ValidationError('Provider name is required', 'provider.name');
    }
    if (!config.provider.endpoint) {
      throw new ValidationError('Provider endpoint is required', 'provider.endpoint');
    }
    if (config.maxTokens && config.maxTokens <= 0) {
      throw new ValidationError('maxTokens must be greater than 0', 'maxTokens');
    }
    if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
      throw new ValidationError('temperature must be between 0 and 2', 'temperature');
    }
  }

  /**
   * Create appropriate provider based on configuration
   */
  private createProvider(): BaseLLMProvider {
    const { name, endpoint, apiKey } = this.config.provider;

    switch (name.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider(name, endpoint, apiKey);
      default:
        this.logger.warn(`Unknown provider '${name}', using OpenAI provider`);
        return new OpenAIProvider(name, endpoint, apiKey);
    }
  }

  /**
   * Send a message to the LLM
   */
  async chat(messages: Message[]): Promise<string> {
    this.logger.info(`Sending ${messages.length} messages to ${this.config.provider.name}`);

    try {
      const response = await this.provider.sendRequest(messages, {
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
      });

      this.logger.debug(`Received response with ${response.usage?.totalTokens || 0} tokens`);
      return response.content;
    } catch (error) {
      this.logger.error(
        `Failed to get response from LLM: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): OmniDevConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(updates: Partial<OmniDevConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}
