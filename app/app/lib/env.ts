/**
 * Environment variable validation and helper utilities
 */

interface EnvConfig {
  // AI Provider API Keys
  openaiApiKey?: string;
  anthropicApiKey?: string;
  googleApiKey?: string;
  mistralApiKey?: string;
  xaiApiKey?: string;
  perplexityApiKey?: string;
  togetheraiApiKey?: string;

  // Supabase
  supabaseUrl?: string;
  supabaseAnonKey?: string;

  // Image Generation
  dalleApiKey?: string;
}

export function getEnvConfig(): EnvConfig {
  return {
    openaiApiKey: process.env.OPENAI_API_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    googleApiKey: process.env.GOOGLE_API_KEY,
    mistralApiKey: process.env.MISTRAL_API_KEY,
    xaiApiKey: process.env.XAI_API_KEY,
    perplexityApiKey: process.env.PERPLEXITY_API_KEY,
    togetheraiApiKey: process.env.TOGETHERAI_API_KEY,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    dalleApiKey: process.env.OPENAI_API_KEY,
  };
}

export function isProviderConfigured(provider: string): boolean {
  const config = getEnvConfig();

  switch (provider.toLowerCase()) {
    case 'openai':
      return !!config.openaiApiKey;
    case 'anthropic':
      return !!config.anthropicApiKey;
    case 'google':
      return !!config.googleApiKey;
    case 'mistral':
      return !!config.mistralApiKey;
    case 'xai':
      return !!config.xaiApiKey;
    case 'perplexity':
      return !!config.perplexityApiKey;
    case 'meta':
    case 'togetherai':
      return !!config.togetheraiApiKey;
    case 'local':
      // Local models don't need API keys
      return true;
    default:
      return false;
  }
}

export function getMissingProviderMessage(provider: string): string {
  const envVarMap: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    google: 'GOOGLE_API_KEY',
    mistral: 'MISTRAL_API_KEY',
    xai: 'XAI_API_KEY',
    perplexity: 'PERPLEXITY_API_KEY',
    meta: 'TOGETHERAI_API_KEY',
    togetherai: 'TOGETHERAI_API_KEY',
  };

  const envVar = envVarMap[provider.toLowerCase()];

  if (!envVar) {
    return `Unknown provider: ${provider}`;
  }

  return `${provider} API key not configured. Please set ${envVar} in your .env.local file.`;
}

export function getConfiguredProviders(): string[] {
  const providers = [
    'openai',
    'anthropic',
    'google',
    'mistral',
    'xai',
    'perplexity',
    'meta',
    'local',
  ];
  return providers.filter(isProviderConfigured);
}

export function validateMinimumConfig(): { isValid: boolean; message?: string } {
  const configured = getConfiguredProviders();

  if (configured.length === 0) {
    return {
      isValid: false,
      message:
        'No AI providers are configured. Please add at least one API key to your .env.local file.',
    };
  }

  return { isValid: true };
}
