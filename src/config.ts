/**
 * Configuration loader with environment variable support
 */

import type { OmniDevConfig, LLMProvider } from './types.js';

export class ConfigLoader {
  /**
   * Load configuration from environment variables
   */
  static fromEnv(): Partial<OmniDevConfig> {
    const config: Partial<OmniDevConfig> = {};

    // Provider configuration
    const providerName = process.env.OMNIDEV_PROVIDER_NAME;
    const providerEndpoint = process.env.OMNIDEV_PROVIDER_ENDPOINT;
    const providerApiKey = process.env.OMNIDEV_PROVIDER_API_KEY;

    if (providerName && providerEndpoint) {
      const provider: LLMProvider = {
        name: providerName,
        endpoint: providerEndpoint,
      };

      if (providerApiKey) {
        provider.apiKey = providerApiKey;
      }

      config.provider = provider;
    }

    // Model configuration
    if (process.env.OMNIDEV_MAX_TOKENS) {
      config.maxTokens = parseInt(process.env.OMNIDEV_MAX_TOKENS, 10);
    }

    if (process.env.OMNIDEV_TEMPERATURE) {
      config.temperature = parseFloat(process.env.OMNIDEV_TEMPERATURE);
    }

    // Application settings
    if (process.env.OMNIDEV_VERBOSE) {
      config.verbose = process.env.OMNIDEV_VERBOSE === 'true';
    }

    return config;
  }

  /**
   * Merge configurations with priority: provided > env > defaults
   */
  static merge(...configs: Partial<OmniDevConfig>[]): OmniDevConfig {
    const merged: Partial<OmniDevConfig> = {};

    for (const config of configs) {
      if (config.provider) {
        merged.provider = { ...merged.provider, ...config.provider };
      }
      if (config.maxTokens !== undefined) {
        merged.maxTokens = config.maxTokens;
      }
      if (config.temperature !== undefined) {
        merged.temperature = config.temperature;
      }
      if (config.verbose !== undefined) {
        merged.verbose = config.verbose;
      }
    }

    // Ensure required fields exist
    if (!merged.provider) {
      throw new Error('Provider configuration is required');
    }

    return merged as OmniDevConfig;
  }
}
