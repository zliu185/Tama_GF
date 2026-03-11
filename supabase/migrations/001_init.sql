create extension if not exists pgcrypto;

create table if not exists public.users_profile (
  id uuid primary key,
  nickname text,
  created_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users_profile(id) on delete cascade,
  name text not null,
  stage text not null default 'egg' check (stage in ('egg', 'baby', 'child', 'adult')),
  hunger integer not null default 80 check (hunger between 0 and 100),
  mood integer not null default 80 check (mood between 0 and 100),
  energy integer not null default 80 check (energy between 0 and 100),
  cleanliness integer not null default 80 check (cleanliness between 0 and 100),
  health integer not null default 100 check (health between 0 and 100),
  xp integer not null default 0,
  age_days integer not null default 0,
  is_sleeping boolean not null default false,
  is_sick boolean not null default false,
  last_fed_at timestamptz,
  last_played_at timestamptz,
  last_cleaned_at timestamptz,
  last_slept_at timestamptz,
  last_calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create table if not exists public.pet_actions (
  id bigint generated always as identity primary key,
  pet_id uuid not null references public.pets(id) on delete cascade,
  action_type text not null,
  delta jsonb not null default '{}'::jsonb,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.special_events (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  event_type text not null,
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  trigger_at timestamptz not null,
  consumed_at timestamptz
);

create index if not exists idx_pet_actions_pet_id_created_at on public.pet_actions (pet_id, created_at desc);
create index if not exists idx_special_events_pet_id_trigger_at on public.special_events (pet_id, trigger_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_pets_set_updated_at on public.pets;
create trigger trg_pets_set_updated_at
before update on public.pets
for each row execute procedure public.set_updated_at();
