/**
 * Tests for custom errors
 */

import { describe, it, expect } from 'vitest';
import { OmniDevError, ConfigurationError, LLMProviderError, ValidationError } from './errors.js';

describe('Custom Errors', () => {
  describe('OmniDevError', () => {
    it('should create error with message', () => {
      const error = new OmniDevError('Test error');
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('OmniDevError');
      expect(error.message).toBe('Test error');
    });
  });

  describe('ConfigurationError', () => {
    it('should create configuration error', () => {
      const error = new ConfigurationError('Invalid config');
      expect(error).toBeInstanceOf(OmniDevError);
      expect(error.name).toBe('ConfigurationError');
      expect(error.message).toBe('Invalid config');
    });
  });

  describe('LLMProviderError', () => {
    it('should create LLM provider error with status code', () => {
      const error = new LLMProviderError('API error', 403);
      expect(error).toBeInstanceOf(OmniDevError);
      expect(error.name).toBe('LLMProviderError');
      expect(error.message).toBe('API error');
      expect(error.statusCode).toBe(403);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with field', () => {
      const error = new ValidationError('Invalid field', 'email');
      expect(error).toBeInstanceOf(OmniDevError);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid field');
      expect(error.field).toBe('email');
    });
  });
});
