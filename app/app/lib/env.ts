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

interface ProviderInfo {
  envVar: string;
  name: string;
  signupUrl: string;
  docsUrl: string;
}

const PROVIDER_INFO: Record<string, ProviderInfo> = {
  openai: {
    envVar: 'OPENAI_API_KEY',
    name: 'OpenAI',
    signupUrl: 'https://platform.openai.com/api-keys',
    docsUrl: 'https://platform.openai.com/docs/api-reference',
  },
  anthropic: {
    envVar: 'ANTHROPIC_API_KEY',
    name: 'Anthropic',
    signupUrl: 'https://console.anthropic.com/settings/keys',
    docsUrl: 'https://docs.anthropic.com/claude/reference/getting-started-with-the-api',
  },
  google: {
    envVar: 'GOOGLE_API_KEY',
    name: 'Google AI (Gemini)',
    signupUrl: 'https://aistudio.google.com/app/apikey',
    docsUrl: 'https://ai.google.dev/tutorials/get_started',
  },
  mistral: {
    envVar: 'MISTRAL_API_KEY',
    name: 'Mistral AI',
    signupUrl: 'https://console.mistral.ai/api-keys',
    docsUrl: 'https://docs.mistral.ai/api/',
  },
  xai: {
    envVar: 'XAI_API_KEY',
    name: 'xAI (Grok)',
    signupUrl: 'https://console.x.ai/',
    docsUrl: 'https://docs.x.ai/docs',
  },
  perplexity: {
    envVar: 'PERPLEXITY_API_KEY',
    name: 'Perplexity AI',
    signupUrl: 'https://www.perplexity.ai/settings/api',
    docsUrl: 'https://docs.perplexity.ai/',
  },
  meta: {
    envVar: 'TOGETHERAI_API_KEY',
    name: 'Together AI (Meta Llama)',
    signupUrl: 'https://api.together.xyz/settings/api-keys',
    docsUrl: 'https://docs.together.ai/docs/quickstart',
  },
  togetherai: {
    envVar: 'TOGETHERAI_API_KEY',
    name: 'Together AI',
    signupUrl: 'https://api.together.xyz/settings/api-keys',
    docsUrl: 'https://docs.together.ai/docs/quickstart',
  },
};

export function getMissingProviderMessage(provider: string): string {
  const info = PROVIDER_INFO[provider.toLowerCase()];

  if (!info) {
    return `Unknown provider: ${provider}`;
  }

  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment) {
    return (
      `${info.name} API key not configured.\n\n` +
      `To use ${info.name} models:\n` +
      `1. Get your API key: ${info.signupUrl}\n` +
      `2. Add to .env.local: ${info.envVar}=your-api-key-here\n` +
      `3. Restart your development server\n\n` +
      `Documentation: ${info.docsUrl}`
    );
  }

  return (
    `${info.name} API key not configured. ` +
    `Please set the ${info.envVar} environment variable. ` +
    `Get your API key at: ${info.signupUrl}`
  );
}

export function getProviderSetupInstructions(provider: string): string | null {
  const info = PROVIDER_INFO[provider.toLowerCase()];
  if (!info) return null;

  return (
    `Setting up ${info.name}:\n` +
    `1. Visit ${info.signupUrl} to create an API key\n` +
    `2. Add ${info.envVar}=your-key-here to your .env.local file\n` +
    `3. Restart the application\n` +
    `\nDocumentation: ${info.docsUrl}`
  );
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

export function validateMinimumConfig(): {
  isValid: boolean;
  message?: string;
  warnings?: string[];
} {
  const configured = getConfiguredProviders();
  const warnings: string[] = [];

  if (configured.length === 0) {
    return {
      isValid: false,
      message:
        'No AI providers are configured.\n\n' +
        'To get started, add at least one API key to your .env.local file:\n' +
        '• OpenAI (GPT models): OPENAI_API_KEY=sk-...\n' +
        '• Anthropic (Claude): ANTHROPIC_API_KEY=sk-ant-...\n' +
        '• Google (Gemini): GOOGLE_API_KEY=...\n\n' +
        'See the .env.example file for all available providers.',
    };
  }

  // Warn about recommended providers
  if (!configured.includes('openai') && !configured.includes('anthropic')) {
    warnings.push(
      'Neither OpenAI nor Anthropic is configured. These are the most reliable providers.'
    );
  }

  if (configured.includes('local') && configured.length === 1) {
    warnings.push(
      'Only local models configured. Consider adding cloud providers for better performance.'
    );
  }

  return { isValid: true, warnings: warnings.length > 0 ? warnings : undefined };
}

/**
 * Log environment configuration warnings on startup (development only)
 */
export function logConfigurationStatus(): void {
  if (typeof window !== 'undefined') return; // Server-side only
  if (process.env.NODE_ENV !== 'development') return; // Development only

  const validation = validateMinimumConfig();
  const configured = getConfiguredProviders();

  console.log('\n🔧 OmniDev Configuration Status:');
  console.log('================================');

  if (!validation.isValid) {
    console.error('❌ Configuration Error:');
    console.error(validation.message);
    console.log('\n💡 Quick Start:');
    console.log('   1. Copy .env.example to .env.local');
    console.log('   2. Add your API keys');
    console.log('   3. Restart the dev server\n');
    return;
  }

  console.log(`✅ ${configured.length} provider(s) configured:`);
  configured.forEach((provider) => {
    const info = PROVIDER_INFO[provider];
    console.log(`   • ${info?.name || provider}`);
  });

  if (validation.warnings && validation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    validation.warnings.forEach((warning) => console.log(`   • ${warning}`));
  }

  const unconfigured = Object.keys(PROVIDER_INFO).filter(
    (p) => !configured.includes(p) && p !== 'meta' && p !== 'togetherai'
  );

  if (unconfigured.length > 0) {
    console.log('\n💤 Available but not configured:');
    unconfigured.forEach((provider) => {
      const info = PROVIDER_INFO[provider];
      if (info) console.log(`   • ${info.name} (${info.envVar})`);
    });
  }

  console.log('================================\n');
}
