-- Mirrors the mobile phase-1 engine: no geolocation, adaptive scoring-ready data.

do $$
begin
  create type public.task_context_tag as enum ('general', 'calls', 'shopping', 'mail', 'errands');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.personal_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  context_tag public.task_context_tag not null default 'general',
  base_weight numeric not null default 1,
  energy_required numeric not null default 0.5
    check (energy_required >= 0 and energy_required <= 1),
  days_delayed integer not null default 0 check (days_delayed >= 0),
  status text not null default 'active'
    check (status in ('active', 'done', 'archived')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.task_time_windows (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.personal_tasks(id) on delete cascade,
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (start_time < end_time)
);

create table if not exists public.user_energy_map (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  hour integer not null check (hour >= 0 and hour <= 23),
  energy_level numeric not null default 0.5
    check (energy_level >= 0 and energy_level <= 1),
  sample_count integer not null default 0 check (sample_count >= 0),
  updated_at timestamptz not null default now(),
  unique (user_id, hour)
);

create table if not exists public.task_surface_log (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.personal_tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  context_tag public.task_context_tag not null,
  surface_score numeric,
  outcome text not null check (outcome in ('done', 'snoozed', 'ignored')),
  created_at timestamptz not null default now()
);

create table if not exists public.task_suppression_factors (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.personal_tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  context_tag public.task_context_tag not null,
  factor numeric not null default 1 check (factor >= 0.1 and factor <= 2),
  updated_at timestamptz not null default now(),
  unique (task_id, context_tag)
);

create index if not exists personal_tasks_user_status_idx
  on public.personal_tasks(user_id, status, created_at desc);

alter table public.personal_tasks enable row level security;
alter table public.task_time_windows enable row level security;
alter table public.user_energy_map enable row level security;
alter table public.task_surface_log enable row level security;
alter table public.task_suppression_factors enable row level security;

drop policy if exists "Users manage their personal tasks" on public.personal_tasks;
create policy "Users manage their personal tasks"
  on public.personal_tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage task windows through owned tasks" on public.task_time_windows;
create policy "Users manage task windows through owned tasks"
  on public.task_time_windows for all
  using (
    exists (
      select 1 from public.personal_tasks t
      where t.id = task_time_windows.task_id and t.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.personal_tasks t
      where t.id = task_time_windows.task_id and t.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage their energy map" on public.user_energy_map;
create policy "Users manage their energy map"
  on public.user_energy_map for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their task surface log" on public.task_surface_log;
create policy "Users manage their task surface log"
  on public.task_surface_log for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage suppression through owned tasks" on public.task_suppression_factors;
create policy "Users manage suppression through owned tasks"
  on public.task_suppression_factors for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists update_personal_tasks_updated_at on public.personal_tasks;
create trigger update_personal_tasks_updated_at
  before update on public.personal_tasks
  for each row execute function public.update_updated_at();

drop trigger if exists update_user_energy_map_updated_at on public.user_energy_map;
create trigger update_user_energy_map_updated_at
  before update on public.user_energy_map
  for each row execute function public.update_updated_at();

drop trigger if exists update_task_suppression_factors_updated_at on public.task_suppression_factors;
create trigger update_task_suppression_factors_updated_at
  before update on public.task_suppression_factors
  for each row execute function public.update_updated_at();

create or replace function public.increment_task_delays()
returns void
language sql
security definer
set search_path = public
as $$
  update public.personal_tasks
  set days_delayed = days_delayed + 1
  where status = 'active'
    and created_at < now() - interval '1 day';
$$;
