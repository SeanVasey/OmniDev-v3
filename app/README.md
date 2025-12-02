# OmniDev V3.0 🚀

A modern, mobile-first multimodal AI chat workspace with comprehensive haptic feedback, multiple LLM provider support, and a beautiful glassmorphic design inspired by the best of ChatGPT, Claude, and Qwen.

## ✨ Features

### Design & UX
- 🎨 **VASEY/AI Brand Colors** - Teal primary accent (#22A4C1), charcoal secondary (#32505A), and dark blue background (#2B3E47)
- 📱 **Mobile-First Design** - Optimized for touch interactions with 44px minimum touch targets
- 🎭 **Incognito Mode** - Zero-persistence ghost mode with visual differentiation
- ✨ **Glassmorphism** - Beautiful floating capsule composer with backdrop blur effects
- 💫 **Smooth Animations** - 60fps animations powered by Framer Motion
- 🔔 **Haptic Feedback** - Comprehensive vibration feedback for every interaction

### Core Functionality
- 💬 **Floating Capsule Composer** - Claude-inspired input with context pills
- 🗂️ **Sidebar Navigation** - ChatGPT-style sidebar with projects and recent chats
- 🌐 **Context Modes** - Thinking, Search, Deep Research, and Image Generation
- 📐 **Aspect Ratio Selector** - For image generation tasks (1:1, 3:4, 4:3, 16:9, 9:16)
- 📎 **File Attachments** - Support for documents, images, videos, and audio
- 🎙️ **Voice Input** - Voice recording with waveform visualization
- 🤖 **Model Selector** - Quick switching between different AI models

### LLM Provider Support
- ✅ OpenAI (GPT-4o, GPT-4 Turbo, DALL·E 3)
- ✅ Anthropic (Claude 3.5 Sonnet, Claude 3 Opus)
- ✅ Google (Gemini 1.5 Pro - 1M context window)
- ✅ xAI (Grok Beta)
- ✅ Mistral AI (Mistral Large)
- ✅ Perplexity AI (Sonar Large with web search)
- ✅ Meta LLaMA (via Together AI)
- ✅ Local LLaMA (via Ollama/LM Studio)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.4 + Custom Design Tokens
- **Animations**: Framer Motion 11
- **Typography**: Inter (Google Fonts Variable)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google OAuth)
- **State Management**: Zustand
- **AI SDK**: Vercel AI SDK
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Markdown**: react-markdown + rehype-highlight + remark-gfm

## 📦 Installation

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

   Then edit `.env.local` with your API keys:
   - Supabase credentials
   - LLM provider API keys (OpenAI, Anthropic, Google, etc.)

4. **Set up Supabase database**
   - Create a Supabase project at https://supabase.com
   - Run the database migration from the main OmniDev-v3 project directory:
     ```bash
     cd ..
     # Check for supabase/migrations/ directory
     ```
   - The schema includes tables for profiles, workspaces, chats, messages, and attachments

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to http://localhost:3000

## 🎨 Design System

