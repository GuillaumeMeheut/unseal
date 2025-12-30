-- Create tables
create table partners (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) unique,
  partner_id uuid references auth.users(id)
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
alter table partners enable row level security;
alter table messages enable row level security;

-- Policies (Simple for MVP)
create policy "Users can see their own partner entry" on partners
  for select using (auth.uid() = user_id);

create policy "Users can insert their own partner entry" on partners
  for insert with check (auth.uid() = user_id);
  
create policy "Users can update their own partner entry" on partners
  for update using (auth.uid() = user_id);

create policy "Users can see messages sent to them or by them" on messages
  for select using (auth.uid() = sender or auth.uid() = receiver);

create policy "Users can insert messages" on messages
  for insert with check (auth.uid() = sender);

create policy "Users can update opened status of received messages" on messages
  for update using (auth.uid() = receiver);
