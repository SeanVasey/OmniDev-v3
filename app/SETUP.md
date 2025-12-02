# OmniDev V3.0 - Complete Setup Guide

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
cd /home/user/OmniDev-v3/app
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add at minimum:

```env
# Required for AI features
OPENAI_API_KEY=sk-proj-your-key-here

# Optional: Add more providers as needed
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start chatting!

---

## 📦 Detailed Installation

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: Latest version

### Step-by-Step Installation

#### 1. Clone the Repository (if not already done)

```bash
git clone https://github.com/SeanVasey/OmniDev-v3.git
cd OmniDev-v3/app
```

#### 2. Install All Dependencies

```bash
npm install
```

This installs:
- Next.js 14 with App Router
- React 18
- Tailwind CSS with custom theme
- Vercel AI SDK
- Supabase (for future auth & database)
- Zustand (state management)
- Framer Motion (animations)
- Radix UI components
- Sonner (toast notifications)
- React Markdown with syntax highlighting

#### 3. Configure Environment Variables

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

**Minimum Configuration (OpenAI only):**

```env
OPENAI_API_KEY=sk-proj-your-openai-key
```

**Full Configuration (All Providers):**

```env
# OpenAI (GPT-4o, GPT-4 Turbo)
OPENAI_API_KEY=sk-proj-...

# Anthropic (Claude 3.5 Sonnet)
ANTHROPIC_API_KEY=sk-ant-...

# Google (Gemini - Coming Soon)
GOOGLE_API_KEY=...

# xAI (Grok - Coming Soon)
XAI_API_KEY=...

# Mistral AI (Coming Soon)
MISTRAL_API_KEY=...

# Perplexity (Coming Soon)
PERPLEXITY_API_KEY=pplx-...

# Together AI for Meta LLaMA (Coming Soon)
TOGETHER_API_KEY=...

