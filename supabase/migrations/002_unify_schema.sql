-- =============================================
-- Migration: Unify Dexie + Supabase into single schema
-- Renames shared_* tables to unified names,
-- adds custom_cities/custom_places tables.
-- =============================================

-- 1. Rename tables
alter table public.shared_trips rename to trips;
alter table public.shared_day_plans rename to day_plans;
alter table public.shared_place_visits rename to place_visits;

-- 2. Create custom_cities table
create table public.custom_cities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  region text not null default 'Vietnam',
  city_description text default '' not null,
  lat double precision,
  lng double precision,
  thumbnail text,
  created_at timestamptz default now() not null
);

alter table public.custom_cities enable row level security;

create policy "Users can view own custom cities"
  on public.custom_cities for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can create custom cities"
  on public.custom_cities for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own custom cities"
  on public.custom_cities for update
  to authenticated
  using (user_id = auth.uid());

create policy "Users can delete own custom cities"
  on public.custom_cities for delete
  to authenticated
  using (user_id = auth.uid());

-- 3. Create custom_places table
create table public.custom_places (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  custom_city_id uuid references public.custom_cities(id) on delete cascade,
  name text not null,
  category_raw_value text not null default 'landmark',
  place_description text default '' not null,
  address text default '' not null,
  city_id text default '' not null,
  is_custom_city boolean not null default false,
  lat double precision,
  lng double precision,
  thumbnail text,
  recommended_dishes text[] default '{}' not null,
  created_at timestamptz default now() not null
);

alter table public.custom_places enable row level security;

create policy "Users can view own custom places"
  on public.custom_places for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can create custom places"
  on public.custom_places for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update own custom places"
  on public.custom_places for update
  to authenticated
  using (user_id = auth.uid());

create policy "Users can delete own custom places"
  on public.custom_places for delete
  to authenticated
  using (user_id = auth.uid());

-- 4. Recreate helper functions to reference renamed tables

create or replace function public.is_trip_member(p_trip_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = p_trip_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_day_plan_member(p_day_plan_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.day_plans dp
    join public.trip_members tm on tm.trip_id = dp.trip_id
    where dp.id = p_day_plan_id and tm.user_id = auth.uid()
  );
$$;

-- 5. Recreate RPC functions to reference renamed tables

create or replace function public.generate_invite_code(p_trip_id uuid)
returns text
language plpgsql
security definer
as $$
declare
  v_code text;
begin
  if not exists (
    select 1 from public.trip_members
    where trip_id = p_trip_id and user_id = auth.uid() and role = 'owner'
  ) then
    raise exception 'Only the trip owner can generate invite codes';
  end if;

  v_code := encode(gen_random_bytes(6), 'base64');
  v_code := replace(replace(replace(v_code, '+', '-'), '/', '_'), '=', '');
  v_code := left(v_code, 8);

  update public.trips
  set invite_code = v_code,
      invite_expires_at = now() + interval '7 days'
  where id = p_trip_id;

  return v_code;
end;
$$;

create or replace function public.join_trip(p_invite_code text)
returns uuid
language plpgsql
security definer
as $$
declare
  v_trip_id uuid;
begin
  select id into v_trip_id
  from public.trips
  where invite_code = p_invite_code
    and invite_expires_at > now();

  if v_trip_id is null then
    raise exception 'Invalid or expired invite code';
  end if;

  if exists (
    select 1 from public.trip_members
    where trip_id = v_trip_id and user_id = auth.uid()
  ) then
    return v_trip_id;
  end if;

  insert into public.trip_members (trip_id, user_id, role)
  values (v_trip_id, auth.uid(), 'member');

  return v_trip_id;
end;
$$;

create or replace function public.preview_trip_by_invite(p_invite_code text)
returns json
language plpgsql
security definer
as $$
declare
  v_result json;
begin
  select json_build_object(
    'id', t.id,
    'name', t.name,
    'start_date', t.start_date,
    'end_date', t.end_date,
    'city_ids', t.city_ids,
    'notes', t.notes,
    'owner', json_build_object(
      'display_name', p.display_name,
      'username', p.username
    ),
    'member_count', (select count(*) from public.trip_members where trip_id = t.id)
  ) into v_result
  from public.trips t
  join public.profiles p on p.id = t.owner_id
  where t.invite_code = p_invite_code
    and t.invite_expires_at > now();

  return v_result;
end;
$$;

-- 6. Update realtime publication
-- Remove old table names (they no longer exist after rename)
-- The renamed tables keep their oid, so they may already be in the publication.
-- We drop and re-add to be safe.
do $$
begin
  -- Try removing old names (may fail if rename already updated publication)
  begin
    alter publication supabase_realtime drop table public.shared_trips;
  exception when others then null;
  end;
  begin
    alter publication supabase_realtime drop table public.shared_day_plans;
  exception when others then null;
  end;
  begin
    alter publication supabase_realtime drop table public.shared_place_visits;
  exception when others then null;
  end;
end $$;

-- Add tables to publication (using new names)
-- Using DO block to handle case where they're already present from rename
do $$
begin
  begin
    alter publication supabase_realtime add table public.trips;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.day_plans;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.place_visits;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.custom_cities;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.custom_places;
  exception when duplicate_object then null;
  end;
end $$;
