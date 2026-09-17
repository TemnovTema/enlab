-- Run after 001_initial.sql. Static lessons are public; attempts are private.
create table public.practice_attempts (
 id uuid primary key,
 user_id uuid not null default auth.uid() references auth.users on delete cascade,
 test_id text not null,
 test_version integer not null,
 answers jsonb not null,
 result jsonb not null,
 completed_at timestamptz not null default now()
);
alter table public.practice_attempts enable row level security;
create policy own_attempts_read on public.practice_attempts for select to authenticated using(user_id=auth.uid());
create policy own_attempts_insert on public.practice_attempts for insert to authenticated with check(user_id=auth.uid());
create policy own_attempts_delete on public.practice_attempts for delete to authenticated using(user_id=auth.uid());
grant select,insert,delete on public.practice_attempts to authenticated;
revoke update on public.practice_attempts from authenticated;
create index practice_user_date on public.practice_attempts(user_id,completed_at desc);
