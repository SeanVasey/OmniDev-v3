'use client';

import Image from 'next/image';

interface ProviderIconProps {
  provider: string;
  size?: number;
  className?: string;
}

const ICON_BASE_URL = 'https://unpkg.com/@lobehub/icons-static-svg@latest/icons';

const PROVIDER_ICONS: Record<string, string> = {
  openai: `${ICON_BASE_URL}/openai.svg`,
  anthropic: `${ICON_BASE_URL}/anthropic.svg`,
  google: `${ICON_BASE_URL}/google.svg`,
  mistral: `${ICON_BASE_URL}/mistral.svg`,
  perplexity: `${ICON_BASE_URL}/perplexity.svg`,
  meta: `${ICON_BASE_URL}/meta.svg`,
  xai: `${ICON_BASE_URL}/x.svg`,
  local: `${ICON_BASE_URL}/ollama.svg`,
};

export function ProviderIcon({ provider, size = 24, className }: ProviderIconProps) {
  const iconUrl = PROVIDER_ICONS[provider.toLowerCase()];

  if (!iconUrl) {
    // Fallback to a simple icon
    return (
      <div
        className={className}
        style={{ width: size, height: size }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" />
        </svg>
      </div>
    );
  }

  return (
    <Image
      src={iconUrl}
      alt={`${provider} icon`}
      width={size}
      height={size}
      className={className}
    />
  );
}
