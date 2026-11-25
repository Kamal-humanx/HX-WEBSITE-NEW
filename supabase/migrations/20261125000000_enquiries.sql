-- Website enquiries (contact form) and the small key-value table behind rate limits and
-- one-time form tokens. Row Level Security is on with no policies, so the public (anon) key
-- can read or write nothing: only the server, using the secret/service-role key, has access.

create table if not exists public.hx_inquiries (
  id          uuid primary key,
  created_at  timestamptz not null default now(),
  status      text not null check (status in ('new', 'flagged', 'spam')),
  full_name   text not null,
  contact     text not null default '',
  email       text not null,
  company     text not null,
  budget      text not null,
  message     text not null,
  reasons     jsonb not null default '[]'::jsonb,
  spam_score  integer not null default 0,
  country     text not null default '',
  notified    boolean not null default false
);
create index if not exists hx_inquiries_created_at_idx on public.hx_inquiries (created_at desc);
alter table public.hx_inquiries enable row level security;

create table if not exists public.hx_kv (
  key        text primary key,
  count      integer not null default 0,
  expires_at timestamptz not null
);
create index if not exists hx_kv_expires_at_idx on public.hx_kv (expires_at);
alter table public.hx_kv enable row level security;

-- Increment a counter that expires window_sec after its first hit; returns the new count.
create or replace function public.hx_incr_window(p_key text, p_window_sec integer)
returns integer
language plpgsql
set search_path = public
as $$
declare
  result integer;
begin
  delete from public.hx_kv where expires_at <= now() and key = p_key;
  insert into public.hx_kv as kv (key, count, expires_at)
  values (p_key, 1, now() + make_interval(secs => p_window_sec))
  on conflict (key) do update set count = kv.count + 1
  returning kv.count into result;
  -- Opportunistic clean-up of other expired keys, kept cheap.
  delete from public.hx_kv where key in (select key from public.hx_kv where expires_at <= now() limit 50);
  return result;
end;
$$;

-- Read a counter without incrementing it (0 when missing or expired).
create or replace function public.hx_peek_window(p_key text)
returns integer
language sql
stable
set search_path = public
as $$
  select coalesce((select count from public.hx_kv where key = p_key and expires_at > now()), 0);
$$;

-- True the first time a key is claimed within p_ttl_sec; false on any repeat.
create or replace function public.hx_claim_once(p_key text, p_ttl_sec integer)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  inserted integer;
begin
  delete from public.hx_kv where expires_at <= now() and key = p_key;
  insert into public.hx_kv (key, count, expires_at)
  values (p_key, 1, now() + make_interval(secs => p_ttl_sec))
  on conflict (key) do nothing;
  get diagnostics inserted = row_count;
  return inserted = 1;
end;
$$;

revoke all on function public.hx_incr_window(text, integer) from public, anon, authenticated;
revoke all on function public.hx_peek_window(text) from public, anon, authenticated;
revoke all on function public.hx_claim_once(text, integer) from public, anon, authenticated;
grant execute on function public.hx_incr_window(text, integer) to service_role;
grant execute on function public.hx_peek_window(text) to service_role;
grant execute on function public.hx_claim_once(text, integer) to service_role;
revoke all on table public.hx_inquiries, public.hx_kv from anon, authenticated;
