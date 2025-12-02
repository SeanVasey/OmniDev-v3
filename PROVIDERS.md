# OmniDev V3.0 - Supported LLM Providers

This document lists all supported LLM providers in OmniDev V3.0 with configuration examples and icons.

## 🤖 OpenAI (GPT-4, GPT-3.5, etc.)

**Company:** OpenAI
**Default Model:** gpt-4-turbo
**Documentation:** https://platform.openai.com/docs
**Streaming Support:** ✅ Yes

### Configuration
```bash
OMNIDEV_PROVIDER_NAME=openai
OMNIDEV_PROVIDER_ENDPOINT=https://api.openai.com/v1/chat/completions
OMNIDEV_PROVIDER_API_KEY=sk-...
```

### Usage Example
```typescript
import { OmniDev } from 'omnidev-v3';

const omnidev = new OmniDev({
  provider: {
    name: 'openai',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: process.env.OPENAI_API_KEY,
  },
  maxTokens: 2000,
  temperature: 0.7,
});
```

---

## 🧠 Anthropic Claude

**Company:** Anthropic
**Default Model:** claude-3-5-sonnet-20241022
**Documentation:** https://docs.anthropic.com
**Streaming Support:** ✅ Yes

### Configuration
```bash
OMNIDEV_PROVIDER_NAME=claude
OMNIDEV_PROVIDER_ENDPOINT=https://api.anthropic.com/v1/messages
OMNIDEV_PROVIDER_API_KEY=sk-ant-...
```

### Usage Example
```typescript
const omnidev = new OmniDev({
  provider: {
    name: 'claude',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: process.env.CLAUDE_API_KEY,
  },
  maxTokens: 4096,
  temperature: 0.7,
});
```

---

## 💎 Google Gemini

**Company:** Google
**Default Model:** gemini-1.5-pro
**Documentation:** https://ai.google.dev/docs
**Streaming Support:** ✅ Yes

### Configuration
```bash
OMNIDEV_PROVIDER_NAME=gemini
OMNIDEV_PROVIDER_ENDPOINT=https://generativelanguage.googleapis.com/v1beta/models
OMNIDEV_PROVIDER_API_KEY=...
```

### Usage Example
```typescript
const omnidev = new OmniDev({
  provider: {
    name: 'gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    apiKey: process.env.GEMINI_API_KEY,
  },
  maxTokens: 2000,
  temperature: 0.9,
});
```

---

## ⚡ xAI Grok

**Company:** xAI
**Default Model:** grok-beta
**Documentation:** https://docs.x.ai
**Streaming Support:** ✅ Yes

### Configuration
```bash
OMNIDEV_PROVIDER_NAME=grok
OMNIDEV_PROVIDER_ENDPOINT=https://api.x.ai/v1/chat/completions
OMNIDEV_PROVIDER_API_KEY=xai-...
```

### Usage Example
```typescript
const omnidev = new OmniDev({
  provider: {
    name: 'grok',
    endpoint: 'https://api.x.ai/v1/chat/completions',
    apiKey: process.env.GROK_API_KEY,
  },
  maxTokens: 2000,
  temperature: 0.7,
});
```

---

## 🌬️ Mistral AI

**Company:** Mistral AI
**Default Model:** mistral-large-latest
**Documentation:** https://docs.mistral.ai
**Streaming Support:** ✅ Yes

### Configuration
```bash
OMNIDEV_PROVIDER_NAME=mistral
OMNIDEV_PROVIDER_ENDPOINT=https://api.mistral.ai/v1/chat/completions
OMNIDEV_PROVIDER_API_KEY=...
```

### Usage Example
```typescript
const omnidev = new OmniDev({
  provider: {
    name: 'mistral',
    endpoint: 'https://api.mistral.ai/v1/chat/completions',
    apiKey: process.env.MISTRAL_API_KEY,
  },
  maxTokens: 2000,
  temperature: 0.7,
});
```

---

## 🔍 Perplexity AI

**Company:** Perplexity AI
**Default Model:** llama-3.1-sonar-large-128k-online
**Documentation:** https://docs.perplexity.ai
**Streaming Support:** ✅ Yes

