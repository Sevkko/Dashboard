create extension if not exists "pgcrypto";

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'fixed_cost')),
  label text not null,
  category text,
  amount numeric(12, 2) not null check (amount > 0),
  entry_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists entries_user_id_entry_date_idx
  on public.entries (user_id, entry_date desc);

alter table public.entries enable row level security;

drop policy if exists "Users can view their own entries" on public.entries;
create policy "Users can view their own entries"
  on public.entries for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own entries" on public.entries;
create policy "Users can insert their own entries"
  on public.entries for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own entries" on public.entries;
create policy "Users can update their own entries"
  on public.entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own entries" on public.entries;
create policy "Users can delete their own entries"
  on public.entries for delete
  using (auth.uid() = user_id);
