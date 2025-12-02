import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Chat, Message } from '@/types';

interface ChatState {
  currentChatId: string | null;
  chats: Chat[];
  messages: Record<string, Message[]>;
  isIncognito: boolean;
  isStreaming: boolean;

  // Actions
  setCurrentChat: (chatId: string | null) => void;
  addChat: (chat: Chat) => void;
  updateChat: (chatId: string, updates: Partial<Chat>) => void;
  deleteChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  updateMessage: (chatId: string, messageId: string, updates: Partial<Message>) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  setIncognito: (isIncognito: boolean) => void;
  setStreaming: (isStreaming: boolean) => void;
  clearIncognitoData: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      currentChatId: null,
      chats: [],
      messages: {},
      isIncognito: false,
      isStreaming: false,

      setCurrentChat: (chatId) => set({ currentChatId: chatId }),

      addChat: (chat) =>
        set((state) => ({
          chats: [chat, ...state.chats],
        })),

      updateChat: (chatId, updates) =>
        set((state) => ({
          chats: state.chats.map((chat) => (chat.id === chatId ? { ...chat, ...updates } : chat)),
        })),

      deleteChat: (chatId) =>
        set((state) => {
          const newMessages = { ...state.messages };
          delete newMessages[chatId];
          return {
            chats: state.chats.filter((chat) => chat.id !== chatId),
            messages: newMessages,
            currentChatId: state.currentChatId === chatId ? null : state.currentChatId,
          };
        }),

      addMessage: (chatId, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: [...(state.messages[chatId] || []), message],
          },
        })),

      updateMessage: (chatId, messageId, updates) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: (state.messages[chatId] || []).map((msg) =>
              msg.id === messageId ? { ...msg, ...updates } : msg
            ),
          },
        })),

      setMessages: (chatId, messages) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [chatId]: messages,
          },
        })),

      setIncognito: (isIncognito) => set({ isIncognito }),

      setStreaming: (isStreaming) => set({ isStreaming }),

      clearIncognitoData: () =>
        set({
          chats: [],
          messages: {},
          currentChatId: null,
        }),
    }),
    {
      name: 'omnidev-chat-storage',
      partialize: (state) =>
        state.isIncognito
          ? { isIncognito: state.isIncognito }
          : {
              currentChatId: state.currentChatId,
              chats: state.chats,
              messages: state.messages,
              isIncognito: state.isIncognito,
            },
    }
  )
);
