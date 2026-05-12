-- ============================================================
-- HABITS TRACKER — Setup Supabase
-- Colle ce SQL dans : Supabase > SQL Editor > New Query
-- ============================================================

-- 1. Table habits
create table if not exists public.habits (
  id          text primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  space       text not null check (space in ('pro', 'perso')),
  name        text not null,
  category    text not null,
  type        text not null check (type in ('positive', 'negative')),
  archived    boolean not null default false,
  "order"     integer not null default 0,
  created_at  timestamptz not null default now()
);

-- 2. Table checkins
create table if not exists public.checkins (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  habit_id    text not null,
  space       text not null check (space in ('pro', 'perso')),
  date        text not null,  -- format YYYY-MM-DD
  done        boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (user_id, habit_id, date)
);

-- 3. Index pour les requêtes fréquentes
create index if not exists habits_user_id_idx   on public.habits(user_id);
create index if not exists checkins_user_id_idx on public.checkins(user_id);
create index if not exists checkins_date_idx    on public.checkins(date);

-- 4. Row Level Security — chaque user voit uniquement ses données
alter table public.habits   enable row level security;
alter table public.checkins enable row level security;

-- Habits policies
create policy "habits: select own" on public.habits
  for select using (auth.uid() = user_id);

create policy "habits: insert own" on public.habits
  for insert with check (auth.uid() = user_id);

create policy "habits: update own" on public.habits
  for update using (auth.uid() = user_id);

create policy "habits: delete own" on public.habits
  for delete using (auth.uid() = user_id);

-- Checkins policies
create policy "checkins: select own" on public.checkins
  for select using (auth.uid() = user_id);

create policy "checkins: insert own" on public.checkins
  for insert with check (auth.uid() = user_id);

create policy "checkins: update own" on public.checkins
  for update using (auth.uid() = user_id);

create policy "checkins: delete own" on public.checkins
  for delete using (auth.uid() = user_id);
