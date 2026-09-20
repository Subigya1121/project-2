-- ============================================================
-- LX ARENA — DATABASE SCHEMA
-- Run this once in Supabase: SQL Editor > New query > paste > Run
--
-- Courts, night matches, and membership plans stay defined in the
-- site's config.js (they're catalog data, not user submissions).
-- These tables capture what VISITORS submit: bookings, match
-- join requests, opponent listings, membership sign-ups, and
-- contact messages.
-- ============================================================

-- COURT BOOKINGS
create table court_bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  court_name text not null,           -- snapshot, e.g. "Court 1"
  booking_date date not null,
  time_slot text not null,            -- e.g. "18:00 – 19:00"
  duration_hours integer not null check (duration_hours between 1 and 4),
  number_of_players integer,
  special_request text,
  total_price integer,
  status text not null default 'pending'
    check (status in ('pending','confirmed','cancelled','completed','no_show')),
  confirmation_code text not null,
  created_at timestamptz not null default now()
);

-- NIGHT MATCH JOIN REQUESTS
create table night_match_joins (
  id uuid primary key default gen_random_uuid(),
  match_title text not null,          -- snapshot, e.g. "Friday Night Match"
  player_name text not null,
  phone text not null,
  joining_mode text not null check (joining_mode in ('solo','team')),
  status text not null default 'pending'
    check (status in ('pending','confirmed','cancelled')),
  created_at timestamptz not null default now()
);

-- OPPONENT REQUESTS
-- captain_name and phone are private — never exposed to the public.
-- Visitors browsing "Find an Opponent" only ever see the public VIEW below.
create table opponent_requests (
  id uuid primary key default gen_random_uuid(),
  team_name text not null,
  captain_name text not null,
  phone text not null,
  preferred_date date not null,
  preferred_time text,
  skill_level text,
  player_count integer,
  message text,
  status text not null default 'open'
    check (status in ('open','match_found','expired','cancelled')),
  created_at timestamptz not null default now()
);

-- GYM MEMBERSHIP REQUESTS
create table gym_membership_requests (
  id uuid primary key default gen_random_uuid(),
  plan_name text not null,            -- snapshot, e.g. "Quarterly"
  plan_price integer,
  full_name text not null,
  phone text not null,
  email text not null,
  start_date date not null,
  status text not null default 'pending'
    check (status in ('pending','active','paused','cancelled','expired')),
  created_at timestamptz not null default now()
);

-- CONTACT MESSAGES
create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Visitors (anon) can only INSERT their own submissions.
-- Only a logged-in admin (authenticated) can view or update them.
-- ============================================================

alter table court_bookings enable row level security;
alter table night_match_joins enable row level security;
alter table opponent_requests enable row level security;
alter table gym_membership_requests enable row level security;
alter table contact_messages enable row level security;

-- Court bookings
create policy "Public can submit bookings" on court_bookings
  for insert to anon with check (true);
create policy "Admin can view bookings" on court_bookings
  for select to authenticated using (true);
create policy "Admin can update bookings" on court_bookings
  for update to authenticated using (true);

-- Night match joins
create policy "Public can submit match joins" on night_match_joins
  for insert to anon with check (true);
create policy "Admin can view match joins" on night_match_joins
  for select to authenticated using (true);
create policy "Admin can update match joins" on night_match_joins
  for update to authenticated using (true);

-- Opponent requests (base table — full data, admin-only read)
create policy "Public can submit opponent requests" on opponent_requests
  for insert to anon with check (true);
create policy "Admin can view opponent requests" on opponent_requests
  for select to authenticated using (true);
create policy "Admin can update opponent requests" on opponent_requests
  for update to authenticated using (true);

-- Gym membership requests
create policy "Public can submit membership requests" on gym_membership_requests
  for insert to anon with check (true);
create policy "Admin can view membership requests" on gym_membership_requests
  for select to authenticated using (true);
create policy "Admin can update membership requests" on gym_membership_requests
  for update to authenticated using (true);

-- Contact messages
create policy "Public can submit messages" on contact_messages
  for insert to anon with check (true);
create policy "Admin can view messages" on contact_messages
  for select to authenticated using (true);

-- ============================================================
-- PUBLIC OPPONENT LISTING VIEW
-- Exposes only safe, non-identifying fields for the "Find an
-- Opponent" board. This view is owned by the table creator, so
-- it can read opponent_requests even though anon's own RLS
-- policy on the base table blocks direct SELECT — the view is
-- the only public window into that data, and it deliberately
-- excludes captain_name and phone.
-- ============================================================

create view opponent_requests_public as
  select
    id,
    team_name,
    preferred_date,
    preferred_time,
    skill_level,
    player_count,
    message,
    status,
    created_at
  from opponent_requests
  where status = 'open';

grant select on opponent_requests_public to anon, authenticated;
