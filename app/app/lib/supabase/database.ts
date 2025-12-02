'use client';

import { createClient } from './client';
import type { Chat, Message, ContextMode, AspectRatio } from '@/types';
import type { Database } from '@/types/database.types';

type DbChat = Database['public']['Tables']['chats']['Row'];
type DbMessage = Database['public']['Tables']['messages']['Row'];
type DbChatInsert = Database['public']['Tables']['chats']['Insert'];
type DbMessageInsert = Database['public']['Tables']['messages']['Insert'];

/**
 * Database helper functions for Supabase operations
 * All functions handle errors gracefully and return null on failure
 */

// ============================================================================
// Chat Operations
// ============================================================================

export async function createChat(
  userId: string,
  modelId: string,
  title: string = 'New Chat',
  contextMode: string | null = null
): Promise<Chat | null> {
  try {
    const supabase = createClient();

    const chatData: DbChatInsert = {
      user_id: userId,
      model_id: modelId,
      title,
      context_mode: contextMode,
      is_incognito: false,
    };

    const { data, error } = await supabase.from('chats').insert(chatData).select().single();

    if (error) {
      console.error('Error creating chat:', error);
      return null;
    }

    return dbChatToChat(data);
  } catch (error) {
    console.error('Exception creating chat:', error);
    return null;
  }
}

export async function getChatById(chatId: string): Promise<Chat | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('chats').select('*').eq('id', chatId).single();

    if (error) {
      console.error('Error fetching chat:', error);
      return null;
    }

    return dbChatToChat(data);
  } catch (error) {
    console.error('Exception fetching chat:', error);
    return null;
  }
}

export async function getUserChats(userId: string, includeArchived = false): Promise<Chat[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .eq('is_incognito', false)
      .order('updated_at', { ascending: false });

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user chats:', error);
      return [];
    }

    return data.map(dbChatToChat);
  } catch (error) {
    console.error('Exception fetching user chats:', error);
    return [];
  }
}

export async function updateChat(chatId: string, updates: Partial<Chat>): Promise<Chat | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('chats')
      .update({
        title: updates.title,
        is_pinned: updates.is_pinned,
        is_archived: updates.is_archived,
        context_mode: updates.context_mode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', chatId)
      .select()
      .single();

    if (error) {
      console.error('Error updating chat:', error);
      return null;
    }

    return dbChatToChat(data);
  } catch (error) {
    console.error('Exception updating chat:', error);
    return null;
  }
}

export async function deleteChat(chatId: string): Promise<boolean> {
  try {
    const supabase = createClient();

    // Delete all messages first (cascade should handle this, but being explicit)
    await supabase.from('messages').delete().eq('chat_id', chatId);

    // Delete the chat
    const { error } = await supabase.from('chats').delete().eq('id', chatId);

    if (error) {
      console.error('Error deleting chat:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting chat:', error);
    return false;
  }
}

// ============================================================================
// Message Operations
// ============================================================================

export async function createMessage(
  chatId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  attachments: any[] = []
): Promise<Message | null> {
  try {
    const supabase = createClient();

    const messageData: DbMessageInsert = {
      chat_id: chatId,
      role,
      content,
      attachments: attachments.length > 0 ? JSON.parse(JSON.stringify(attachments)) : null,
    };

    const { data, error } = await supabase.from('messages').insert(messageData).select().single();

    if (error) {
      console.error('Error creating message:', error);
      return null;
    }

    // Update chat's updated_at timestamp
    await supabase.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', chatId);

    return dbMessageToMessage(data);
  } catch (error) {
    console.error('Exception creating message:', error);
    return null;
  }
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return data.map(dbMessageToMessage);
  } catch (error) {
    console.error('Exception fetching messages:', error);
    return [];
  }
}

export async function updateMessage(messageId: string, content: string): Promise<Message | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('messages')
      .update({ content })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return null;
    }

    return dbMessageToMessage(data);
  } catch (error) {
    console.error('Exception updating message:', error);
    return null;
  }
}

export async function deleteMessage(messageId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { error } = await supabase.from('messages').delete().eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception deleting message:', error);
    return false;
  }
}

// ============================================================================
// Helper Functions - Type Conversions
// ============================================================================

function dbChatToChat(dbChat: DbChat): Chat {
  return {
    id: dbChat.id,
    user_id: dbChat.user_id,
    workspace_id: dbChat.workspace_id ?? undefined,
    title: dbChat.title,
    model_id: dbChat.model_id,
    context_mode: (dbChat.context_mode as ContextMode) ?? undefined,
    is_pinned: dbChat.is_pinned,
    is_archived: dbChat.is_archived,
    is_incognito: dbChat.is_incognito,
    metadata: (dbChat.metadata as Record<string, any>) ?? undefined,
    created_at: dbChat.created_at,
    updated_at: dbChat.updated_at,
  };
}

function dbMessageToMessage(dbMessage: DbMessage): Message {
  return {
    id: dbMessage.id,
    chat_id: dbMessage.chat_id,
    role: dbMessage.role as 'user' | 'assistant' | 'system',
    content: dbMessage.content,
    attachments: dbMessage.attachments as any,
    aspect_ratio: (dbMessage.aspect_ratio as AspectRatio) ?? undefined,
    metrics: dbMessage.metrics as any,
    created_at: dbMessage.created_at,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return !!url && !!key && url !== 'your-project-url.supabase.co' && key !== 'your-anon-key-here';
}
