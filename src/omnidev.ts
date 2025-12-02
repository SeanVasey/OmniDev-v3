/**
 * OmniDev - Personal LLM Tool Core Class
 */

import type { OmniDevConfig, Message } from './types.js';

export class OmniDev {
  private config: OmniDevConfig;

  constructor(config: OmniDevConfig) {
    this.config = config;
  }

  /**
   * Send a message to the LLM
   */
  async chat(messages: Message[]): Promise<string> {
    if (this.config.verbose) {
      console.log(`Sending ${messages.length} messages to ${this.config.provider.name}`);
    }

    // TODO: Implement actual LLM integration
    return 'Response from LLM';
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
