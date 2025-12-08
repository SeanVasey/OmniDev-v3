# OmniDev V3.0

A modern, mobile-first multimodal AI chat workspace with comprehensive haptic feedback, multiple LLM provider support, usage monitoring, and a beautiful glassmorphic design inspired by the best of ChatGPT, Claude, and Qwen.

## Features

### Design & UX
- **ChatGPT-Inspired Theme** - Reddit Sans font, refined color palette with CSS variables
- **Mobile-First Design** - Optimized for touch interactions with 44px minimum touch targets
- **Incognito Mode** - Zero-persistence ghost mode with visual differentiation
- **Glassmorphism** - Beautiful floating capsule composer with backdrop blur effects
- **Smooth Animations** - 60fps animations powered by Framer Motion
- **Haptic Feedback** - Comprehensive vibration feedback for every interaction

### Core Functionality
- **Floating Capsule Composer** - Claude-inspired input with context pills
- **Sidebar Navigation** - ChatGPT-style sidebar with projects, starred chats, and media library
- **Context Modes** - Thinking, Search, Deep Research, Image, and Video Generation
- **Aspect Ratio Selector** - For image/video generation (1:1, 3:4, 4:3, 16:9, 9:16)
- **File Attachments** - Support for documents, images, videos, code files
- **Code Blocks** - Syntax highlighting with language labels and copy functionality
- **Starred Chats** - Quick access to favorite conversations
- **Media Library** - Thumbnail grid of recent image/video generations

### LLM Provider Support (25+ Models)

| Provider | Models |
|----------|--------|
| **OpenAI** | GPT-5.1 series, GPT-5 series, DALL-E 3, Sora 2 |
| **Anthropic** | Claude 4.5 Opus, Sonnet, Haiku |
| **Google** | Gemini 3 Pro (2M context), Gemini 2.5 Pro/Flash |
| **xAI** | Grok 4.1, Grok 4 |
| **Mistral AI** | Mistral Large |
| **Perplexity** | Sonar Large (web search) |
| **Meta** | LLaMA 3.1 70B (via Together AI) |
| **Local** | LLaMA 3.1 (via Ollama) |

### Usage & Billing
- **Usage Monitor** - Toggleable widget showing token usage, costs, and limits
- **Subscription Tiers** - Free, Pro, and Enterprise with configurable limits
- **Quota Enforcement** - Automatic limit checking before requests
- **Usage Analytics** - Dashboard with charts, top models, and activity history

### Pages
- `/` - Main chat interface
- `/chats` - All conversations with search and filters
- `/models` - AI models directory with capabilities and tips
- `/help` - Documentation wiki and guides
- `/usage` - Usage analytics and billing dashboard
- `/settings` - App preferences and account settings
- `/profile` - User profile management

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.4 + CSS Variables Design System
- **Animations**: Framer Motion 11
- **Typography**: Reddit Sans (Google Fonts)
- **Database**: Supabase (PostgreSQL with RLS)
- **Auth**: Supabase Auth (Email, Google OAuth)
- **State Management**: Zustand with Persistence
- **AI SDK**: Vercel AI SDK v5
- **UI Components**: Radix UI Primitives
- **Icons**: Lucide React
- **Markdown**: react-markdown + rehype-highlight + remark-gfm

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SeanVasey/OmniDev-v3.git
   cd OmniDev-v3/app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` with your API keys:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

   # LLM Providers
   OPENAI_API_KEY=sk-...
   ANTHROPIC_API_KEY=sk-ant-...
   GOOGLE_GENERATIVE_AI_API_KEY=...
   XAI_API_KEY=...
   MISTRAL_API_KEY=...
   PERPLEXITY_API_KEY=...
   TOGETHER_AI_API_KEY=...
   ```

4. **Set up Supabase database**

   Run the migrations in your Supabase SQL Editor:
   ```bash
   # From project root
   cat supabase/migrations/001_initial_schema.sql
   cat app/supabase/migrations/20241204_extended_profiles.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to http://localhost:3000

## Database Schema

### Tables
- `profiles` - User profiles with subscription tiers
- `workspaces` - Project folders for organizing chats
- `chats` - Conversation metadata with starring/pinning
- `messages` - Chat messages with attachments and metrics
- `attachments` - File storage metadata

### Row Level Security
All tables have RLS policies ensuring users can only access their own data.

## Project Structure

```
app/
├── app/
│   ├── api/
│   │   ├── chat/           # Chat streaming endpoint
│   │   ├── generate-image/ # Image generation
│   │   ├── generate-video/ # Video generation
│   │   └── usage/          # Usage tracking API
│   ├── chats/              # All chats page
│   ├── help/               # Documentation wiki
│   ├── models/             # Models directory
│   ├── profile/            # User profile
│   ├── settings/           # App settings
│   ├── usage/              # Usage analytics
│   ├── components/
│   │   ├── chat/           # Chat components
│   │   ├── header/         # Header components
│   │   ├── projects/       # Project settings
│   │   ├── sidebar/        # Sidebar components
│   │   ├── usage/          # Usage monitor
│   │   └── ui/             # Radix UI wrappers
│   ├── hooks/              # Custom React hooks
│   ├── lib/
│   │   ├── ai/             # AI model definitions
│   │   ├── auth/           # Auth context
│   │   ├── haptics/        # Haptic feedback
│   │   └── supabase/       # Database helpers
│   ├── stores/             # Zustand stores
│   └── types/              # TypeScript types
├── public/                 # Static assets
└── supabase/              # Database migrations
```

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Subscription Tiers

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Tokens/month | 100K | 2M | 10M |
| Images/month | 10 | 100 | 500 |
| Videos/month | 0 | 20 | 100 |
| Max file size | 5MB | 25MB | 100MB |
| Models | Basic | All | All + Priority |

## API Endpoints

- `POST /api/chat` - Stream chat responses
- `POST /api/generate-image` - Generate images
- `POST /api/generate-video` - Generate videos
- `GET/POST /api/usage` - Usage tracking

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests.

## License

MIT License - see LICENSE file for details

## Support

- GitHub Issues: https://github.com/SeanVasey/OmniDev-v3/issues
- Email: support@omnidev.ai

---

**Built with love for the developer community**
