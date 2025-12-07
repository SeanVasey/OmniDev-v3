'use client';

import { useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Composer } from '@/components/chat/Composer';
import { ModelSelector } from '@/components/header/ModelSelector';
import { MobileSidebar } from '@/components/sidebar/MobileSidebar';
import { SidebarContent } from '@/components/sidebar/SidebarContent';
import { MessageList } from '@/components/chat/MessageList';
import { Toaster } from '@/components/ui/toaster';
import { LandingPage } from '@/components/landing/LandingPage';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import { useAuth } from '@/lib/auth/AuthContext';
import { useDatabaseSync } from '@/hooks/useDatabaseSync';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import { getModel } from '@/lib/ai/models';
import { getWorkspaces } from '@/lib/supabase/database';
import type { ContextMode, AspectRatio, Project, Chat, AIModel, Message as MessageType } from '@/types';

const mockProjects: Project[] = [
  {
    id: '1',
    owner_id: 'user1',
    name: 'Image Generation',
    color: 'orange',
    icon: 'folder',
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    owner_id: 'user1',
    name: 'Code Assistant',
    color: 'orange',
    icon: 'folder',
    is_archived: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockChats: Chat[] = [
  {
    id: '1',
    user_id: 'user1',
    title: 'Build a React component',
    model_id: 'gpt-5.1-chat',
    is_pinned: false,
    is_archived: false,
    is_incognito: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'user1',
    title: 'Design system help',
    model_id: 'claude-4.5-sonnet',
    is_pinned: false,
    is_archived: false,
    is_incognito: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function HomePage() {
  // Initialize with GPT-5.1 Chat as default
  const [currentModel, setCurrentModel] = useState<AIModel>(
    getModel('gpt-5.1-chat') || getModel('gpt-5.1')!
  );
  const [activeContext, setActiveContext] = useState<ContextMode>(null);
  const [workspaces, setWorkspaces] = useState<Project[]>([]);

  // All hooks must be called before any conditional returns
  const { user, userId, isGuest, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isIncognitoMode, isSidebarOpen, setSidebarOpen, toggleIncognitoMode } = useUIStore();
  const { currentChatId, chats, setCurrentChat, addMessage } = useChatStore();
  const { createNewChat, saveMessage, loadChatMessages } = useDatabaseSync();
  const { upload: uploadFiles, isUploading } = useFileUpload();
  const { generateImage, isGenerating } = useImageGeneration();

  // Load workspaces on mount
  useEffect(() => {
    const loadWorkspaces = async () => {
      const fetchedWorkspaces = await getWorkspaces(userId);
      setWorkspaces(fetchedWorkspaces);
    };
    loadWorkspaces();
  }, [userId]);

  // Handle model change
  const handleModelChange = (model: AIModel) => {
    setCurrentModel(model);
    toast.success(`Switched to ${model.name}`, {
      description: `${(model.contextWindow / 1000).toFixed(0)}K context window`,
    });
  };

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
    onError: (error) => {
      toast.error('Failed to send message', {
        description: error.message,
      });
    },
    onFinish: async ({ message }) => {
      // Save assistant's response to database
      // In AI SDK v5, message content is in parts array
      const textContent = message.parts
        ?.filter((part: any) => part.type === 'text')
        .map((part: any) => part.text)
        .join('');

      if (currentChatId && currentChatId !== 'temp' && textContent) {
        await saveMessage(currentChatId, 'assistant', textContent, []);
      }
      toast.success('Response complete');
    },
  });

  // Derive isLoading from status for compatibility
  const isLoading = status === 'submitted' || status === 'streaming';

  // Convert AI SDK v5 UIMessage to our Message type
  const displayMessages: MessageType[] = messages.map((msg) => {
    // Extract text from parts array
    const textContent = msg.parts
      ?.filter((part: any) => part.type === 'text')
      .map((part: any) => part.text)
      .join('') || '';

    return {
      id: msg.id,
      chat_id: currentChatId || 'temp',
      role: msg.role as 'user' | 'assistant' | 'system',
      content: textContent,
      created_at: new Date().toISOString(),
    };
  });

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong', {
        description: error.message,
      });
    }
  }, [error]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return <LandingPage />;
  }

  const handleComposerSubmit = async (
    message: string,
    attachments: File[],
    context: ContextMode,
    aspectRatio?: AspectRatio
  ) => {
    if (!message.trim() && attachments.length === 0) return;

    setActiveContext(context);

    // Create a new chat if this is the first message
    let chatId = currentChatId;
    if (!chatId || chatId === 'temp') {
      const title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
      const newChat = await createNewChat(currentModel.id, title, context);
      if (newChat) {
        chatId = newChat.id;
        setCurrentChat(chatId);
      }
    }

    // Add aspect ratio to message for image generation
    const finalMessage =
      context === 'image' && aspectRatio ? `${message} [Aspect Ratio: ${aspectRatio}]` : message;

    // Upload file attachments
    let uploadedFiles: any[] = [];
    if (attachments.length > 0) {
      toast.info(`Uploading ${attachments.length} file(s)...`);
      uploadedFiles = await uploadFiles(attachments);

      if (uploadedFiles.length === 0) {
        // Upload failed, don't proceed
        return;
      }
    }

    // Save user message to database with attachments
    if (chatId && chatId !== 'temp') {
      await saveMessage(chatId, 'user', finalMessage, uploadedFiles);
    }

    // Handle image generation mode
    if (context === 'image') {
      const generatedImage = await generateImage(message, aspectRatio || '1:1');

      if (generatedImage && chatId && chatId !== 'temp') {
        // Save the generated image as an assistant message
        const imageMessage = `![Generated Image](${generatedImage.imageUrl})\n\n**Revised Prompt:** ${generatedImage.revisedPrompt || message}`;
        await saveMessage(chatId, 'assistant', imageMessage, []);

        // Add to local messages for immediate display
        const newMessage: MessageType = {
          id: `msg_${Date.now()}`,
          chat_id: chatId,
          role: 'assistant',
          content: imageMessage,
          created_at: new Date().toISOString(),
        };
        addMessage(chatId, newMessage);
      }
      return; // Don't submit to chat API for image generation
    }

    // Submit to AI for regular chat using sendMessage with model and context info
    sendMessage(
      { text: finalMessage },
      {
        body: {
          modelId: currentModel.id,
          contextMode: activeContext,
        },
      }
    );
  };

  const handleNewChat = () => {
    setSidebarOpen(false);
    window.location.reload();
  };

  const handleSelectChat = async (chatId: string) => {
    setCurrentChat(chatId);
    setSidebarOpen(false);

    // Load messages for this chat
    await loadChatMessages(chatId);

    toast.success('Chat loaded');
  };

  const handleSelectProject = (projectId: string) => {
    console.log('Select project:', projectId);
    setSidebarOpen(false);
  };

  return (
    <>
      <main className="relative min-h-screen bg-[var(--bg-primary)] flex flex-col">
        {/* Header */}
        <ModelSelector
          currentModel={currentModel}
          isIncognito={isIncognitoMode}
          onModelChange={handleModelChange}
          onIncognitoToggle={toggleIncognitoMode}
          onMenuOpen={() => setSidebarOpen(true)}
        />

        {/* Mobile Sidebar */}
        <MobileSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)}>
          <SidebarContent
            projects={workspaces.length > 0 ? workspaces : (isGuest ? mockProjects : [])}
            user={user}
            userId={userId}
            currentChatId={currentChatId}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onSelectProject={handleSelectProject}
            onCreateProject={() => {}}
          />
        </MobileSidebar>

        {/* Message List */}
        <div className="flex-1 pt-20 pb-40">
          <MessageList messages={displayMessages} isStreaming={isLoading} />
        </div>

        {/* Composer */}
        <Composer
          onSubmit={handleComposerSubmit}
          isIncognito={isIncognitoMode}
          onIncognitoToggle={toggleIncognitoMode}
          disabled={isLoading || isUploading || isGenerating}
          currentModel={currentModel}
          onModelChange={handleModelChange}
        />
      </main>

      {/* Toast Notifications */}
      <Toaster />
    </>
  );
}