### Configuration
```bash
OMNIDEV_PROVIDER_NAME=perplexity
OMNIDEV_PROVIDER_ENDPOINT=https://api.perplexity.ai/chat/completions
OMNIDEV_PROVIDER_API_KEY=pplx-...
```

### Usage Example
```typescript
const omnidev = new OmniDev({
  provider: {
    name: 'perplexity',
    endpoint: 'https://api.perplexity.ai/chat/completions',
    apiKey: process.env.PERPLEXITY_API_KEY,
  },
  maxTokens: 2000,
  temperature: 0.7,
});
```

---

## 🦙 Meta LLaMA (Hosted)

**Company:** Meta
**Default Model:** meta-llama/Meta-Llama-3.1-70B-Instruct
**Documentation:** https://llama.meta.com
**Streaming Support:** ✅ Yes

### Configuration
```bash
OMNIDEV_PROVIDER_NAME=meta
OMNIDEV_PROVIDER_ENDPOINT=https://api.together.xyz/v1/chat/completions
OMNIDEV_PROVIDER_API_KEY=...
```

### Usage Example
```typescript
const omnidev = new OmniDev({
  provider: {
    name: 'meta',
    endpoint: 'https://api.together.xyz/v1/chat/completions',
    apiKey: process.env.META_API_KEY,
  },
  maxTokens: 2000,
  temperature: 0.7,
});
```

---

## 🏠 LLaMA (Local)

**Company:** Local Inference (Ollama/LM Studio)
**Default Model:** llama3.1
**Documentation:** https://ollama.ai/docs
**Streaming Support:** ✅ Yes

### Configuration
```bash
OMNIDEV_PROVIDER_NAME=llama
OMNIDEV_PROVIDER_ENDPOINT=http://localhost:11434/v1/chat/completions
# No API key required for local inference
OMNIDEV_PROVIDER_API_KEY=
```

### Usage Example
```typescript
const omnidev = new OmniDev({
  provider: {
    name: 'llama',
    endpoint: 'http://localhost:11434/v1/chat/completions',
    // No API key needed for local Ollama
  },
  maxTokens: 2000,
  temperature: 0.7,
});
```

---

## Programmatic Provider Selection

### List All Providers
```typescript
import { getAllProviders, formatProviderDisplay } from 'omnidev-v3';

const providers = getAllProviders();
providers.forEach(provider => {
  console.log(formatProviderDisplay(provider.name));
  console.log(`  Endpoint: ${provider.defaultEndpoint}`);
  console.log(`  Model: ${provider.defaultModel}`);
  console.log(`  Requires API Key: ${provider.requiresApiKey ? 'Yes' : 'No'}`);
});
```

### Get Provider Metadata
```typescript
import { getProviderMetadata } from 'omnidev-v3';

const claudeMeta = getProviderMetadata('claude');
console.log(`${claudeMeta.icon} ${claudeMeta.displayName}`);
console.log(`Color: ${claudeMeta.color}`);
console.log(`Documentation: ${claudeMeta.documentation}`);
```

---

## Provider Comparison

| Provider | Icon | Model | Context Length | Strengths |
|----------|------|-------|----------------|-----------|
| OpenAI | 🤖 | GPT-4 Turbo | 128K | General purpose, coding |
| Claude | 🧠 | Claude 3.5 Sonnet | 200K | Long context, analysis |
| Gemini | 💎 | Gemini 1.5 Pro | 1M | Multimodal, huge context |
| Grok | ⚡ | Grok Beta | Unknown | Real-time data |
| Mistral | 🌬️ | Mistral Large | 32K | Fast, efficient |
| Perplexity | 🔍 | Sonar Large | 128K | Web search, research |
| Meta | 🦙 | LLaMA 3.1 70B | 128K | Open source, powerful |
| LLaMA (Local) | 🏠 | LLaMA 3.1 | Varies | Private, offline |

---

## Adding Your API Keys

When you receive API keys from providers, please share them and I'll update your `.env` file with the proper configuration.

### Current Status
- ✅ OpenAI: Configured
- ⏳ Claude: Awaiting API key
- ⏳ Gemini: Awaiting API key
- ⏳ Grok: Awaiting API key
- ⏳ Mistral: Awaiting API key
- ⏳ Perplexity: Awaiting API key
- ⏳ Meta: Awaiting API key
- ℹ️ LLaMA (Local): No key needed, requires Ollama installation
