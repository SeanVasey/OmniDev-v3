/**
 * Custom error classes for OmniDev
 */

export class OmniDevError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OmniDevError';
  }
}

export class ConfigurationError extends OmniDevError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export class LLMProviderError extends OmniDevError {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'LLMProviderError';
  }
}

export class ValidationError extends OmniDevError {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}
