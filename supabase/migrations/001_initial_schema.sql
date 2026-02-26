-- =============================================
-- VietnamTravel Collaborative Trip Sharing Schema
-- =============================================

-- 1. Profiles table (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  display_name text not null,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can read all profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid());

-- 2. Shared trips
create table public.shared_trips (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  start_date text not null,
  end_date text not null,
  notes text default '' not null,
  city_ids text[] default '{}' not null,
  invite_code text unique,
  invite_expires_at timestamptz,
  created_at timestamptz default now() not null
);

alter table public.shared_trips enable row level security;

-- 3. Trip members (access control)
create table public.trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.shared_trips(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz default now() not null,
  unique (trip_id, user_id)
);

alter table public.trip_members enable row level security;

-- 4. Shared day plans
create table public.shared_day_plans (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.shared_trips(id) on delete cascade,
  day_number integer not null,
  date text not null,
  notes text default '' not null,
  unique (trip_id, day_number)
);

alter table public.shared_day_plans enable row level security;

-- 5. Shared place visits
create table public.shared_place_visits (
  id uuid primary key default gen_random_uuid(),
  day_plan_id uuid not null references public.shared_day_plans(id) on delete cascade,
  place_id text not null,
  order_index integer not null default 0,
  is_visited boolean not null default false,
  start_time text,
  end_time text,
  notes text default '' not null,
  selected_dishes text[] default '{}' not null,
  added_by uuid references public.profiles(id),
  created_at timestamptz default now() not null
);

alter table public.shared_place_visits enable row level security;

-- =============================================
-- RLS Policies
-- =============================================

-- Helper: check if user is a member of a trip
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

-- shared_trips policies
create policy "Members can view their trips"
  on public.shared_trips for select
  to authenticated
  using (public.is_trip_member(id) or owner_id = auth.uid());

create policy "Authenticated users can create trips"
  on public.shared_trips for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "Owner can update trip"
  on public.shared_trips for update
  to authenticated
  using (owner_id = auth.uid());

create policy "Owner can delete trip"
  on public.shared_trips for delete
  to authenticated
  using (owner_id = auth.uid());

-- trip_members policies
create policy "Members can view trip members"
  on public.trip_members for select
  to authenticated
  using (public.is_trip_member(trip_id));

create policy "Owner can manage members"
  on public.trip_members for insert
  to authenticated
  with check (
    -- Owner adding members OR system via RPC
    exists (
      select 1 from public.trip_members
      where trip_id = trip_members.trip_id
        and user_id = auth.uid()
        and role = 'owner'
    )
    -- Allow self-insert for new trip creation (owner adding themselves)
    or user_id = auth.uid()
  );

create policy "Owner can remove members"
  on public.trip_members for delete
  to authenticated
  using (
    exists (
      select 1 from public.trip_members tm
      where tm.trip_id = trip_members.trip_id
        and tm.user_id = auth.uid()
        and tm.role = 'owner'
    )
  );

-- shared_day_plans policies
create policy "Members can view day plans"
  on public.shared_day_plans for select
  to authenticated
  using (public.is_trip_member(trip_id));

create policy "Members can insert day plans"
  on public.shared_day_plans for insert
  to authenticated
  with check (public.is_trip_member(trip_id));

create policy "Members can update day plans"
  on public.shared_day_plans for update
  to authenticated
  using (public.is_trip_member(trip_id));

create policy "Members can delete day plans"
  on public.shared_day_plans for delete
  to authenticated
  using (public.is_trip_member(trip_id));

-- shared_place_visits policies (check membership via day_plan → trip)
create or replace function public.is_day_plan_member(p_day_plan_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.shared_day_plans dp
    join public.trip_members tm on tm.trip_id = dp.trip_id
    where dp.id = p_day_plan_id and tm.user_id = auth.uid()
  );
$$;

create policy "Members can view place visits"
  on public.shared_place_visits for select
  to authenticated
  using (public.is_day_plan_member(day_plan_id));

create policy "Members can insert place visits"
  on public.shared_place_visits for insert
  to authenticated
  with check (public.is_day_plan_member(day_plan_id));

create policy "Members can update place visits"
  on public.shared_place_visits for update
  to authenticated
  using (public.is_day_plan_member(day_plan_id));

create policy "Members can delete place visits"
  on public.shared_place_visits for delete
  to authenticated
  using (public.is_day_plan_member(day_plan_id));

-- =============================================
-- RPC Functions
-- =============================================

-- Generate an invite code for a trip (owner only)
create or replace function public.generate_invite_code(p_trip_id uuid)
returns text
language plpgsql
security definer
as $$
declare
  v_code text;
begin
  -- Verify caller is the trip owner
  if not exists (
    select 1 from public.trip_members
    where trip_id = p_trip_id and user_id = auth.uid() and role = 'owner'
  ) then
    raise exception 'Only the trip owner can generate invite codes';
  end if;

  -- Generate 8-char URL-safe code
  v_code := encode(gen_random_bytes(6), 'base64');
  v_code := replace(replace(replace(v_code, '+', '-'), '/', '_'), '=', '');
  v_code := left(v_code, 8);

  -- Update the trip with the new invite code (expires in 7 days)
  update public.shared_trips
  set invite_code = v_code,
      invite_expires_at = now() + interval '7 days'
  where id = p_trip_id;

  return v_code;
end;
$$;

-- Join a trip via invite code
create or replace function public.join_trip(p_invite_code text)
returns uuid
language plpgsql
security definer
as $$
declare
  v_trip_id uuid;
begin
  -- Find the trip by invite code
  select id into v_trip_id
  from public.shared_trips
  where invite_code = p_invite_code
    and invite_expires_at > now();

  if v_trip_id is null then
    raise exception 'Invalid or expired invite code';
  end if;

  -- Check if already a member
  if exists (
    select 1 from public.trip_members
    where trip_id = v_trip_id and user_id = auth.uid()
  ) then
    return v_trip_id;
  end if;

  -- Add as member
  insert into public.trip_members (trip_id, user_id, role)
  values (v_trip_id, auth.uid(), 'member');

  return v_trip_id;
end;
$$;

-- Preview a trip by invite code (no auth required, returns public info)
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
  from public.shared_trips t
  join public.profiles p on p.id = t.owner_id
  where t.invite_code = p_invite_code
    and t.invite_expires_at > now();

  return v_result;
end;
$$;

-- =============================================
-- Enable Realtime
-- =============================================
alter publication supabase_realtime add table public.shared_trips;
alter publication supabase_realtime add table public.shared_day_plans;
alter publication supabase_realtime add table public.shared_place_visits;
