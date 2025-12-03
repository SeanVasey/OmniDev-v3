export type ContextMode = 'thinking' | 'search' | 'research' | 'image' | 'video' | null;
export type AspectRatio = '1:1' | '3:4' | '4:3' | '16:9' | '9:16';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  preferences?: {
    theme?: 'dark' | 'light';
    haptics_enabled?: boolean;
    default_model?: string;
  };
}

export interface Project {
  id: string;
  owner_id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface Chat {
  id: string;
  user_id: string;
  workspace_id?: string;
  title: string;
  model_id: string;
  context_mode?: ContextMode;
  is_pinned: boolean;
  is_archived: boolean;
  is_incognito: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  aspect_ratio?: AspectRatio;
  metrics?: {
    tokens_input?: number;
    tokens_output?: number;
    cost?: number;
    latency_ms?: number;
  };
  created_at: string;
}

export interface Attachment {
  id: string;
  user_id: string;
  message_id?: string;
  storage_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url?: string;
  created_at: string;
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'xai' | 'mistral' | 'perplexity' | 'meta' | 'local';
  contextWindow: number;
  supportsStreaming: boolean;
  supportsVision: boolean;
  supportsImageGen: boolean;
  supportsVideoGen?: boolean;
  supportsThinking?: boolean;
  supportsResearch?: boolean;
  maxTokens: number;
}
