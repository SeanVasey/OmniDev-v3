'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Clock, Pin, Archive, Trash2, MoreVertical, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { getUserChats, updateChat, deleteChat } from '@/lib/supabase/database';
import { cn } from '@/lib/utils';
import { ProviderIcon } from '@/components/ui/ProviderIcon';
import { getModel } from '@/lib/ai/models';
import type { Chat } from '@/types';

interface ChatHistoryProps {
  userId: string;
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export function ChatHistory({ userId, currentChatId, onSelectChat, onNewChat }: ChatHistoryProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadChats = async () => {
    setIsLoading(true);
    try {
      const loadedChats = await getUserChats(userId, false); // Don't include archived
      setChats(loadedChats);
    } catch (error) {
      console.error('Error loading chats:', error);
      toast.error('Failed to load chat history');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePin = async (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateChat(chat.id, { is_pinned: !chat.is_pinned });
      await loadChats();
      toast.success(chat.is_pinned ? 'Unpinned chat' : 'Pinned chat');
    } catch (error) {
      toast.error('Failed to update chat');
    }
    setActiveMenu(null);
  };

  const handleStar = async (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateChat(chat.id, { is_starred: !chat.is_starred });
      await loadChats();
      toast.success(chat.is_starred ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update chat');
    }
    setActiveMenu(null);
  };

  const handleArchive = async (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateChat(chat.id, { is_archived: !chat.is_archived });
      await loadChats();
      toast.success(chat.is_archived ? 'Unarchived chat' : 'Archived chat');
    } catch (error) {
      toast.error('Failed to archive chat');
    }
    setActiveMenu(null);
  };

  const handleDelete = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteChat(chatId);
      await loadChats();
      toast.success('Chat deleted');
      if (currentChatId === chatId) {
        onNewChat();
      }
    } catch (error) {
      toast.error('Failed to delete chat');
    }
    setActiveMenu(null);
  };

  const pinnedChats = chats.filter((chat) => chat.is_pinned && !chat.is_archived);
  const recentChats = chats.filter((chat) => !chat.is_pinned && !chat.is_archived);
  const archivedChats = chats.filter((chat) => chat.is_archived);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent-primary)]" />
      </div>
    );
  }

  const ChatItem = ({ chat }: { chat: Chat }) => {
    const model = getModel(chat.model_id);
    const isActive = currentChatId === chat.id;

    return (
      <motion.button
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        onClick={() => onSelectChat(chat.id)}
        className={cn(
          'w-full px-3 py-2.5 rounded-lg text-left transition-all group relative',
          isActive
            ? 'bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]'
            : 'hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
        )}
      >
        <div className="flex items-start gap-2">
          {model && (
            <div className="mt-0.5">
              <ProviderIcon provider={model.provider} size={16} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{chat.title}</span>
              {chat.is_starred && <Star className="w-3 h-3 flex-shrink-0 fill-yellow-500 text-yellow-500" />}
              {chat.is_pinned && <Pin className="w-3 h-3 flex-shrink-0" />}
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--text-muted)]">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })}</span>
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(activeMenu === chat.id ? null : chat.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--bg-muted)] transition-opacity"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {activeMenu === chat.id && (
              <div className="absolute right-0 top-8 w-40 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg shadow-lg py-1 z-10">
                <button
                  onClick={(e) => handleStar(chat, e)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-muted)] flex items-center gap-2"
                >
                  <Star className={cn("w-4 h-4", chat.is_starred && "fill-yellow-500 text-yellow-500")} />
                  {chat.is_starred ? 'Unstar' : 'Star'}
                </button>
                <button
                  onClick={(e) => handlePin(chat, e)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-muted)] flex items-center gap-2"
                >
                  <Pin className="w-4 h-4" />
                  {chat.is_pinned ? 'Unpin' : 'Pin'}
                </button>
                <button
                  onClick={(e) => handleArchive(chat, e)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-muted)] flex items-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  {chat.is_archived ? 'Unarchive' : 'Archive'}
                </button>
                <button
                  onClick={(e) => handleDelete(chat.id, e)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--bg-muted)] text-red-500 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Pinned Chats */}
      {pinnedChats.length > 0 && (
        <div>
          <h3 className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Pinned
          </h3>
          <div className="space-y-1">
            <AnimatePresence>
              {pinnedChats.map((chat) => (
                <ChatItem key={chat.id} chat={chat} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Recent Chats */}
      {recentChats.length > 0 && (
        <div>
          <h3 className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Recent
          </h3>
          <div className="space-y-1">
            <AnimatePresence>
              {recentChats.map((chat) => (
                <ChatItem key={chat.id} chat={chat} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Archived Chats */}
      {archivedChats.length > 0 && (
        <div>
          <h3 className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            Archived
          </h3>
          <div className="space-y-1">
            <AnimatePresence>
              {archivedChats.map((chat) => (
                <ChatItem key={chat.id} chat={chat} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {chats.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <MessageSquare className="w-12 h-12 text-[var(--text-muted)] mb-3" />
          <p className="text-sm text-[var(--text-secondary)] mb-1">No chats yet</p>
          <p className="text-xs text-[var(--text-muted)]">Start a conversation to begin</p>
        </div>
      )}
    </div>
  );
}
