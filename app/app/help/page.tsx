'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  BookOpen,
  MessageSquare,
  Image as ImageIcon,
  Settings,
  Keyboard,
  Zap,
  Shield,
  CreditCard,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Brain,
  Upload,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
}

const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    description: 'Learn the basics of using OmniDev',
    articles: [
      {
        id: 'welcome',
        title: 'Welcome to OmniDev',
        content: `
**OmniDev** is a powerful AI-powered chat interface that connects you to multiple cutting-edge AI models from leading providers.

### Key Features

- **Multi-Model Support**: Access 25+ AI models from OpenAI, Anthropic, Google, xAI, and more
- **Context Modes**: Specialized modes for thinking, research, image, and video generation
- **Workspaces**: Organize your conversations into projects
- **File Attachments**: Upload images, documents, and code files
- **Usage Tracking**: Monitor your token usage and costs

### Quick Start

1. Select a model from the header dropdown
2. Type your message in the composer
3. Press Enter or click Send
4. View the AI's response in real-time

The sidebar provides quick access to your recent chats, starred conversations, and settings.
        `,
      },
      {
        id: 'interface',
        title: 'Understanding the Interface',
        content: `
### Header

- **Model Selector**: Click to switch between AI models
- **Incognito Toggle**: Enable for private sessions (not saved)
- **Menu Button**: Opens the sidebar on mobile

### Sidebar

- **New Chat**: Start a fresh conversation
- **Starred Chats**: Quick access to your favorite conversations
- **Recent Chats**: Your conversation history
- **Media Library**: Recent image/video generations
- **Usage Monitor**: Track your token usage
- **Settings**: Access app preferences

### Composer

The message input area at the bottom includes:

- **Context Mode Buttons**: Toggle thinking, search, research, image, or video modes
- **Attachment Button**: Upload files to include in your message
- **Model Selector**: Quick model switching
- **Incognito Toggle**: Private session mode
- **Send Button**: Submit your message
        `,
      },
      {
        id: 'account',
        title: 'Account & Authentication',
        content: `
### Creating an Account

1. Click "Sign Up" on the login page
2. Enter your email, name, and password
3. Verify your email address
4. Complete your profile setup

### Google Sign-In

Click "Continue with Google" for quick authentication using your Google account.

### Guest Mode

You can use OmniDev without an account, but:
- Conversations won't be saved
- File uploads are temporary
- Usage limits are restricted

### Profile Settings

Access your profile from the sidebar to:
- Update your name and avatar
- Change your subscription tier
- Manage billing information
- Update notification preferences
        `,
      },
    ],
  },
  {
    id: 'chat',
    title: 'Chat & Conversations',
    icon: MessageSquare,
    description: 'Master the chat interface',
    articles: [
      {
        id: 'sending-messages',
        title: 'Sending Messages',
        content: `
### Basic Messaging

Type your message and press **Enter** to send. Use **Shift+Enter** for new lines.

### Formatting

Messages support Markdown formatting:

- **Bold**: \`**text**\`
- *Italic*: \`*text*\`
- \`Code\`: \`\\\`code\\\`\`
- Code blocks: Triple backticks with language
- Lists: Use \`-\` or \`1.\`
- Links: \`[text](url)\`

### Attachments

Click the attachment button to upload:
- Images (PNG, JPG, GIF, WebP)
- Documents (PDF, TXT, MD)
- Code files (JS, TS, PY, etc.)

### Message Actions

Hover over messages to:
- Copy message content
- Copy code blocks
- Star important messages
        `,
      },
      {
        id: 'context-modes',
        title: 'Context Modes',
        content: `
### Thinking Mode (Brain icon)

Enables extended reasoning for complex problems:
- Multi-step problem solving
- Detailed analysis
- Logical reasoning chains

Best for: Math, logic puzzles, complex coding

### Research Mode (Globe icon)

Optimizes responses for research tasks:
- Comprehensive answers
- Multiple perspectives
- Citation-style responses

Best for: Essays, reports, fact-finding

### Search Mode (Search icon)

Quick, focused responses:
- Concise answers
- Direct information
- Fast turnaround

Best for: Quick questions, lookups

### Image Mode (Image icon)

Generates images from text descriptions:
- Describe what you want to create
- Choose aspect ratio
- AI generates the image

Best for: Creative visuals, concept art

### Video Mode (Video icon)

Generates short video clips:
- Describe the scene
- Specify duration
- AI creates the video

Best for: Motion graphics, short clips
        `,
      },
      {
        id: 'managing-chats',
        title: 'Managing Conversations',
        content: `
### Starting New Chats

Click "New Chat" in the sidebar or press **Ctrl/Cmd + N**.

### Starring Chats

Star important conversations for quick access:
1. Open the chat
2. Click the star icon in the chat header
3. Starred chats appear at the top of the sidebar

### Organizing with Workspaces

Create workspaces to organize related chats:
1. Click "Create Project" in the sidebar
2. Name your workspace
3. Choose an icon and color
4. Move chats into the workspace

### Archiving & Deleting

- **Archive**: Hide old chats without deleting
- **Delete**: Permanently remove conversations

Access these options from the chat's menu (three dots).

### Chat History

View all your chats in the Chats page:
1. Click "All Chats" in the sidebar
2. Search and filter conversations
3. Sort by date or name
        `,
      },
    ],
  },
  {
    id: 'models',
    title: 'AI Models',
    icon: Brain,
    description: 'Learn about available models',
    articles: [
      {
        id: 'choosing-models',
        title: 'Choosing the Right Model',
        content: `
### Model Categories

**Chat Models** - General conversation and tasks
- GPT-5.1 Chat (OpenAI) - Best all-around
- Claude 4.5 Sonnet (Anthropic) - Nuanced responses
- Gemini 2.5 Flash (Google) - Fast responses

**Code Models** - Programming tasks
- GPT-5.1 Codex - Code generation
- GPT-5.1 Codex Max - Large codebases

**Research Models** - Information gathering
- Sonar Large (Perplexity) - Real-time search
- Gemini 3 Pro - Long documents

**Creative Models** - Image/video generation
- DALL-E 3 - Image generation
- Sora 2 - Video generation

### Switching Models

Click the model name in the header to open the selector. Models are grouped by provider and capability.

### Model Capabilities

Look for these icons:
- 🧠 Thinking mode support
- 👁️ Vision (image understanding)
- 🔍 Research optimization
- 🖼️ Image generation
- 🎬 Video generation
        `,
      },
      {
        id: 'model-tips',
        title: 'Model Tips & Best Practices',
        content: `
### For Chat & General Tasks

- **GPT-5.1 Chat**: Best default choice
- **Claude 4.5 Sonnet**: Great for nuanced writing
- **Gemini 2.5 Flash**: When speed matters

### For Coding

- **GPT-5.1 Codex**: Standard coding tasks
- **GPT-5.1 Codex Max**: Large projects (512K context)
- Use code blocks for better responses

### For Research

- **Sonar Large**: Always provides sources
- **Gemini 3 Pro**: 2M token context for large documents
- **Grok 4.1**: Real-time current events

### For Long Content

- **Gemini 3 Pro**: 2M token context
- **Claude 4.5 Opus**: 500K context
- Split very long tasks into sections

### Cost Optimization

- Use Haiku/Flash for simple tasks
- Use Pro/Max only when needed
- Monitor usage in the Usage page
        `,
      },
    ],
  },
  {
    id: 'media',
    title: 'Image & Video Generation',
    icon: ImageIcon,
    description: 'Create AI-generated media',
    articles: [
      {
        id: 'image-generation',
        title: 'Generating Images',
        content: `
### Getting Started

1. Click the Image mode button in the composer
2. Type a detailed description
3. Select aspect ratio (1:1, 16:9, 4:3, etc.)
4. Press Enter to generate

### Writing Good Prompts

**Be Specific**
- Bad: "A dog"
- Good: "A golden retriever puppy playing in autumn leaves, warm sunlight, photorealistic"

**Include Details**
- Style: photorealistic, illustration, watercolor
- Lighting: natural light, studio lighting, golden hour
- Mood: peaceful, dramatic, playful
- Composition: close-up, wide shot, aerial view

### Aspect Ratios

- **1:1**: Square, great for profiles and icons
- **16:9**: Widescreen, presentations and headers
- **9:16**: Vertical, mobile and stories
- **4:3**: Classic, general purpose
- **3:4**: Portrait, character art

### Tips

- Reference art styles: "in the style of Studio Ghibli"
- Specify what to avoid: "no text, no watermarks"
- Use quality terms: "highly detailed, 8K, professional"
        `,
      },
      {
        id: 'video-generation',
        title: 'Generating Videos',
        content: `
### Getting Started

1. Click the Video mode button in the composer
2. Describe your scene in detail
3. Specify motion and action
4. Press Enter to generate

### Writing Video Prompts

**Describe the Scene**
- Setting and environment
- Characters or subjects
- Lighting and atmosphere

**Specify Motion**
- Camera movement: pan, zoom, tracking
- Subject motion: walking, flying, rotating
- Effects: slow motion, time-lapse

### Example Prompts

"A serene Japanese garden with cherry blossoms falling gently, koi fish swimming in a pond, camera slowly panning across the scene"

"Timelapse of a city skyline transitioning from day to night, lights turning on in buildings, stars appearing in the sky"

### Limitations

- Maximum duration: 10 seconds (Pro), 30 seconds (Enterprise)
- Complex scenes may take longer
- Some subjects may be restricted
        `,
      },
    ],
  },
  {
    id: 'files',
    title: 'File Attachments',
    icon: Upload,
    description: 'Upload and manage files',
    articles: [
      {
        id: 'uploading-files',
        title: 'Uploading Files',
        content: `
### Supported File Types

**Images**
- PNG, JPG, JPEG, GIF, WebP
- Up to 20MB per image

**Documents**
- PDF, TXT, MD, DOC, DOCX
- Up to 25MB per document

**Code Files**
- JS, TS, PY, JAVA, CPP, C, CS, GO, RS, RB, PHP, HTML, CSS, JSON, XML, YAML
- Up to 10MB per file

### How to Upload

1. Click the attachment button (paperclip icon)
2. Select files from your device
3. Preview attachments before sending
4. Send your message with attachments

### Drag and Drop

Simply drag files onto the chat window to upload them.

### Removing Attachments

Click the X on any attachment preview to remove it before sending.
        `,
      },
      {
        id: 'file-analysis',
        title: 'AI File Analysis',
        content: `
### Image Analysis

Upload images for the AI to:
- Describe image contents
- Extract text (OCR)
- Analyze charts and diagrams
- Compare multiple images

### Document Analysis

Upload documents for the AI to:
- Summarize content
- Answer questions about the text
- Extract key information
- Translate content

### Code Analysis

Upload code files for the AI to:
- Explain code functionality
- Find bugs and issues
- Suggest improvements
- Generate documentation

### Tips

- Use vision-capable models for images
- Provide context with your question
- For large files, highlight specific sections
        `,
      },
    ],
  },
  {
    id: 'workspaces',
    title: 'Workspaces & Organization',
    icon: FolderOpen,
    description: 'Organize your work',
    articles: [
      {
        id: 'creating-workspaces',
        title: 'Creating Workspaces',
        content: `
### What are Workspaces?

Workspaces (Projects) help you organize related conversations. Think of them as folders for your chats.

### Creating a Workspace

1. Click "Create Project" in the sidebar
2. Enter a name (e.g., "Website Redesign")
3. Choose an icon and color
4. Add an optional description
5. Click Create

### Workspace Icons

- 📁 Folder (default)
- 💻 Code
- 🎨 Design
- 📊 Data
- 🔬 Research
- ✍️ Writing
- 🖼️ Image
- 🎬 Video
- 🎵 Music
- 💬 Chat

### Workspace Colors

Choose from: Orange, Blue, Green, Purple, Pink, Red, Yellow, Teal
        `,
      },
      {
        id: 'workspace-settings',
        title: 'Workspace Settings',
        content: `
### Accessing Settings

Click the gear icon on any workspace to open settings.

### General Settings

- **Name**: Rename the workspace
- **Color**: Change the color theme
- **Icon**: Update the icon
- **Archive**: Hide from main view

### System Instructions

Set default instructions for all chats in the workspace:

"You are a helpful coding assistant. Always provide code examples and explain your reasoning."

### Characteristics

Define the AI's personality for this workspace:
- Technical
- Friendly
- Concise
- Detailed
- Creative

### Deleting Workspaces

Deleting a workspace moves all chats to "Uncategorized". Chats are not deleted.
        `,
      },
    ],
  },
  {
    id: 'usage',
    title: 'Usage & Billing',
    icon: CreditCard,
    description: 'Monitor usage and manage billing',
    articles: [
      {
        id: 'understanding-usage',
        title: 'Understanding Usage',
        content: `
### Tokens Explained

AI models process text in "tokens" - roughly 4 characters or 3/4 of a word.

- "Hello, how are you?" ≈ 6 tokens
- A typical paragraph ≈ 100-200 tokens
- A page of text ≈ 500-800 tokens

### Usage Types

**Input Tokens**: Your messages and context
**Output Tokens**: AI responses
**Image Generations**: Number of images created
**Video Generations**: Seconds of video created

### Usage Monitor

The sidebar shows your current usage:
- Token count and percentage
- Cost estimate
- Images/videos generated

### Detailed Analytics

Visit the Usage page for:
- Daily/weekly/monthly breakdowns
- Top models by usage
- Cost by category
- Activity history
        `,
      },
      {
        id: 'subscription-tiers',
        title: 'Subscription Tiers',
        content: `
### Free Tier

- 100K tokens/month
- 10K tokens/day
- 10 images/month
- No video generation
- 5MB file limit
- Limited model access

### Pro Tier

- 2M tokens/month
- 100K tokens/day
- 100 images/month
- 20 videos/month
- 25MB file limit
- All models available

### Enterprise Tier

- 10M tokens/month
- 500K tokens/day
- 500 images/month
- 100 videos/month
- 100MB file limit
- Priority support
- Custom integrations

### Upgrading

Visit Settings > Subscription to upgrade your plan.
        `,
      },
    ],
  },
  {
    id: 'settings',
    title: 'Settings & Preferences',
    icon: Settings,
    description: 'Customize your experience',
    articles: [
      {
        id: 'app-settings',
        title: 'App Settings',
        content: `
### Theme

- **Dark Mode**: Default, easier on eyes
- **Light Mode**: Bright interface

### Haptic Feedback

Enable/disable vibration feedback on mobile devices.

### Notifications

Control notification preferences:
- Chat responses
- Usage alerts
- New features

### Compact Mode

Reduce spacing for more content on screen.

### Default Model

Set your preferred default model for new chats.
        `,
      },
      {
        id: 'privacy-security',
        title: 'Privacy & Security',
        content: `
### Incognito Mode

Enable for private sessions:
- Conversations not saved
- No history recorded
- Data cleared on exit

Toggle with the eye icon in the header or composer.

### Data Handling

- Conversations stored securely in the cloud
- Attachments stored in encrypted storage
- Row-level security protects your data

### Deleting Data

- Delete individual chats from the menu
- Clear all data from Settings > Privacy
- Request account deletion from Profile

### Security Tips

- Use strong passwords
- Enable two-factor authentication
- Review connected apps regularly
- Log out on shared devices
        `,
      },
    ],
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    icon: Keyboard,
    description: 'Work faster with shortcuts',
    articles: [
      {
        id: 'keyboard-shortcuts',
        title: 'All Keyboard Shortcuts',
        content: `
### General

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + N | New chat |
| Ctrl/Cmd + / | Focus search |
| Ctrl/Cmd + , | Open settings |
| Escape | Close modals |

### Composer

| Shortcut | Action |
|----------|--------|
| Enter | Send message |
| Shift + Enter | New line |
| Ctrl/Cmd + Enter | Send with thinking mode |
| Ctrl/Cmd + U | Upload file |

### Messages

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + C | Copy selected message |
| Ctrl/Cmd + Shift + C | Copy code block |

### Navigation

| Shortcut | Action |
|----------|--------|
| Ctrl/Cmd + 1-9 | Switch to chat 1-9 |
| Ctrl/Cmd + ↑/↓ | Previous/next chat |
| Ctrl/Cmd + [ | Back in history |
        `,
      },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');
  const [expandedArticle, setExpandedArticle] = useState<string | null>('welcome');

  const filteredSections = HELP_SECTIONS.filter((section) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      section.title.toLowerCase().includes(query) ||
      section.description.toLowerCase().includes(query) ||
      section.articles.some(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query)
      )
    );
  });

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-[var(--text-primary)]">Help Center</h1>
              <p className="text-sm text-[var(--text-muted)]">
                Documentation & guides
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full pl-12 pr-4 py-3
              bg-[var(--bg-elevated)] border border-[var(--border-subtle)]
              rounded-xl text-[var(--text-primary)]
              placeholder:text-[var(--text-muted)]
              focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50
            "
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Link
            href="/models"
            className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/30 transition-colors"
          >
            <Brain className="w-6 h-6 text-[var(--accent-primary)] mb-2" />
            <h3 className="font-medium text-[var(--text-primary)] text-sm">AI Models</h3>
            <p className="text-xs text-[var(--text-muted)]">View all models</p>
          </Link>
          <Link
            href="/usage"
            className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/30 transition-colors"
          >
            <Zap className="w-6 h-6 text-[var(--accent-primary)] mb-2" />
            <h3 className="font-medium text-[var(--text-primary)] text-sm">Usage</h3>
            <p className="text-xs text-[var(--text-muted)]">Monitor usage</p>
          </Link>
          <Link
            href="/settings"
            className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/30 transition-colors"
          >
            <Settings className="w-6 h-6 text-[var(--accent-primary)] mb-2" />
            <h3 className="font-medium text-[var(--text-primary)] text-sm">Settings</h3>
            <p className="text-xs text-[var(--text-muted)]">Preferences</p>
          </Link>
          <Link
            href="/profile"
            className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)]/30 transition-colors"
          >
            <Shield className="w-6 h-6 text-[var(--accent-primary)] mb-2" />
            <h3 className="font-medium text-[var(--text-primary)] text-sm">Profile</h3>
            <p className="text-xs text-[var(--text-muted)]">Account settings</p>
          </Link>
        </div>

        {/* Help Sections */}
        <div className="space-y-4">
          {filteredSections.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSection === section.id;

            return (
              <div
                key={section.id}
                className="rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] overflow-hidden"
              >
                {/* Section Header */}
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-muted)]/50 transition-colors"
                >
                  <div className="p-2.5 rounded-xl bg-[var(--accent-primary)]/10">
                    <Icon className="w-5 h-5 text-[var(--accent-primary)]" />
                  </div>
                  <div className="flex-1 text-left">
                    <h2 className="font-semibold text-[var(--text-primary)]">{section.title}</h2>
                    <p className="text-sm text-[var(--text-muted)]">{section.description}</p>
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-[var(--text-muted)] transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </button>

                {/* Articles */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[var(--border-subtle)]"
                    >
                      <div className="p-2">
                        {section.articles.map((article) => {
                          const isArticleExpanded = expandedArticle === article.id;

                          return (
                            <div key={article.id} className="rounded-xl overflow-hidden">
                              <button
                                onClick={() =>
                                  setExpandedArticle(isArticleExpanded ? null : article.id)
                                }
                                className="w-full flex items-center gap-3 p-3 hover:bg-[var(--bg-muted)]/50 transition-colors"
                              >
                                <ChevronRight
                                  className={cn(
                                    'w-4 h-4 text-[var(--text-muted)] transition-transform',
                                    isArticleExpanded && 'rotate-90'
                                  )}
                                />
                                <span className="text-sm text-[var(--text-primary)]">
                                  {article.title}
                                </span>
                              </button>

                              <AnimatePresence>
                                {isArticleExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-4 pb-4"
                                  >
                                    <div
                                      className="prose prose-sm prose-invert max-w-none
                                        prose-headings:text-[var(--text-primary)]
                                        prose-p:text-[var(--text-secondary)]
                                        prose-strong:text-[var(--text-primary)]
                                        prose-code:text-[var(--accent-primary)]
                                        prose-code:bg-[var(--bg-muted)]
                                        prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                                        prose-ul:text-[var(--text-secondary)]
                                        prose-li:text-[var(--text-secondary)]
                                        prose-table:text-[var(--text-secondary)]
                                        prose-th:text-[var(--text-primary)]
                                        prose-td:text-[var(--text-secondary)]
                                        prose-th:border-[var(--border-subtle)]
                                        prose-td:border-[var(--border-subtle)]
                                      "
                                      dangerouslySetInnerHTML={{
                                        __html: article.content
                                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                          .replace(/`([^`]+)`/g, '<code>$1</code>')
                                          .replace(/### (.*)/g, '<h3>$1</h3>')
                                          .replace(/## (.*)/g, '<h2>$1</h2>')
                                          .replace(/\n\n/g, '</p><p>')
                                          .replace(/\n- /g, '</li><li>')
                                          .replace(/<li>/g, '<ul><li>')
                                          .replace(/<\/li>(?!<li>)/g, '</li></ul>')
                                          .replace(/\| (.*) \|/g, (match) => {
                                            const cells = match.split('|').filter(Boolean).map((c) => c.trim());
                                            return `<tr>${cells.map((c) => `<td>${c}</td>`).join('')}</tr>`;
                                          }),
                                      }}
                                    />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Contact Support */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-[var(--accent-primary)]/10 to-purple-500/10 border border-[var(--border-subtle)]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[var(--accent-primary)]/20">
              <HelpCircle className="w-6 h-6 text-[var(--accent-primary)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[var(--text-primary)]">Need more help?</h3>
              <p className="text-sm text-[var(--text-muted)]">
                Can&apos;t find what you&apos;re looking for? Contact our support team.
              </p>
            </div>
            <a
              href="mailto:support@omnidev.ai"
              className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary)]/90 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
