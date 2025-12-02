/**
 * Tests for ConfigLoader
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigLoader } from './config.js';

describe('ConfigLoader', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('fromEnv', () => {
    it('should load provider configuration from environment', () => {
      process.env.OMNIDEV_PROVIDER_NAME = 'openai';
      process.env.OMNIDEV_PROVIDER_ENDPOINT = 'https://api.openai.com';
      process.env.OMNIDEV_PROVIDER_API_KEY = 'test-key';

      const config = ConfigLoader.fromEnv();

      expect(config.provider).toBeDefined();
      expect(config.provider?.name).toBe('openai');
      expect(config.provider?.endpoint).toBe('https://api.openai.com');
      expect(config.provider?.apiKey).toBe('test-key');
    });

    it('should load model configuration from environment', () => {
      process.env.OMNIDEV_MAX_TOKENS = '1000';
      process.env.OMNIDEV_TEMPERATURE = '0.8';

      const config = ConfigLoader.fromEnv();

      expect(config.maxTokens).toBe(1000);
      expect(config.temperature).toBe(0.8);
    });

    it('should load verbose setting from environment', () => {
      process.env.OMNIDEV_VERBOSE = 'true';

      const config = ConfigLoader.fromEnv();

      expect(config.verbose).toBe(true);
    });

    it('should return empty config when no env vars set', () => {
      const config = ConfigLoader.fromEnv();

      expect(config.provider).toBeUndefined();
      expect(config.maxTokens).toBeUndefined();
    });
  });

  describe('merge', () => {
    it('should merge multiple configurations', () => {
      const config1 = {
        provider: { name: 'openai', endpoint: 'https://api.openai.com' },
        maxTokens: 1000,
      };

      const config2 = {
        temperature: 0.7,
        verbose: true,
      };

      const merged = ConfigLoader.merge(config1, config2);

      expect(merged.provider?.name).toBe('openai');
      expect(merged.maxTokens).toBe(1000);
      expect(merged.temperature).toBe(0.7);
      expect(merged.verbose).toBe(true);
    });

    it('should throw error when provider is missing', () => {
      expect(() => ConfigLoader.merge({})).toThrow('Provider configuration is required');
    });
  });
});