### Color Palette (VASEY/AI Brand)
- **Primary Accent**: Teal (#22A4C1)
- **Secondary Accent**: Charcoal (#32505A)
- **Tertiary Accent**: Medium Gray (#ABABAB)
- **Background**: Dark Blue (#2B3E47)
- **Temporary Mode**: Blue (#3B82F6)

### Typography
- **Font**: Inter (Variable Weight: 300-700)
- **Scale**: xs (12px) → 4xl (36px)
- **Line Heights**: 1.0 (none) → 2.0 (loose)

### Spacing
- **Base Unit**: 4px
- **Scale**: 0.5 (2px) → 32 (128px)
- **Safe Areas**: iOS notch & home indicator support

### Animations
- **Easings**: Linear, In, Out, In-Out, Bounce, Spring
- **Durations**: 50ms (fastest) → 500ms (slowest)

## 📱 Mobile-First Principles

1. **Touch Targets**: Minimum 44x44px for all interactive elements
2. **Safe Areas**: Respects iOS notch and home indicator
3. **Haptic Feedback**: Vibration patterns for every user interaction
4. **Swipe Gestures**: Swipeable sidebar drawer
5. **Responsive Breakpoints**: xs (375px) → 3xl (1920px)

## 🔐 Incognito Mode

When incognito mode is activated:
- **Zero Persistence**: No database writes
- **Visual Changes**: Pure black background with ghost watermark pattern
- **Temporary Indicator**: Blue clock icon in composer
- **Auto-Cleanup**: Ephemeral chats deleted after 24 hours (if any slip through)

## 📂 Project Structure

```
app/
├── components/
│   ├── chat/
│   │   ├── Composer.tsx          # Floating capsule input
│   │   ├── ContextPill.tsx       # Mode selector pills
│   │   ├── AspectRatioSelector.tsx
│   │   ├── AttachmentPreview.tsx
│   │   └── UploadMenu.tsx
│   ├── sidebar/
│   │   ├── MobileSidebar.tsx     # Swipeable drawer
│   │   └── SidebarContent.tsx    # Navigation internals
│   ├── header/
│   │   └── ModelSelector.tsx     # Model picker header
│   └── ui/
│       ├── avatar.tsx            # Radix Avatar
│       └── scroll-area.tsx       # Radix ScrollArea
├── hooks/
│   ├── useHaptics.ts             # Haptic feedback
│   ├── useAutoResizeTextarea.ts
│   └── useMediaQuery.ts
├── lib/
│   ├── utils.ts                  # Utility functions
│   ├── haptics/
│   │   └── triggers.ts           # Haptic trigger map
│   └── ai/
│       └── models.ts             # AI model definitions
├── types/
│   └── index.ts                  # TypeScript types
├── globals.css                   # Design tokens
├── layout.tsx                    # Root layout
├── page.tsx                      # Main chat page
└── tailwind.config.ts            # Tailwind configuration
```

## 🚀 Development Workflow

1. **Start dev server**: `npm run dev`
2. **Build for production**: `npm run build`
3. **Start production server**: `npm start`
4. **Lint**: `npm run lint`

## 🧪 Testing

The application includes comprehensive haptic feedback testing across all interactions:
- Button presses (light, medium, heavy)
- Sidebar gestures (swipe start, swipe complete)
- Mode toggles (incognito enter/exit)
- Context pill selection
- File uploads
- Message actions

Test on actual mobile devices to experience the full haptic feedback system.

## 📖 Usage Guide

### Creating a New Chat
1. Tap the hamburger menu (mobile) or use the sidebar (desktop)
2. Click "+ New Chat"
3. Start typing in the floating composer

### Selecting Context Modes
Above the composer, tap any context pill:
- **Thinking**: Extended reasoning
- **Search**: Web search capabilities
- **Deep Research**: Comprehensive research mode
- **Image Gen**: Generate images (shows aspect ratio selector)

### Attaching Files
1. Click the "+" button in the composer
2. Select file type (document, image, video, audio)
3. Choose files from your device
4. Preview appears above the input

### Activating Incognito Mode
- Tap the Clock icon in the composer **OR**
- Tap the Ghost icon in the header

### Voice Input
1. Tap the microphone icon
2. Speak your message
3. Tap again to stop recording
4. Transcription appears in the input

## 🔧 Configuration

### Adding New LLM Providers
Edit `lib/ai/models.ts` to add new models to the `AI_MODELS` object.

### Customizing Haptic Patterns
Edit `lib/haptics/triggers.ts` to adjust vibration patterns for different interactions.

### Modifying Design Tokens
All design tokens are in `globals.css` under CSS custom properties.

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests.

## 📧 Support

For issues and questions:
- GitHub Issues: https://github.com/SeanVasey/OmniDev-v3/issues
- Email: sean@vasey.audio

## 🙏 Acknowledgments

- Design inspiration from ChatGPT, Claude, and Qwen
- VASEY/AI brand colors
- Inter font by Rasmus Andersson
- Radix UI for accessible components
- Vercel for the AI SDK

---

**Built with ❤️ for the developer community**
