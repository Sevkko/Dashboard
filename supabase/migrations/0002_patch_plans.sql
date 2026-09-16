create table if not exists public.patch_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  stage text,
  console text,
  event_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists patch_plans_user_id_idx
  on public.patch_plans (user_id, created_at desc);

alter table public.patch_plans enable row level security;

drop policy if exists "Users can view their own patch plans" on public.patch_plans;
create policy "Users can view their own patch plans"
  on public.patch_plans for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own patch plans" on public.patch_plans;
create policy "Users can insert their own patch plans"
  on public.patch_plans for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own patch plans" on public.patch_plans;
create policy "Users can update their own patch plans"
  on public.patch_plans for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own patch plans" on public.patch_plans;
create policy "Users can delete their own patch plans"
  on public.patch_plans for delete
  using (auth.uid() = user_id);

create table if not exists public.patch_channels (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.patch_plans (id) on delete cascade,
  channel_number integer not null check (channel_number > 0),
  source text not null,
  input_type text,
  stagebox_channel text,
  channel_group text,
  notes text,
  created_at timestamptz not null default now(),
  unique (plan_id, channel_number)
);

create index if not exists patch_channels_plan_id_idx
  on public.patch_channels (plan_id, channel_number);

alter table public.patch_channels enable row level security;

drop policy if exists "Users can view channels of their own plans" on public.patch_channels;
create policy "Users can view channels of their own plans"
  on public.patch_channels for select
  using (exists (
    select 1 from public.patch_plans p
    where p.id = plan_id and p.user_id = auth.uid()
  ));

drop policy if exists "Users can insert channels into their own plans" on public.patch_channels;
create policy "Users can insert channels into their own plans"
  on public.patch_channels for insert
  with check (exists (
    select 1 from public.patch_plans p
    where p.id = plan_id and p.user_id = auth.uid()
  ));

drop policy if exists "Users can update channels of their own plans" on public.patch_channels;
create policy "Users can update channels of their own plans"
  on public.patch_channels for update
  using (exists (
    select 1 from public.patch_plans p
    where p.id = plan_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.patch_plans p
    where p.id = plan_id and p.user_id = auth.uid()
  ));

drop policy if exists "Users can delete channels of their own plans" on public.patch_channels;
create policy "Users can delete channels of their own plans"
  on public.patch_channels for delete
  using (exists (
    select 1 from public.patch_plans p
    where p.id = plan_id and p.user_id = auth.uid()
  ));
