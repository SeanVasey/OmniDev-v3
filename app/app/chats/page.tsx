'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Star,
  Clock,
  MoreVertical,
  Pin,
  Archive,
  Trash2,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth/AuthContext';
import { getUserChats, updateChat, deleteChat } from '@/lib/supabase/database';
import { ProviderIcon } from '@/components/ui/ProviderIcon';
import { getModel } from '@/lib/ai/models';
import { cn } from '@/lib/utils';
import type { Chat } from '@/types';

export default function ChatsPage() {
  const router = useRouter();
  const { userId, isAuthenticated, isLoading: authLoading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const loadChats = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const loadedChats = await getUserChats(userId, showArchived);
        // Sort by updated_at (most recent first)
        loadedChats.sort((a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
        setChats(loadedChats);
      } catch (error) {
        console.error('Error loading chats:', error);
        toast.error('Failed to load chats');
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, [userId, showArchived]);

  const handleStar = async (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateChat(chat.id, { is_starred: !chat.is_starred });
      setChats(prev =>
        prev.map(c => c.id === chat.id ? { ...c, is_starred: !c.is_starred } : c)
      );
      toast.success(chat.is_starred ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update chat');
    }
    setActiveMenu(null);
  };

  const handlePin = async (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateChat(chat.id, { is_pinned: !chat.is_pinned });
      setChats(prev =>
        prev.map(c => c.id === chat.id ? { ...c, is_pinned: !c.is_pinned } : c)
      );
      toast.success(chat.is_pinned ? 'Unpinned chat' : 'Pinned chat');
    } catch (error) {
      toast.error('Failed to update chat');
    }
    setActiveMenu(null);
  };

  const handleArchive = async (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateChat(chat.id, { is_archived: !chat.is_archived });
      if (!showArchived) {
        setChats(prev => prev.filter(c => c.id !== chat.id));
      } else {
        setChats(prev =>
          prev.map(c => c.id === chat.id ? { ...c, is_archived: !c.is_archived } : c)
        );
      }
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
      setChats(prev => prev.filter(c => c.id !== chatId));
      toast.success('Chat deleted');
    } catch (error) {
      toast.error('Failed to delete chat');
    }
    setActiveMenu(null);
  };

  const handleSelectChat = (chatId: string) => {
    router.push(`/?chat=${chatId}`);
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[var(--glass-bg)] border-b border-[var(--border-subtle)]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/')}
                className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
              <h1 className="text-xl font-bold text-[var(--text-primary)]">All Chats</h1>
            </div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                showArchived
                  ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30"
                  : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
              )}
            >
              {showArchived ? 'Show Active' : 'Show Archived'}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full h-12 pl-12 pr-4 bg-[var(--bg-muted)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/50"
            />
          </div>
        </div>
      </header>

      {/* Chat List */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="w-16 h-16 text-[var(--text-muted)]/30 mb-4" />
            <p className="text-lg text-[var(--text-secondary)] mb-2">No chats found</p>
            <p className="text-sm text-[var(--text-muted)]">
              {searchQuery ? 'Try a different search term' : 'Start a conversation to begin'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredChats.map((chat, index) => {
                const model = getModel(chat.model_id);

                return (
                  <motion.button
                    key={chat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => handleSelectChat(chat.id)}
                    className={cn(
                      'w-full p-4 rounded-2xl text-left transition-all group',
                      'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]',
                      'hover:border-[var(--accent-primary)]/30 hover:shadow-lg'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Model Icon */}
                      {model && (
                        <div className="flex-shrink-0 mt-1">
                          <ProviderIcon provider={model.provider} size={24} />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-[var(--text-primary)] truncate">
                            {chat.title}
                          </span>
                          {chat.is_starred && (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                          )}
                          {chat.is_pinned && (
                            <Pin className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDistanceToNow(new Date(chat.updated_at), { addSuffix: true })}
                          </span>
                          {model && (
                            <span className="text-[var(--text-muted)]/70">
                              {model.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenu(activeMenu === chat.id ? null : chat.id);
                          }}
                          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-muted)] transition-all"
                        >
                          <MoreVertical className="w-5 h-5 text-[var(--text-muted)]" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenu === chat.id && (
                          <div className="absolute right-0 top-10 w-44 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-xl py-1 z-20">
                            <button
                              onClick={(e) => handleStar(chat, e)}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--bg-muted)] flex items-center gap-3"
                            >
                              <Star className={cn("w-4 h-4", chat.is_starred && "fill-yellow-500 text-yellow-500")} />
                              {chat.is_starred ? 'Unstar' : 'Star'}
                            </button>
                            <button
                              onClick={(e) => handlePin(chat, e)}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--bg-muted)] flex items-center gap-3"
                            >
                              <Pin className="w-4 h-4" />
                              {chat.is_pinned ? 'Unpin' : 'Pin'}
                            </button>
                            <button
                              onClick={(e) => handleArchive(chat, e)}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--bg-muted)] flex items-center gap-3"
                            >
                              <Archive className="w-4 h-4" />
                              {chat.is_archived ? 'Unarchive' : 'Archive'}
                            </button>
                            <div className="border-t border-[var(--border-subtle)] my-1" />
                            <button
                              onClick={(e) => handleDelete(chat.id, e)}
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--bg-muted)] text-red-500 flex items-center gap-3"
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
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
