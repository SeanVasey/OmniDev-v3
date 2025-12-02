'use client';

import { useState, useEffect } from 'react';
import { useChat } from 'ai/react';
import { toast } from 'sonner';
import { Composer } from '@/components/chat/Composer';
import { ModelSelector } from '@/components/header/ModelSelector';
import { MobileSidebar } from '@/components/sidebar/MobileSidebar';
import { SidebarContent } from '@/components/sidebar/SidebarContent';
import { MessageList } from '@/components/chat/MessageList';
import { Toaster } from '@/components/ui/toaster';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import type { ContextMode, AspectRatio, Project, Chat, AIModel, Message as MessageType } from '@/types';

const mockModel: AIModel = {
  id: 'o1',
  name: 'o1',
  provider: 'openai',
  contextWindow: 200000,
  supportsStreaming: true,
  supportsVision: true,
  supportsImageGen: false,
  maxTokens: 100000,
};

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
    model_id: 'gpt-4o',
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
    model_id: 'claude-3.5-sonnet',
    is_pinned: false,
    is_archived: false,
    is_incognito: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function HomePage() {
  const [currentModel] = useState(mockModel);
  const [activeContext, setActiveContext] = useState<ContextMode>(null);

  const { isIncognitoMode, isSidebarOpen, setSidebarOpen, toggleIncognitoMode } = useUIStore();
  const { currentChatId } = useChatStore();

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: '/api/chat',
    body: {
      modelId: currentModel.id,
      contextMode: activeContext,
    },
    onError: (error) => {
      toast.error('Failed to send message', {
        description: error.message,
      });
    },
    onFinish: () => {
      toast.success('Response complete');
    },
  });

  // Convert ai/react messages to our Message type
  const displayMessages: MessageType[] = messages.map((msg) => ({
    id: msg.id,
    chat_id: currentChatId || 'temp',
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content,
    created_at: new Date().toISOString(),
  }));

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong', {
        description: error.message,
      });
    }
  }, [error]);

  const handleComposerSubmit = async (
    message: string,
    attachments: File[],
    context: ContextMode,
    aspectRatio?: AspectRatio
  ) => {
    if (!message.trim() && attachments.length === 0) return;

    setActiveContext(context);

    // Add aspect ratio to message for image generation
    const finalMessage =
      context === 'image' && aspectRatio ? `${message} [Aspect Ratio: ${aspectRatio}]` : message;

    // Handle file attachments
    if (attachments.length > 0) {
      toast.info(`${attachments.length} file(s) attached`, {
        description: 'File upload coming soon',
      });
    }

    // Submit to AI
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;

    // Temporarily set input for submission
    handleInputChange({
      target: { value: finalMessage },
    } as React.ChangeEvent<HTMLInputElement>);

    setTimeout(() => {
      handleSubmit(syntheticEvent);
    }, 0);
  };

  const handleNewChat = () => {
    setSidebarOpen(false);
    window.location.reload();
  };

  const handleSelectChat = (chatId: string) => {
    console.log('Select chat:', chatId);
    setSidebarOpen(false);
    toast.info('Chat loading', {
      description: 'Chat history coming soon',
    });
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
          onIncognitoToggle={toggleIncognitoMode}
          onMenuOpen={() => setSidebarOpen(true)}
        />

        {/* Mobile Sidebar */}
        <MobileSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)}>
          <SidebarContent
            projects={mockProjects}
            recentChats={mockChats}
            user={null}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onSelectProject={handleSelectProject}
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
          disabled={isLoading}
        />
      </main>

      {/* Toast Notifications */}
      <Toaster />
    </>
  );
}
