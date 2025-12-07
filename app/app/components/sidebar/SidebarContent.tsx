'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Folder,
  MessageSquare,
  Settings,
  Star,
  ChevronRight,
  MoreVertical,
  Image as ImageIcon,
  User,
} from 'lucide-react';
import { useHaptics } from '@/hooks/useHaptics';
import { HAPTIC_TRIGGERS } from '@/lib/haptics/triggers';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatHistory } from '@/components/chat/ChatHistory';
import { MediaLibrary } from '@/components/sidebar/MediaLibrary';
import { ProjectSettingsDialog } from '@/components/projects/ProjectSettingsDialog';
import { cn } from '@/lib/utils';
import type { Project, Chat, User as UserType, ProjectColor, ProjectIcon } from '@/types';

// Icon mapping for projects
const PROJECT_ICONS: Record<string, any> = {
  folder: Folder,
  code: () => <span className="text-sm">{'</>'}</span>,
  design: () => <span className="text-sm">{'~'}</span>,
  data: () => <span className="text-sm">{'[]'}</span>,
  research: () => <span className="text-sm">{'?'}</span>,
  writing: () => <span className="text-sm">{'A'}</span>,
  image: ImageIcon,
  video: () => <span className="text-sm">{'V'}</span>,
  music: () => <span className="text-sm">{'M'}</span>,
  chat: MessageSquare,
};

// Color mapping for projects
const PROJECT_COLORS: Record<ProjectColor, string> = {
  orange: 'text-orange-500',
  blue: 'text-blue-500',
  green: 'text-green-500',
  purple: 'text-purple-500',
  pink: 'text-pink-500',
  red: 'text-red-500',
  yellow: 'text-yellow-500',
  teal: 'text-teal-500',
};

interface SidebarContentProps {
  projects: Project[];
  user: UserType | null;
  userId: string;
  currentChatId: string | null;
  starredChats?: Chat[];
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onUpdateProject?: (project: Project) => void;
  onDeleteProject?: (projectId: string) => void;
}

export function SidebarContent({
  projects,
  user,
  userId,
  currentChatId,
  starredChats = [],
  onNewChat,
  onSelectChat,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  onDeleteProject,
}: SidebarContentProps) {
  const { trigger } = useHaptics();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectSettings, setShowProjectSettings] = useState(false);

  const handleProjectSettings = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setShowProjectSettings(true);
  };

  const handleProjectUpdate = (updatedProject: Project) => {
    onUpdateProject?.(updatedProject);
  };

  const handleProjectDelete = (projectId: string) => {
    onDeleteProject?.(projectId);
  };

  const getProjectIcon = (iconName?: string) => {
    const IconComponent = PROJECT_ICONS[iconName || 'folder'] || Folder;
    return typeof IconComponent === 'function' && IconComponent.toString().includes('span')
      ? IconComponent()
      : <IconComponent className="w-5 h-5" />;
  };

  const getProjectColorClass = (color?: string) => {
    return PROJECT_COLORS[(color as ProjectColor) || 'orange'] || 'text-orange-500';
  };

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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        <nav className="p-2 space-y-4">
          {/* Starred Chats Section */}
          {starredChats.length > 0 && (
            <div>
              <h3 className="
                px-3 py-2
                text-xs font-semibold uppercase tracking-wider
                text-[var(--text-muted)]
                flex items-center gap-2
              ">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                Favorites
              </h3>
              <div className="space-y-1">
                <AnimatePresence>
                  {starredChats.slice(0, 5).map((chat) => (
                    <motion.button
                      key={chat.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onClick={() => {
                        trigger(HAPTIC_TRIGGERS.button.secondary);
                        onSelectChat(chat.id);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors touch-target',
                        currentChatId === chat.id
                          ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                      )}
                    >
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500 flex-shrink-0" />
                      <span className="truncate text-sm">{chat.title}</span>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Media Library Section */}
          <MediaLibrary onSelectChat={onSelectChat} />

          {/* Projects Section */}
          <div>
            <div className="flex items-center justify-between px-3 py-2">
              <h3 className="
                text-xs font-semibold uppercase tracking-wider
                text-[var(--text-muted)]
              ">
                Projects
              </h3>
              <button
                onClick={() => {
                  trigger(HAPTIC_TRIGGERS.button.icon);
                  onCreateProject();
                }}
                className="p-1 rounded-md hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <Plus className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            </div>
            <div className="space-y-1">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group relative"
                >
                  <button
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
                    <span className={cn('flex-shrink-0', getProjectColorClass(project.color))}>
                      {getProjectIcon(project.icon)}
                    </span>
                    <span className="truncate text-sm flex-1">{project.name}</span>
                  </button>
                  <button
                    onClick={(e) => handleProjectSettings(project, e)}
                    className="
                      absolute right-2 top-1/2 -translate-y-1/2
                      p-1.5 rounded-lg
                      opacity-0 group-hover:opacity-100
                      hover:bg-[var(--bg-muted)]
                      transition-all
                    "
                  >
                    <MoreVertical className="w-4 h-4 text-[var(--text-muted)]" />
                  </button>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="px-3 py-4 text-center">
                  <p className="text-sm text-[var(--text-muted)]">No projects yet</p>
                  <button
                    onClick={onCreateProject}
                    className="mt-2 text-sm text-[var(--accent-primary)] hover:underline"
                  >
                    Create your first project
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Chats Section */}
          <ChatHistory
            userId={userId}
            currentChatId={currentChatId}
            onSelectChat={onSelectChat}
            onNewChat={onNewChat}
          />

          {/* Quick Links */}
          <div className="pt-2 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => {
                trigger(HAPTIC_TRIGGERS.button.secondary);
                router.push('/chats');
              }}
              className="
                w-full flex items-center justify-between
                px-3 py-2.5
                rounded-lg
                text-[var(--text-secondary)]
                hover:bg-[var(--bg-elevated)]
                hover:text-[var(--text-primary)]
                transition-colors
              "
            >
              <span className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                <span className="text-sm">All Chats</span>
              </span>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
            </button>
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
            <button
              onClick={() => {
                trigger(HAPTIC_TRIGGERS.button.secondary);
                router.push('/profile');
              }}
              className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar_url} alt={user.full_name} />
                <AvatarFallback className="bg-[var(--purple-600)] text-white">
                  {user.full_name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {user.full_name || 'User'}
                </span>
                <span className="text-xs text-[var(--text-muted)]">
                  {user.email || 'View profile'}
                </span>
              </div>
            </button>
            <button
              onClick={() => {
                trigger(HAPTIC_TRIGGERS.button.icon);
                router.push('/settings');
              }}
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
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/login')}
              className="flex-1 py-2.5 text-sm text-[var(--purple-400)] font-medium hover:underline text-left"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                trigger(HAPTIC_TRIGGERS.button.icon);
                router.push('/settings');
              }}
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
        )}
      </div>

      {/* Project Settings Dialog */}
      {selectedProject && (
        <ProjectSettingsDialog
          project={selectedProject}
          isOpen={showProjectSettings}
          onClose={() => {
            setShowProjectSettings(false);
            setSelectedProject(null);
          }}
          onUpdate={handleProjectUpdate}
          onDelete={handleProjectDelete}
        />
      )}
    </>
  );
}
