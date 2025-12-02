/**
 * Provider metadata including branding, icons, and default configurations
 */

export interface ProviderMetadata {
  name: string;
  displayName: string;
  company: string;
  icon: string; // Emoji or icon identifier
  svgIcon: string; // Path to SVG icon file
  color: string; // Brand color
  defaultEndpoint: string;
  defaultModel: string;
  supportsStreaming: boolean;
  requiresApiKey: boolean;
  documentation: string;
}

export const PROVIDER_METADATA: Record<string, ProviderMetadata> = {
  openai: {
    name: 'openai',
    displayName: 'GPT (OpenAI)',
    company: 'OpenAI',
    icon: '🤖',
    svgIcon: '/assets/icons/openai.svg',
    color: '#10A37F',
    defaultEndpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4-turbo',
    supportsStreaming: true,
    requiresApiKey: true,
    documentation: 'https://platform.openai.com/docs',
  },
  claude: {
    name: 'claude',
    displayName: 'Claude',
    company: 'Anthropic',
    icon: '🧠',
    svgIcon: '/assets/icons/claude.svg',
    color: '#D97757',
    defaultEndpoint: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3-5-sonnet-20241022',
    supportsStreaming: true,
    requiresApiKey: true,
    documentation: 'https://docs.anthropic.com',
  },
  gemini: {
    name: 'gemini',
    displayName: 'Gemini',
    company: 'Google',
    icon: '💎',
    svgIcon: '/assets/icons/gemini.svg',
    color: '#4285F4',
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-1.5-pro',
    supportsStreaming: true,
    requiresApiKey: true,
    documentation: 'https://ai.google.dev/docs',
  },
  grok: {
    name: 'grok',
    displayName: 'Grok',
    company: 'xAI',
    icon: '⚡',
    svgIcon: '/assets/icons/grok.svg',
    color: '#000000',
    defaultEndpoint: 'https://api.x.ai/v1/chat/completions',
    defaultModel: 'grok-beta',
    supportsStreaming: true,
    requiresApiKey: true,
    documentation: 'https://docs.x.ai',
  },
  mistral: {
    name: 'mistral',
    displayName: 'Mistral',
    company: 'Mistral AI',
    icon: '🌬️',
    svgIcon: '/assets/icons/mistral.svg',
    color: '#FF6B35',
    defaultEndpoint: 'https://api.mistral.ai/v1/chat/completions',
    defaultModel: 'mistral-large-latest',
    supportsStreaming: true,
    requiresApiKey: true,
    documentation: 'https://docs.mistral.ai',
  },
  perplexity: {
    name: 'perplexity',
    displayName: 'Perplexity',
    company: 'Perplexity AI',
    icon: '🔍',
    svgIcon: '/assets/icons/perplexity.svg',
    color: '#1FB0FF',
    defaultEndpoint: 'https://api.perplexity.ai/chat/completions',
    defaultModel: 'llama-3.1-sonar-large-128k-online',
    supportsStreaming: true,
    requiresApiKey: true,
    documentation: 'https://docs.perplexity.ai',
  },
  meta: {
    name: 'meta',
    displayName: 'LLaMA (Meta)',
    company: 'Meta',
    icon: '🦙',
    svgIcon: '/assets/icons/meta.svg',
    color: '#0668E1',
    defaultEndpoint: 'https://api.together.xyz/v1/chat/completions',
    defaultModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    supportsStreaming: true,
    requiresApiKey: true,
    documentation: 'https://llama.meta.com',
  },
  llama: {
    name: 'llama',
    displayName: 'LLaMA (Local)',
    company: 'Local Inference',
    icon: '🏠',
    svgIcon: '/assets/icons/llama.svg',
    color: '#6B7280',
    defaultEndpoint: 'http://localhost:11434/v1/chat/completions',
    defaultModel: 'llama3.1',
    supportsStreaming: true,
    requiresApiKey: false,
    documentation: 'https://ollama.ai/docs',
  },
};

/**
 * Get provider metadata by name
 */
export function getProviderMetadata(providerName: string): ProviderMetadata | undefined {
  return PROVIDER_METADATA[providerName.toLowerCase()];
}

/**
 * Get all available providers
 */
export function getAllProviders(): ProviderMetadata[] {
  return Object.values(PROVIDER_METADATA);
}

/**
 * Format provider display string with icon
 */
export function formatProviderDisplay(providerName: string): string {
  const metadata = getProviderMetadata(providerName);
  if (!metadata) {
    return providerName;
  }
  return `${metadata.icon} ${metadata.displayName} (${metadata.company})`;
}
