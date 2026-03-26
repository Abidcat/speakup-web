-- ── Scripts ─────────────────────────────────────────────────────────────────
create table if not exists scripts (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null default 'Untitled',
  content     text not null default '',
  tags        text[] default '{}',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
alter table scripts enable row level security;
create policy "Users manage own scripts"
  on scripts for all using (auth.uid() = user_id);

-- ── Teams ────────────────────────────────────────────────────────────────────
create table if not exists teams (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  owner_id    uuid references auth.users(id) on delete cascade not null,
  created_at  timestamptz default now()
);
alter table teams enable row level security;
create policy "Owner full access"
  on teams for all using (owner_id = auth.uid());

-- ── Team members ─────────────────────────────────────────────────────────────
create table if not exists team_members (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid references teams(id) on delete cascade not null,
  user_id     uuid references auth.users(id) on delete set null,
  email       text not null,
  role        text not null default 'member',  -- 'admin' | 'member'
  status      text not null default 'pending', -- 'pending' | 'active'
  invited_at  timestamptz default now(),
  joined_at   timestamptz
);
alter table team_members enable row level security;
create policy "Team owner manages members"
  on team_members for all using (
    team_id in (select id from teams where owner_id = auth.uid())
  );
create policy "Members can view their memberships"
  on team_members for select using (user_id = auth.uid());

-- Add cross-table policy now that team_members exists
create policy "Members can read their team"
  on teams for select using (
    id in (select team_id from team_members where user_id = auth.uid() and status = 'active')
  );

-- ── Session shares ───────────────────────────────────────────────────────────
create table if not exists session_shares (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null,
  user_id     uuid references auth.users(id) on delete cascade not null,
  token       text unique not null default encode(gen_random_bytes(24), 'hex'),
  snapshot    jsonb not null,
  created_at  timestamptz default now()
);
alter table session_shares enable row level security;
create policy "Owner manages shares"
  on session_shares for all using (user_id = auth.uid());
create policy "Public read by token"
  on session_shares for select using (true);
