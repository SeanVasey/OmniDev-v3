'use client';

import { useEffect, useMemo, useState } from 'react';
import { ModelSelector } from '@/components/header/ModelSelector';
import { MobileSidebar } from '@/components/sidebar/MobileSidebar';
import { SidebarContent } from '@/components/sidebar/SidebarContent';
import { Composer } from '@/components/chat/Composer';
import type { AIModel, Chat, Project, User } from '@/types';
import { cn } from '@/lib/utils';

const mockProjects: Project[] = [
  { id: 'image-gen', name: 'Image Generation' },
  { id: 'code', name: 'Code Assistant' },
  { id: 'research', name: 'Research Workspace' },
];

const mockChats: Chat[] = [
  { id: '1', title: 'Design token refresh' },
  { id: '2', title: 'Draft onboarding copy' },
  { id: '3', title: 'Generate hero illustration' },
];

const defaultModel: AIModel = { id: 'gpt-4o', name: 'GPT-4o' };

export default function HomePage() {
  const [currentModel, setCurrentModel] = useState<AIModel>(defaultModel);
  const [isIncognito, setIsIncognito] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const user: User = useMemo(
    () => ({ full_name: 'Avi D.', email: 'avi@example.com', avatar_url: '' }),
    []
  );

  const handleSend = (message: string) => {
    console.info('Message sent', message);
  };

  useEffect(() => {
    document.body.dataset.mode = isIncognito ? 'incognito' : 'standard';
  }, [isIncognito]);

  return (
    <div className={cn('min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]')}>
      <ModelSelector
        currentModel={currentModel}
        isIncognito={isIncognito}
        onModelChange={setCurrentModel}
        onIncognitoToggle={() => setIsIncognito((prev) => !prev)}
        onMenuOpen={() => setIsSidebarOpen(true)}
      />

      <aside className="hidden md:flex fixed top-0 bottom-0 left-0 w-[var(--sidebar-width)] bg-[var(--bg-secondary)] border-r border-[var(--border-subtle)] pt-[calc(var(--safe-area-top)+72px)]">
        <SidebarContent
          projects={mockProjects}
          recentChats={mockChats}
          user={user}
          onNewChat={() => console.info('New chat')}
          onSelectChat={(id) => console.info('Select chat', id)}
          onSelectProject={(id) => console.info('Select project', id)}
        />
      </aside>

      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <SidebarContent
          projects={mockProjects}
          recentChats={mockChats}
          user={user}
          onNewChat={() => console.info('New chat')}
          onSelectChat={(id) => console.info('Select chat', id)}
          onSelectProject={(id) => console.info('Select project', id)}
        />
      </MobileSidebar>

      <main className="md:pl-[var(--sidebar-width)] pt-[140px] pb-32 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-3xl font-semibold tracking-tight">OmniDev v3.0</h1>
          <p className="text-[var(--text-secondary)]">Agentic multimodal workspace scaffold using the VASEY/AI palette and Qwen-inspired aspect ratio capsule.</p>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/60 p-4 shadow-lg">
            <p className="text-sm text-[var(--text-muted)]">Start a conversation from the floating composer below. Toggle incognito to preview ghost mode styling.</p>
          </div>
        </div>
      </main>

      <Composer
        onSubmit={(message, files, context, aspectRatio) => {
          const payload = aspectRatio ? `${message} --ar ${aspectRatio}` : message;
          handleSend(payload);
        }}
        isIncognito={isIncognito}
        onIncognitoToggle={() => setIsIncognito((prev) => !prev)}
      />
    </div>
  );
}
