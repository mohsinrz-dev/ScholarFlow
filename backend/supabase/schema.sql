create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text check (display_name is null or char_length(display_name) between 1 and 100),
  preferred_language text not null default 'en' check (preferred_language in ('en', 'hi')),
  timezone text not null default 'UTC',
  learning_preferences jsonb not null default '{}'::jsonb check (jsonb_typeof(learning_preferences) = 'object'),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 150),
  description text check (description is null or char_length(description) <= 1000),
  target_hours numeric(8, 2) check (target_hours is null or target_hours > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name),
  unique (id, user_id)
);

create table if not exists public.study_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid,
  title text not null check (char_length(title) between 1 and 255),
  description text check (description is null or char_length(description) <= 2000),
  topic text check (topic is null or char_length(topic) <= 255),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  due_date timestamptz,
  estimated_duration integer check (estimated_duration is null or estimated_duration between 1 and 1440),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (subject_id, user_id) references public.subjects(id, user_id) on delete set null (subject_id),
  unique (id, user_id)
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid,
  task_id uuid,
  topic text check (topic is null or char_length(topic) <= 255),
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes between 1 and 1440),
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  foreign key (subject_id, user_id) references public.subjects(id, user_id) on delete set null (subject_id),
  foreign key (task_id, user_id) references public.study_tasks(id, user_id) on delete set null (task_id),
  check (ended_at > started_at),
  check (ended_at - started_at <= interval '24 hours')
);

create table if not exists public.revision_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid,
  source_task_id uuid,
  topic text not null check (char_length(topic) between 1 and 255),
  due_date timestamptz not null default now(),
  last_reviewed_at timestamptz,
  review_count integer not null default 0 check (review_count >= 0),
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'skipped')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (subject_id, user_id) references public.subjects(id, user_id) on delete set null (subject_id),
  foreign key (source_task_id, user_id) references public.study_tasks(id, user_id) on delete set null (source_task_id)
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  subject text check (subject is null or char_length(subject) <= 150),
  language text not null default 'en' check (language in ('en', 'hi')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 12000),
  created_at timestamptz not null default now()
);

create or replace function public.enforce_study_pilot_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  owner_id uuid;
begin
  if new.subject_id is not null then
    select user_id into owner_id from public.subjects where id = new.subject_id;
    if owner_id is distinct from new.user_id then
      raise exception 'Subject does not belong to this user' using errcode = '23503';
    end if;
  end if;
  if tg_table_name = 'study_sessions' and new.task_id is not null then
    select user_id into owner_id from public.study_tasks where id = new.task_id;
    if owner_id is distinct from new.user_id then
      raise exception 'Task does not belong to this user' using errcode = '23503';
    end if;
  end if;
  if tg_table_name = 'revision_items' and new.source_task_id is not null then
    select user_id into owner_id from public.study_tasks where id = new.source_task_id;
    if owner_id is distinct from new.user_id then
      raise exception 'Task does not belong to this user' using errcode = '23503';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists study_tasks_owner_check on public.study_tasks;
create trigger study_tasks_owner_check before insert or update of subject_id, user_id on public.study_tasks for each row execute function public.enforce_study_pilot_owner();
drop trigger if exists study_sessions_owner_check on public.study_sessions;
create trigger study_sessions_owner_check before insert or update of subject_id, task_id, user_id on public.study_sessions for each row execute function public.enforce_study_pilot_owner();
drop trigger if exists revision_items_owner_check on public.revision_items;
create trigger revision_items_owner_check before insert or update of subject_id, source_task_id, user_id on public.revision_items for each row execute function public.enforce_study_pilot_owner();

create or replace function public.enforce_ai_message_owner()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from public.ai_conversations where id = new.conversation_id and user_id = new.user_id) then
    raise exception 'Conversation does not belong to this user' using errcode = '23503';
  end if;
  return new;
end;
$$;

drop trigger if exists ai_messages_owner_check on public.ai_messages;
create trigger ai_messages_owner_check before insert or update of conversation_id, user_id on public.ai_messages for each row execute function public.enforce_ai_message_owner();

create index if not exists subjects_user_created_idx on public.subjects (user_id, created_at desc);
create index if not exists study_tasks_user_created_idx on public.study_tasks (user_id, created_at desc);
create index if not exists study_tasks_user_due_idx on public.study_tasks (user_id, due_date);
create index if not exists study_sessions_user_started_idx on public.study_sessions (user_id, started_at desc);
create index if not exists revision_items_user_due_idx on public.revision_items (user_id, status, due_date);
create index if not exists ai_conversations_user_updated_idx on public.ai_conversations (user_id, updated_at desc);
create index if not exists ai_messages_conversation_created_idx on public.ai_messages (conversation_id, created_at);
create index if not exists ai_messages_user_idx on public.ai_messages (user_id);

do $$
declare
  table_name text;
begin
  foreach table_name in array array['profiles', 'subjects', 'study_tasks', 'study_sessions', 'revision_items', 'ai_conversations', 'ai_messages'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists %I on public.%I', table_name || '_owner_access', table_name);
    if table_name = 'profiles' then
      execute format('create policy %I on public.%I for all to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()))', table_name || '_owner_access', table_name);
    else
      execute format('create policy %I on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', table_name || '_owner_access', table_name);
    end if;
  end loop;
end $$;

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on public.profiles, public.subjects, public.study_tasks, public.study_sessions, public.revision_items, public.ai_conversations, public.ai_messages to authenticated, service_role;

create or replace function public.upsert_profile_safe(p_user_id uuid, p_email text)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.profiles;
begin
  if auth.uid() is not null and auth.uid() is distinct from p_user_id then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  insert into public.profiles (id, email)
  values (p_user_id, p_email)
  on conflict (id) do update set email = excluded.email
  returning * into result;
  return result;
end;
$$;

revoke all on function public.upsert_profile_safe(uuid, text) from public, anon;
grant execute on function public.upsert_profile_safe(uuid, text) to authenticated, service_role;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, nullif(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

do $$
declare
  table_name text;
begin
  foreach table_name in array array['profiles', 'subjects', 'study_tasks', 'revision_items', 'ai_conversations'] loop
    execute format('drop trigger if exists %I on public.%I', table_name || '_set_updated_at', table_name);
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', table_name || '_set_updated_at', table_name);
  end loop;
end $$;
