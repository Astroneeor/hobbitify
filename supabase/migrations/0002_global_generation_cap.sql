-- Platform-wide cap on AI-generated trees (all users combined).
-- Atomic via a single-row counter bumped inside create_skill_tree.

create table if not exists public.platform_counters (
  key text primary key,
  value int not null default 0
);

alter table public.platform_counters enable row level security;

-- No SELECT/INSERT policies for anon/authenticated; service_role bypasses RLS.

insert into public.platform_counters (key, value)
values ('global_ai_generations', 0)
on conflict (key) do nothing;

-- Sync counter with existing generated rows (idempotent).
update public.platform_counters c
set value = sub.n
from (
  select count(*)::int as n
  from public.skill_trees
  where source = 'generated'
) sub
where c.key = 'global_ai_generations';

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
  v_bump int;
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

  if p_source = 'generated' then
    update public.platform_counters
       set value = value + 1
     where key = 'global_ai_generations'
       and value < 10;
    get diagnostics v_bump = row_count;
    if v_bump = 0 then
      raise exception 'GLOBAL_GENERATION_CAP' using errcode = 'P0001';
    end if;
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
