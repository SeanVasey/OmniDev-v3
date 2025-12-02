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
import { useAuth } from '@/lib/auth/AuthContext';
import { useDatabaseSync } from '@/hooks/useDatabaseSync';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useImageGeneration } from '@/hooks/useImageGeneration';
import type { ContextMode, AspectRatio, Project, Chat, AIModel, Message as MessageType } from '@/types';

const mockModel: AIModel = {
  id: 'gpt-5.1',
  name: 'GPT-5.1',
  provider: 'openai',
  contextWindow: 256000,
  supportsStreaming: true,
  supportsVision: true,
  supportsImageGen: false,
  maxTokens: 32768,
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

  const { user } = useAuth();
  const { isIncognitoMode, isSidebarOpen, setSidebarOpen, toggleIncognitoMode } = useUIStore();
  const { currentChatId, chats, messages: storedMessages, setCurrentChat, addMessage } = useChatStore();
  const { createNewChat, saveMessage, loadChatMessages } = useDatabaseSync();
  const { upload: uploadFiles, isUploading } = useFileUpload();
  const { generateImage, isGenerating } = useImageGeneration();

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
    onFinish: async (message) => {
      // Save assistant's response to database
      if (currentChatId && currentChatId !== 'temp' && message.content) {
        await saveMessage(currentChatId, 'assistant', message.content, []);
      }
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

    // Submit to AI for regular chat
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
          onIncognitoToggle={toggleIncognitoMode}
          onMenuOpen={() => setSidebarOpen(true)}
        />

        {/* Mobile Sidebar */}
        <MobileSidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)}>
          <SidebarContent
            projects={mockProjects}
            recentChats={chats.length > 0 ? chats : mockChats}
            user={user}
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
          disabled={isLoading || isUploading || isGenerating}
        />
      </main>

      {/* Toast Notifications */}
      <Toaster />
    </>
  );
}
