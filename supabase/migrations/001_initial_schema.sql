-- ═══════════════════════════════════════════════════════════════
-- OMNIDEV V3.0 DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ═══════════════════════════════════════════════════════════════
-- 1. PROFILES (Linked to Supabase Auth)
-- ═══════════════════════════════════════════════════════════════
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  preferences jsonb default '{
    "theme": "dark",
    "haptics_enabled": true,
    "default_model": "gpt-4o"
  }'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════
-- 2. WORKSPACES (Projects/Folders)
-- ═══════════════════════════════════════════════════════════════
create table public.workspaces (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  color text default 'orange',
  icon text default 'folder',
  is_archived boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.workspaces enable row level security;

-- RLS Policies
create policy "Users can view own workspaces"
  on public.workspaces for select
  using (auth.uid() = owner_id);

create policy "Users can create workspaces"
  on public.workspaces for insert
  with check (auth.uid() = owner_id);

create policy "Users can update own workspaces"
  on public.workspaces for update
  using (auth.uid() = owner_id);

create policy "Users can delete own workspaces"
  on public.workspaces for delete
  using (auth.uid() = owner_id);

-- Index
create index idx_workspaces_owner on public.workspaces(owner_id);

-- ═══════════════════════════════════════════════════════════════
-- 3. CHATS (Conversations)
-- ═══════════════════════════════════════════════════════════════
create table public.chats (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  workspace_id uuid references public.workspaces(id) on delete set null,
  title text default 'New Chat',
  model_id text not null default 'gpt-4o',
  context_mode text,
  is_pinned boolean default false,
  is_archived boolean default false,
  is_incognito boolean default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.chats enable row level security;

-- RLS Policies
create policy "Users can view own chats"
  on public.chats for select
  using (auth.uid() = user_id);

create policy "Users can create chats"
  on public.chats for insert
  with check (auth.uid() = user_id);

create policy "Users can update own chats"
  on public.chats for update
  using (auth.uid() = user_id);

create policy "Users can delete own chats"
  on public.chats for delete
  using (auth.uid() = user_id);

-- Indexes
create index idx_chats_user on public.chats(user_id);
create index idx_chats_workspace on public.chats(workspace_id);
create index idx_chats_updated on public.chats(updated_at desc);

-- ═══════════════════════════════════════════════════════════════
-- 4. MESSAGES
-- ═══════════════════════════════════════════════════════════════
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  attachments jsonb default '[]'::jsonb,
  aspect_ratio text,
  metrics jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.messages enable row level security;

-- RLS Policies
create policy "Users can view messages in own chats"
  on public.messages for select
  using (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

create policy "Users can create messages in own chats"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

-- Index
create index idx_messages_chat on public.messages(chat_id);
create index idx_messages_created on public.messages(created_at);

-- ═══════════════════════════════════════════════════════════════
-- 5. ATTACHMENTS (File storage metadata)
-- ═══════════════════════════════════════════════════════════════
create table public.attachments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  message_id uuid references public.messages(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  file_type text not null,
  file_size bigint not null,
  public_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.attachments enable row level security;

create policy "Users can view own attachments"
  on public.attachments for select
  using (auth.uid() = user_id);

create policy "Users can create attachments"
  on public.attachments for insert
  with check (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- 6. UPDATED_AT TRIGGER
-- ═══════════════════════════════════════════════════════════════
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure update_updated_at_column();

create trigger update_workspaces_updated_at
  before update on public.workspaces
  for each row execute procedure update_updated_at_column();

create trigger update_chats_updated_at
  before update on public.chats
  for each row execute procedure update_updated_at_column();
