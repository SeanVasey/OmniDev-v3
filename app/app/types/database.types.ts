export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          occupation: string | null;
          mobile_number: string | null;
          billing_address: Json | null;
          subscription_tier: string | null;
          subscription_status: string | null;
          google_id: string | null;
          preferences: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          occupation?: string | null;
          mobile_number?: string | null;
          billing_address?: Json | null;
          subscription_tier?: string | null;
          subscription_status?: string | null;
          google_id?: string | null;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          occupation?: string | null;
          mobile_number?: string | null;
          billing_address?: Json | null;
          subscription_tier?: string | null;
          subscription_status?: string | null;
          google_id?: string | null;
          preferences?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      workspaces: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          description: string | null;
          color: string | null;
          icon: string | null;
          is_archived: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          description?: string | null;
          color?: string | null;
          icon?: string | null;
          is_archived?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      chats: {
        Row: {
          id: string;
          user_id: string;
          workspace_id: string | null;
          title: string;
          model_id: string;
          context_mode: string | null;
          is_pinned: boolean;
          is_archived: boolean;
          is_incognito: boolean;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workspace_id?: string | null;
          title?: string;
          model_id?: string;
          context_mode?: string | null;
          is_pinned?: boolean;
          is_archived?: boolean;
          is_incognito?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          workspace_id?: string | null;
          title?: string;
          model_id?: string;
          context_mode?: string | null;
          is_pinned?: boolean;
          is_archived?: boolean;
          is_incognito?: boolean;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          chat_id: string;
          role: string;
          content: string;
          attachments: Json | null;
          aspect_ratio: string | null;
          metrics: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          role: string;
          content: string;
          attachments?: Json | null;
          aspect_ratio?: string | null;
          metrics?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          role?: string;
          content?: string;
          attachments?: Json | null;
          aspect_ratio?: string | null;
          metrics?: Json | null;
          created_at?: string;
        };
      };
      attachments: {
        Row: {
          id: string;
          user_id: string;
          message_id: string | null;
          storage_path: string;
          file_name: string;
          file_type: string;
          file_size: number;
          public_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          message_id?: string | null;
          storage_path: string;
          file_name: string;
          file_type: string;
          file_size: number;
          public_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          message_id?: string | null;
          storage_path?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          public_url?: string | null;
          created_at?: string;
        };
      };
    };
  };
}
