-- Create tables
create table partnerships (
  id uuid default uuid_generate_v4() primary key,
  user_a uuid references auth.users(id) not null,  -- requester
  user_b uuid references auth.users(id) not null,  -- receiver
  status text default 'pending' check (status in ('pending', 'accepted')),
  relationship_date date,
  current_streak integer default 0,
  last_streak_date date,
  created_at timestamp default now(),
  unique(user_a, user_b)
);

create table messages (
  id uuid default uuid_generate_v4() primary key,
  sender uuid references auth.users(id),
  receiver uuid references auth.users(id),
  content text not null,
  unlock_date date not null,
  opened boolean default false,
  created_at timestamp default now()
);

-- Enable RLS
alter table partnerships enable row level security;
alter table messages enable row level security;

-- Policies for partnerships
create policy "Users can see partnerships they're part of" on partnerships
  for select using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Users can create partnership requests" on partnerships
  for insert with check (auth.uid() = user_a);

create policy "Users can update partnerships they're part of" on partnerships
  for update using (auth.uid() = user_a or auth.uid() = user_b);

-- Policies for messages
create policy "Users can see messages sent to them or by them" on messages
  for select using (auth.uid() = sender or auth.uid() = receiver);

create policy "Users can insert messages" on messages
  for insert with check (auth.uid() = sender);

create policy "Users can update opened status of received messages" on messages
  for update using (auth.uid() = receiver);
