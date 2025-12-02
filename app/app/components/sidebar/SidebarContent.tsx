'use client';

import { Search, Plus, Folder, MessageSquare, Settings } from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { HAPTIC_TRIGGERS } from '@/lib/haptics/triggers';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Project, Chat, User } from '@/types';

interface SidebarContentProps {
  projects: Project[];
  recentChats: Chat[];
  user: User | null;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onSelectProject: (projectId: string) => void;
}

export function SidebarContent({
  projects,
  recentChats,
  user,
  onNewChat,
  onSelectChat,
  onSelectProject,
}: SidebarContentProps) {
  const { trigger } = useHaptics();

  return (
    <>
      {/* Header: Search + New Chat */}
      <div className="flex-shrink-0 p-4 space-y-3 border-b border-[var(--border-subtle)]">
        {/* Search Input */}
        <div className="relative">
          <Search
            className="
              absolute left-3 top-1/2 -translate-y-1/2
              w-4 h-4 text-[var(--text-muted)]
            "
          />
          <input
            type="text"
            placeholder="Search conversations..."
            className="
              w-full h-11 pl-10 pr-4
              bg-[var(--bg-muted)]
              border border-[var(--border-subtle)]
              rounded-xl
              text-sm text-[var(--text-primary)]
              placeholder:text-[var(--text-placeholder)]
              focus:outline-none focus:ring-2 focus:ring-[var(--purple-600)]/50
              transition-all
            "
          />
        </div>

        {/* New Chat Button */}
        <button
          onClick={() => {
            trigger(HAPTIC_TRIGGERS.chat.newConversation);
            onNewChat();
          }}
          className="
            w-full flex items-center justify-center gap-2
            h-11 px-4
            bg-[var(--purple-600)]/10
            hover:bg-[var(--purple-600)]/20
            border border-[var(--purple-600)]/30
            rounded-xl
            text-[var(--purple-400)] font-medium
            transition-colors
            touch-target
          "
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Scrollable Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-6">
          {/* Projects Section */}
          <div>
            <h3 className="
              px-3 py-2
              text-xs font-semibold uppercase tracking-wider
              text-[var(--text-muted)]
            ">
              Projects
            </h3>
            <div className="space-y-1">
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    trigger(HAPTIC_TRIGGERS.button.secondary);
                    onSelectProject(project.id);
                  }}
                  className="
                    w-full flex items-center gap-3
                    px-3 py-2.5
                    rounded-lg
                    text-[var(--text-secondary)]
                    hover:bg-[var(--bg-elevated)]
                    hover:text-[var(--text-primary)]
                    transition-colors
                    touch-target
                    text-left
                  "
                >
                  <Folder className="w-5 h-5 text-[var(--orange-500)] flex-shrink-0" />
                  <span className="truncate text-sm">{project.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Chats Section */}
          <div>
            <h3 className="
              px-3 py-2
              text-xs font-semibold uppercase tracking-wider
              text-[var(--text-muted)]
            ">
              Recent
            </h3>
            <div className="space-y-1">
              {recentChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    trigger(HAPTIC_TRIGGERS.button.secondary);
                    onSelectChat(chat.id);
                  }}
                  className="
                    w-full flex items-center gap-3
                    px-3 py-2.5
                    rounded-lg
                    text-[var(--text-secondary)]
                    hover:bg-[var(--bg-elevated)]
                    hover:text-[var(--text-primary)]
                    transition-colors
                    touch-target
                    text-left
                  "
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0 opacity-50" />
                  <span className="truncate text-sm">{chat.title}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>
      </ScrollArea>

      {/* User Panel (Sticky Footer) */}
      <div className="
        flex-shrink-0
        border-t border-[var(--border-subtle)]
        p-4
      ">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                <AvatarFallback className="bg-[var(--purple-600)] text-white">
                  {user.full_name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {user.full_name}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {user.email}
                </span>
              </div>
            </div>
            <button
              onClick={() => trigger(HAPTIC_TRIGGERS.button.icon)}
              className="
                icon-button
                text-[var(--text-muted)]
                hover:text-[var(--text-primary)]
                hover:bg-[var(--bg-elevated)]
              "
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <button className="text-sm text-[var(--purple-400)] font-medium">
              Sign In
            </button>
          </div>
        )}
      </div>
    </>
  );
}
