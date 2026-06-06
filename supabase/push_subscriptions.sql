-- Run this in your Supabase SQL Editor
-- Adds push notification subscription storage

create table push_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  subscription text not null,
  updated_at timestamp with time zone default now()
);

alter table push_subscriptions enable row level security;

create policy "Users can manage own push subscription" on push_subscriptions
  for all using (auth.uid() = user_id);
