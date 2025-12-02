'use client';

import { useState } from 'react';
import { Composer } from '@/components/chat/Composer';
import { ModelSelector } from '@/components/header/ModelSelector';
import { MobileSidebar } from '@/components/sidebar/MobileSidebar';
import { SidebarContent } from '@/components/sidebar/SidebarContent';
import type { ContextMode, AspectRatio, Project, Chat, AIModel } from '@/types';

const mockModel: AIModel = {
  id: 'gpt-4o',
  name: 'GPT-4o',
  provider: 'openai',
  contextWindow: 128000,
  supportsStreaming: true,
  supportsVision: true,
  supportsImageGen: false,
  maxTokens: 4096,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);

  const handleSubmit = (
    message: string,
    attachments: File[],
    context: ContextMode,
    aspectRatio?: AspectRatio
  ) => {
    console.log('Submit:', { message, attachments, context, aspectRatio });
    // TODO: Implement AI integration
  };

  const handleNewChat = () => {
    console.log('New chat');
    setIsSidebarOpen(false);
  };

  const handleSelectChat = (chatId: string) => {
    console.log('Select chat:', chatId);
    setIsSidebarOpen(false);
  };

  const handleSelectProject = (projectId: string) => {
    console.log('Select project:', projectId);
    setIsSidebarOpen(false);
  };

  return (
    <main className="relative min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <ModelSelector
        currentModel={mockModel}
        isIncognito={isIncognito}
        onIncognitoToggle={() => setIsIncognito(!isIncognito)}
        onMenuOpen={() => setIsSidebarOpen(true)}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      >
        <SidebarContent
          projects={mockProjects}
          recentChats={mockChats}
          user={null}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          onSelectProject={handleSelectProject}
        />
      </MobileSidebar>

      {/* Main Content */}
      <div className="
        flex flex-col items-center justify-center
        min-h-screen
        px-4
        pt-20 pb-40
      ">
        <div className="max-w-3xl w-full text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
            Welcome to OmniDev
          </h1>
          <p className="text-lg text-[var(--text-secondary)]">
            Your AI-powered development workspace with support for multiple LLM providers
          </p>
        </div>
      </div>

      {/* Composer */}
      <Composer
        onSubmit={handleSubmit}
        isIncognito={isIncognito}
        onIncognitoToggle={() => setIsIncognito(!isIncognito)}
      />
    </main>
  );
}