# Ollama for Local LLMs (Optional)
OLLAMA_BASE_URL=http://localhost:11434
```

#### 4. Run Development Server

```bash
npm run dev
```

The app will be available at:
- **Local**: http://localhost:3000
- **Network**: http://[your-ip]:3000

---

## 🎯 Features Currently Working

### ✅ Fully Functional

- **Floating Capsule Composer** - Claude-inspired input with context pills
- **Context Modes** - Thinking, Search, Deep Research, Image Generation
- **AI Streaming** - Real-time responses with GPT-4o and Claude 3.5
- **Message Display** - Markdown rendering with code syntax highlighting
- **Haptic Feedback** - Vibration on all touch interactions
- **Sidebar Navigation** - Swipeable drawer with projects and chats
- **Model Selector** - Header with model switching (UI ready)
- **Incognito Mode** - Zero-persistence ghost mode
- **Toast Notifications** - Success, error, and info messages
- **File Attachments** - UI with preview (backend coming soon)
- **Aspect Ratio Selector** - For image generation prompts
- **Voice Input Button** - UI ready (recording coming soon)
- **Responsive Design** - Mobile-first with 44px touch targets
- **Dark Theme** - VASEY/AI brand colors
- **Auto-scroll** - Messages scroll to bottom automatically

### 🚧 Coming Soon

- **Database Integration** - Supabase for chat history
- **Authentication** - Google OAuth sign-in
- **File Upload** - Actual file storage and processing
- **Voice Recording** - Web Speech API integration
- **Image Generation** - DALL·E 3 integration
- **More Providers** - Gemini, Grok, Mistral, Perplexity
- **Chat History** - Load previous conversations
- **Project Organization** - Folder-based chat management

---

## 🧪 Testing the Application

### Test Basic Chat

1. **Start the app**: `npm run dev`
2. **Open browser**: http://localhost:3000
3. **Type a message**: "Hello! Can you help me build a React component?"
4. **Press Send** (arrow up button)
5. **Watch the response stream** in real-time

### Test Context Modes

1. **Click "Thinking" pill** above the composer
2. **Ask a complex question**: "Explain quantum computing in simple terms"
3. **System prompt adjusts** for extended reasoning

### Test Incognito Mode

1. **Click Clock icon** in composer OR Ghost icon in header
2. **Notice visual changes**: Darker background, ghost watermark
3. **Send messages**: They won't be persisted
4. **Toggle off**: Data is not saved

### Test Markdown Rendering

1. **Ask AI**: "Show me a Python function with comments"
2. **Watch syntax highlighting** in the code block
3. **Click Copy button** to copy code to clipboard

### Test File Attachments (UI Only)

1. **Click + button** in composer
2. **Select "Upload Image"**
3. **Choose a file**
4. **See preview appear** above input
5. **Note**: Backend storage coming soon

---

## 🎨 Customization

### Change Primary Accent Color

Edit `app/globals.css`:

```css
--brand-primary-teal: #22A4C1;  /* Change this hex value */
```

### Add Custom Context Modes

Edit `app/lib/ai/providers.ts`:

```typescript
export function getSystemPrompt(contextMode: string | null): string {
  switch (contextMode) {
    case 'mymode':
      return 'Your custom system prompt here';
    // ...
  }
}
```

Then add a new pill in `app/page.tsx`.

### Change Default Model

Edit `app/page.tsx`:

```typescript
const mockModel: AIModel = {
  id: 'claude-3.5-sonnet',  // Change from 'gpt-4o'
  name: 'Claude 3.5 Sonnet',
  // ...
};
```

---

## 🐛 Troubleshooting

### "Module not found" errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### "API key not configured" error

1. Check `.env.local` exists in `app/` directory
2. Verify `OPENAI_API_KEY` is set correctly
3. Restart dev server: `Ctrl+C` then `npm run dev`

### Streaming not working

1. Ensure you're using OpenAI or Anthropic (currently supported)
2. Check API key is valid
3. Check browser console for errors (F12)

### Haptic feedback not working

- **Desktop**: Haptics only work on mobile devices
- **Mobile Web**: Browser may not support vibration API
- **iOS**: Enable vibration in device settings

### Sidebar not appearing

- **Mobile**: Click hamburger menu (☰) in top-left
- **Desktop**: Sidebar coming in future update

---

## 📱 Mobile Installation (PWA)

### iOS (Safari)

1. Open app in Safari
2. Tap **Share** button
3. Scroll down and tap **"Add to Home Screen"**
4. Tap **Add**
5. Open from home screen for full-screen experience

### Android (Chrome)

1. Open app in Chrome
2. Tap **⋮** menu
3. Tap **"Add to Home screen"**
4. Tap **Add**
5. Open from home screen for app-like experience

---

## 🔐 Security Notes

### API Keys

- **Never commit** `.env.local` to git
- **Rotate keys** if accidentally exposed
- **Use environment variables** for production

### Incognito Mode

- **Zero persistence**: No data is saved to localStorage
- **Session only**: Cleared on page refresh
- **Visual indicator**: Ghost watermark pattern

---

## 📊 Performance Tips

### Optimize Bundle Size

```bash
npm run build
npm run start
```

Production build is much smaller and faster.

### Clear Cache

```bash
rm -rf .next
npm run dev
```

### Monitor Performance

Open DevTools > Performance tab to profile rendering.

---

## 🆘 Getting Help

- **Issues**: https://github.com/SeanVasey/OmniDev-v3/issues
- **Email**: sean@vasey.audio
- **Documentation**: See README.md for full feature list

---

## ✅ Verification Checklist

Before deployment, verify:

- [ ] `npm run build` succeeds without errors
- [ ] Environment variables are set in production
- [ ] API keys are valid and working
- [ ] Mobile responsive design looks good
- [ ] Haptic feedback works on test device
- [ ] Toast notifications appear correctly
- [ ] Messages stream in real-time
- [ ] Markdown and code highlighting work
- [ ] Incognito mode toggles correctly
- [ ] Context pills change behavior

---

**You're all set! Start building with OmniDev V3.0 🚀**
