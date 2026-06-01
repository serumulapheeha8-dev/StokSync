-- =============================================
-- STOKVEL APP — SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. PROFILES (extra user info beyond auth)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  phone text,
  created_at timestamp with time zone default now()
);

-- Auto-create profile when a user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- 2. GROUPS
create table groups (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  admin_id uuid references auth.users(id) on delete cascade not null,
  contribution_amount numeric not null default 0,
  cycle text not null default 'Monthly',
  start_date date default current_date,
  description text,
  created_at timestamp with time zone default now()
);

-- 3. GROUP MEMBERS
create table group_members (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  payout_order integer,
  joined_at timestamp with time zone default now()
);

-- 4. CONTRIBUTIONS
create table contributions (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  member_id uuid references group_members(id) on delete cascade not null,
  amount numeric not null,
  month text not null,
  status text not null default 'Pending',
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- 5. PAYOUTS
create table payouts (
  id uuid default gen_random_uuid() primary key,
  group_id uuid references groups(id) on delete cascade not null,
  member_id uuid references group_members(id) on delete cascade not null,
  amount numeric,
  scheduled_date date,
  status text not null default 'Upcoming',
  paid_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- Ensures users only see their own data
-- =============================================

alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table contributions enable row level security;
alter table payouts enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Groups: admins can do anything, members can view
create policy "Admin can manage groups" on groups for all using (auth.uid() = admin_id);
create policy "Members can view groups" on groups for select using (
  exists (
    select 1 from group_members
    where group_id = groups.id and user_id = auth.uid()
  )
);

-- Group members: admin can manage, members can view their group
create policy "Admin can manage members" on group_members for all using (
  exists (
    select 1 from groups where id = group_id and admin_id = auth.uid()
  )
);
create policy "Members can view group members" on group_members for select using (
  exists (
    select 1 from group_members gm2
    where gm2.group_id = group_members.group_id and gm2.user_id = auth.uid()
  )
);

-- Contributions: admin can manage, members can view
create policy "Admin can manage contributions" on contributions for all using (
  exists (
    select 1 from groups where id = group_id and admin_id = auth.uid()
  )
);
create policy "Members can view contributions" on contributions for select using (
  exists (
    select 1 from group_members
    where group_id = contributions.group_id and user_id = auth.uid()
  )
);

-- Payouts: admin can manage, members can view
create policy "Admin can manage payouts" on payouts for all using (
  exists (
    select 1 from groups where id = group_id and admin_id = auth.uid()
  )
);
create policy "Members can view payouts" on payouts for select using (
  exists (
    select 1 from group_members
    where group_id = payouts.group_id and user_id = auth.uid()
  )
);
