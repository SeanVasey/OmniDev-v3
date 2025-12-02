/**
 * Tests for OmniDev class
 */

import { describe, it, expect } from 'vitest';
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
    const omniDev = new OmniDev(mockConfig);
    const response = await omniDev.chat([{ role: 'user', content: 'Hello' }]);
    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });

  it('should preserve original config when getting config', () => {
    const omniDev = new OmniDev(mockConfig);
    const config1 = omniDev.getConfig();
    config1.temperature = 0.5;
    const config2 = omniDev.getConfig();
    expect(config2.temperature).toBe(0.7);
  });
});
