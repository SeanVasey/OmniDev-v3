/**
 * OmniDev V3.0 - Personal LLM Tool
 * Main entry point
 */

export { OmniDev } from './omnidev.js';
export type { OmniDevConfig, LLMProvider, Message } from './types.js';
export { Logger, LogLevel } from './logger.js';
export { OmniDevError, ConfigurationError, LLMProviderError, ValidationError } from './errors.js';
export { ConfigLoader } from './config.js';

// Provider metadata and utilities
export {
  PROVIDER_METADATA,
  getProviderMetadata,
  getAllProviders,
  formatProviderDisplay,
  type ProviderMetadata,
} from './providers/metadata.js';
