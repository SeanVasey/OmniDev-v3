/**
 * Tests for OmniDev class
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OmniDev } from './omnidev.js';
import type { OmniDevConfig } from './types.js';

describe('OmniDev', () => {
  const mockConfig: OmniDevConfig = {
    provider: {
      name: 'test-provider',
      endpoint: 'https://api.example.com',
      apiKey: 'test-key',
    },
    maxTokens: 1000,
    temperature: 0.7,
    verbose: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch globally for tests that need it
    global.fetch = vi.fn();
  });

  it('should create an instance with config', () => {
    const omniDev = new OmniDev(mockConfig);
    expect(omniDev).toBeInstanceOf(OmniDev);
  });

  it('should return config', () => {
    const omniDev = new OmniDev(mockConfig);
    const config = omniDev.getConfig();
    expect(config).toEqual(mockConfig);
  });

  it('should update config', () => {
    const omniDev = new OmniDev(mockConfig);
    omniDev.updateConfig({ temperature: 0.9 });
    const config = omniDev.getConfig();
    expect(config.temperature).toBe(0.9);
  });

  it('should handle chat messages', async () => {
    // Mock successful API response
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: 'Hello! How can I help you?',
              role: 'assistant',
            },
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
        model: 'gpt-3.5-turbo',
      }),
    });

    const omniDev = new OmniDev(mockConfig);
    const response = await omniDev.chat([{ role: 'user', content: 'Hello' }]);
    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
    expect(response).toBe('Hello! How can I help you?');
  });

  it('should preserve original config when getting config', () => {
    const omniDev = new OmniDev(mockConfig);
    const config1 = omniDev.getConfig();
    config1.temperature = 0.5;
    const config2 = omniDev.getConfig();
    expect(config2.temperature).toBe(0.7);
  });
});
