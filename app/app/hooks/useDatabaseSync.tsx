'use client';

import { useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useChatStore } from '@/stores/chatStore';
import { useUIStore } from '@/stores/uiStore';
import {
  createChat,
  createMessage,
  getUserChats,
  getChatMessages,
  updateChat as updateChatDb,
  isSupabaseConfigured,
} from '@/lib/supabase/database';
import type { Chat, Message, ContextMode } from '@/types';

/**
 * Hook to sync chat store with Supabase database
 * - Loads user's chats on mount
 * - Automatically saves new chats and messages to database
 * - Syncs updates bidirectionally
 */
export function useDatabaseSync() {
  const { userId, isAuthenticated, isGuest, isLoading: authLoading } = useAuth();
  const { isIncognitoMode } = useUIStore();
  const {
    chats,
    messages,
    currentChatId,
    addChat,
    setMessages,
    updateChat: updateChatStore,
  } = useChatStore();

  const hasLoadedChats = useRef(false);
  const isSyncing = useRef(false);
  const dbEnabled = isSupabaseConfigured();

  // Load user's chats from database on mount
  useEffect(() => {
    async function loadChats() {
      if (
        authLoading ||
        !dbEnabled ||
        hasLoadedChats.current ||
        isIncognitoMode ||
        isSyncing.current
      ) {
        return;
      }

      isSyncing.current = true;

      try {
        const userChats = await getUserChats(userId);

        // Only load chats if we don't already have any (avoid overwriting local state)
        if (userChats.length > 0 && chats.length === 0) {
          userChats.forEach((chat) => {
            addChat(chat);
          });

          // Load messages for the most recent chat
          if (userChats[0]) {
            const chatMessages = await getChatMessages(userChats[0].id);
            setMessages(userChats[0].id, chatMessages);
          }
        }

        hasLoadedChats.current = true;
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        isSyncing.current = false;
      }
    }

    loadChats();
  }, [
    userId,
    authLoading,
    dbEnabled,
    isIncognitoMode,
    addChat,
    setMessages,
    chats.length,
  ]);

  /**
   * Create a new chat in the database
   */
  const createNewChat = async (
    modelId: string,
    title: string = 'New Chat',
    contextMode: ContextMode = null
  ): Promise<Chat | null> => {
    if (!dbEnabled || isIncognitoMode) {
      // Return a local-only chat
      const localChat: Chat = {
        id: `local_${Date.now()}`,
        user_id: userId,
        title,
        model_id: modelId,
        context_mode: contextMode,
        is_pinned: false,
        is_archived: false,
        is_incognito: isIncognitoMode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      addChat(localChat);
      return localChat;
    }

    try {
      const newChat = await createChat(userId, modelId, title, contextMode);
      if (newChat) {
        addChat(newChat);
        return newChat;
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }

    return null;
  };

  /**
   * Save a message to the database
   */
  const saveMessage = async (
    chatId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    attachments: any[] = []
  ): Promise<Message | null> => {
    if (!dbEnabled || isIncognitoMode || !chatId || chatId.startsWith('temp')) {
      // Return a local-only message
      const localMessage: Message = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        chat_id: chatId,
        role,
        content,
        created_at: new Date().toISOString(),
      };
      return localMessage;
    }

    try {
      const message = await createMessage(chatId, role, content, attachments);
      return message;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  };

  /**
   * Update chat title or metadata
   */
  const updateChatTitle = async (chatId: string, title: string): Promise<void> => {
    updateChatStore(chatId, { title });

    if (dbEnabled && !isIncognitoMode && !chatId.startsWith('local_')) {
      try {
        await updateChatDb(chatId, { title });
      } catch (error) {
        console.error('Error updating chat title:', error);
      }
    }
  };

  /**
   * Load messages for a specific chat
   */
  const loadChatMessages = async (chatId: string): Promise<void> => {
    if (!dbEnabled || isIncognitoMode || chatId.startsWith('local_') || chatId === 'temp') {
      return;
    }

    try {
      const chatMessages = await getChatMessages(chatId);
      setMessages(chatId, chatMessages);
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  return {
    isDbEnabled: dbEnabled,
    isSyncing: isSyncing.current,
    createNewChat,
    saveMessage,
    updateChatTitle,
    loadChatMessages,
  };
}
