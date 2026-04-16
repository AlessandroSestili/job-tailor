-- JobTailor initial schema
-- Apply via Supabase dashboard → SQL editor, or `supabase db push`

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── users ────────────────────────────────────────────────────────────────────
-- Mirrors auth.users; populated via trigger on first sign-in.
create table if not exists public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users: own row only"
  on public.users
  for all
  using (auth.uid() = id);

-- Trigger: auto-insert into public.users on auth.users insert
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── master_profiles ──────────────────────────────────────────────────────────
create table if not exists public.master_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users (id) on delete cascade,
  structured_data jsonb not null,      -- MasterProfileData (from extractCvFromPdf)
  raw_cv_url      text,                -- PDF stored in Supabase Storage
  free_text       text,                -- "tell me about yourself"
  preferences     jsonb default '{}'::jsonb,  -- tone, target sectors, etc.
  updated_at      timestamptz not null default now()
);

alter table public.master_profiles enable row level security;

create policy "master_profiles: own rows only"
  on public.master_profiles
  for all
  using (auth.uid() = user_id);

-- auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger master_profiles_updated_at
  before update on public.master_profiles
  for each row execute procedure public.set_updated_at();

-- ─── jobs ─────────────────────────────────────────────────────────────────────
create table if not exists public.jobs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users (id) on delete cascade,
  source_type     text not null check (source_type in ('url', 'text', 'form')),
  source_value    text not null,       -- original URL or raw text
  structured_data jsonb not null,      -- JobData (from extractJobFromText)
  created_at      timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "jobs: own rows only"
  on public.jobs
  for all
  using (auth.uid() = user_id);

-- ─── generations ──────────────────────────────────────────────────────────────
create table if not exists public.generations (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users (id) on delete cascade,
  master_profile_id   uuid not null references public.master_profiles (id) on delete cascade,
  job_id              uuid not null references public.jobs (id) on delete cascade,
  tailored_cv         jsonb not null,  -- TailoredCvData (from generateTailoredCv)
  cover_letter        text not null,   -- plain text, from generateCoverLetter
  cv_pdf_url          text,            -- generated PDF on Supabase Storage
  feedback            text,            -- regeneration instructions
  created_at          timestamptz not null default now()
);

alter table public.generations enable row level security;

create policy "generations: own rows only"
  on public.generations
  for all
  using (auth.uid() = user_id);

-- ─── Storage buckets ──────────────────────────────────────────────────────────
-- Run these in Supabase dashboard → Storage (SQL editor cannot create buckets).
-- insert into storage.buckets (id, name, public) values ('cv-uploads', 'cv-uploads', false);
-- insert into storage.buckets (id, name, public) values ('cv-generated', 'cv-generated', false);
