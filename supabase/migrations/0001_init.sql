-- Hobbitify base schema. Idempotent so it can be re-run safely.
-- Apply in the Supabase SQL editor or via `supabase db push`.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- profiles: 1:1 with auth.users, holds tier + lifetime counters.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  tier text not null default 'free',
  generated_count int not null default 0,
  total_count int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- skill_trees: every saved tree, generated or uploaded.
-- ---------------------------------------------------------------------------
create table if not exists public.skill_trees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  query text not null,
  query_normalized text not null,
  source text not null check (source in ('generated', 'uploaded')),
  skills jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists skill_trees_user_id_idx
  on public.skill_trees (user_id);

create index if not exists skill_trees_query_trgm_idx
  on public.skill_trees using gin (query_normalized gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.skill_trees enable row level security;

-- profiles: a user can read and update only their own row.
drop policy if exists "own profile read"   on public.profiles;
drop policy if exists "own profile update" on public.profiles;
create policy "own profile read"
  on public.profiles for select
  using (auth.uid() = id);
create policy "own profile update"
  on public.profiles for update
  using (auth.uid() = id);

-- skill_trees: a user can read and delete only their own rows.
-- Inserts go through the service-role Worker via the create_skill_tree RPC,
-- so no insert policy is exposed to the anon/authenticated roles.
drop policy if exists "own trees read"   on public.skill_trees;
drop policy if exists "own trees delete" on public.skill_trees;
create policy "own trees read"
  on public.skill_trees for select
  using (auth.uid() = user_id);
create policy "own trees delete"
  on public.skill_trees for delete
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Auto-create a profile row whenever a new auth.users row is inserted.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- create_skill_tree: atomic quota check + insert + counter bump.
-- Called by the Worker with the service role. Raises P0001 errors on quota
-- violations so the Worker can map them to clean HTTP 403 responses.
-- ---------------------------------------------------------------------------
create or replace function public.create_skill_tree(
  p_user uuid,
  p_query text,
  p_query_normalized text,
  p_source text,
  p_skills jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
  v_generated int;
  v_id uuid;
begin
  if p_source not in ('generated', 'uploaded') then
    raise exception 'INVALID_SOURCE' using errcode = 'P0001';
  end if;

  select total_count, generated_count
    into v_total, v_generated
    from public.profiles
    where id = p_user
    for update;

  if not found then
    raise exception 'PROFILE_MISSING' using errcode = 'P0001';
  end if;

  if v_total >= 10 then
    raise exception 'TIER_TOTAL_LIMIT' using errcode = 'P0001';
  end if;

  if p_source = 'generated' and v_generated >= 5 then
    raise exception 'TIER_GENERATED_LIMIT' using errcode = 'P0001';
  end if;

  insert into public.skill_trees (user_id, query, query_normalized, source, skills)
    values (p_user, p_query, p_query_normalized, p_source, p_skills)
    returning id into v_id;

  update public.profiles
    set total_count = total_count + 1,
        generated_count = generated_count
          + case when p_source = 'generated' then 1 else 0 end
    where id = p_user;

  return v_id;
end;
$$;

-- Allow only the service role and authenticated callers to invoke; the
-- function is security definer, so it runs with the owner's privileges.
revoke all on function public.create_skill_tree(uuid, text, text, text, jsonb)
  from public, anon, authenticated;
grant execute on function public.create_skill_tree(uuid, text, text, text, jsonb)
  to service_role;

-- ---------------------------------------------------------------------------
-- find_similar_trees: pg_trgm similarity search scoped to a single user.
-- Returns the top 5 matches above the 0.4 similarity threshold.
-- ---------------------------------------------------------------------------
create or replace function public.find_similar_trees(
  p_user uuid,
  p_query_normalized text,
  p_threshold real default 0.4
) returns table (
  id uuid,
  query text,
  source text,
  score real,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select t.id,
         t.query,
         t.source,
         similarity(t.query_normalized, p_query_normalized) as score,
         t.created_at
    from public.skill_trees t
   where t.user_id = p_user
     and similarity(t.query_normalized, p_query_normalized) >= p_threshold
   order by score desc
   limit 5;
$$;

revoke all on function public.find_similar_trees(uuid, text, real)
  from public, anon, authenticated;
grant execute on function public.find_similar_trees(uuid, text, real)
  to service_role;
