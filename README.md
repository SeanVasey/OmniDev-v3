# OmniDev V3.0

[![CI](https://github.com/SeanVasey/OmniDev-v3/actions/workflows/ci.yml/badge.svg)](https://github.com/SeanVasey/OmniDev-v3/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, production-ready TypeScript framework for building personal LLM tools with comprehensive testing, configuration management, and provider support.

## Features

- ✅ **TypeScript First** - Full TypeScript support with strict mode
- ✅ **LLM Provider Support** - OpenAI integration with extensible provider system
- ✅ **Configuration Management** - Environment variable support with validation
- ✅ **Robust Error Handling** - Custom error classes for different failure scenarios
- ✅ **Structured Logging** - Configurable log levels and formatting
- ✅ **Comprehensive Testing** - 21 tests with 89% code coverage
- ✅ **CI/CD Pipeline** - GitHub Actions workflow for automated testing
- ✅ **Pre-commit Hooks** - Automated linting and formatting with Husky
- ✅ **Code Quality** - ESLint and Prettier configured

## Installation

```bash
npm install omnidev-v3
```

## Quick Start

### Basic Usage

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
  verbose: true,
});

const response = await omnidev.chat([
  { role: 'user', content: 'Hello! How can you help me?' },
]);

console.log(response);
```

### Using Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure your environment variables:
```env
OMNIDEV_PROVIDER_NAME=openai
OMNIDEV_PROVIDER_ENDPOINT=https://api.openai.com/v1/chat/completions
OMNIDEV_PROVIDER_API_KEY=your_api_key_here
OMNIDEV_MAX_TOKENS=2000
OMNIDEV_TEMPERATURE=0.7
```

3. Load configuration from environment:
```typescript
import { ConfigLoader } from 'omnidev-v3';

const config = ConfigLoader.fromEnv();
const omnidev = new OmniDev(config);
```

## API Reference

### OmniDev Class

#### Constructor

```typescript
new OmniDev(config: OmniDevConfig)
```

Creates a new OmniDev instance with the provided configuration.

#### Methods

##### `chat(messages: Message[]): Promise<string>`

Send messages to the LLM and get a response.

```typescript
const response = await omnidev.chat([
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is TypeScript?' },
]);
```

##### `getConfig(): OmniDevConfig`

Get the current configuration (returns a copy to prevent mutation).

##### `updateConfig(updates: Partial<OmniDevConfig>): void`

Update configuration settings.

```typescript
omnidev.updateConfig({ temperature: 0.9 });
```

### Types

#### OmniDevConfig

```typescript
interface OmniDevConfig {
  provider: LLMProvider;
  maxTokens?: number;
  temperature?: number;
  verbose?: boolean;
}
```

#### LLMProvider

```typescript
interface LLMProvider {
  name: string;
  endpoint: string;
  apiKey?: string;
}
```

#### Message

```typescript
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

### Error Classes

- `OmniDevError` - Base error class
- `ConfigurationError` - Configuration validation errors
- `LLMProviderError` - Provider communication errors
- `ValidationError` - Input validation errors

## Development

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build
npm run build

# Lint
npm run lint

# Format code
npm run format

# Generate documentation
npm run docs
```

### Project Structure

```
OmniDev-v3/
├── src/
│   ├── index.ts           # Main entry point
│   ├── types.ts           # TypeScript type definitions
│   ├── omnidev.ts         # Core OmniDev class
│   ├── config.ts          # Configuration management
│   ├── logger.ts          # Logging system
│   ├── errors.ts          # Custom error classes
│   └── providers/         # LLM provider implementations
│       ├── base.ts        # Base provider class
│       ├── openai.ts      # OpenAI provider
│       └── index.ts       # Provider exports
├── .github/
│   └── workflows/
│       └── ci.yml         # GitHub Actions CI
├── .husky/                # Git hooks
├── dist/                  # Build output
├── coverage/              # Test coverage reports
├── docs/                  # Generated API docs
└── tests/                 # Test files

```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Code Quality

The project uses:
- **ESLint** for linting
- **Prettier** for code formatting
- **Husky** for pre-commit hooks
- **lint-staged** for staged file linting

Pre-commit hooks automatically run linting and formatting on staged files.

## CI/CD

GitHub Actions workflow runs on:
- Push to `main`, `master`, `develop`, and `claude/**` branches
- Pull requests to `main`, `master`, `develop`

The CI pipeline:
1. Tests on Node.js 18.x, 20.x, and 22.x
2. Runs linting and formatting checks
3. Builds the project
4. Runs tests with coverage
5. Uploads coverage to Codecov

## Configuration Validation

OmniDev validates configuration on instantiation:
- Provider name and endpoint are required
- maxTokens must be greater than 0
- temperature must be between 0 and 2

Invalid configuration throws a `ConfigurationError` or `ValidationError`.

## Logging

The logger supports multiple log levels:
- `ERROR` - Critical errors only
- `WARN` - Warnings and errors
- `INFO` - Informational messages (default)
- `DEBUG` - Detailed debugging information

```typescript
import { Logger, LogLevel } from 'omnidev-v3';

const logger = new Logger('MyApp', LogLevel.DEBUG);
logger.info('Application started');
logger.debug('Debug information');
```

## Extending Providers

To add a new LLM provider:

1. Extend `BaseLLMProvider`:

```typescript
import { BaseLLMProvider, LLMResponse } from 'omnidev-v3';

export class MyProvider extends BaseLLMProvider {
  async sendRequest(
    messages: Message[],
    options?: { maxTokens?: number; temperature?: number }
  ): Promise<LLMResponse> {
    // Implement your provider logic
  }
}
```

2. Register in `omnidev.ts`:

```typescript
private createProvider(): BaseLLMProvider {
  switch (name.toLowerCase()) {
    case 'myprovider':
      return new MyProvider(name, endpoint, apiKey);
    // ... other providers
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Issues: [GitHub Issues](https://github.com/SeanVasey/OmniDev-v3/issues)
- Documentation: See IMPROVEMENTS.md for detailed analysis

## Changelog

### Version 3.0.0

- Initial release with complete TypeScript infrastructure
- OpenAI provider support
- Comprehensive testing suite
- CI/CD pipeline
- Configuration management
- Logging system
- Error handling  
