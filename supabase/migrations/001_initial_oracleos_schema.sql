-- OracleOS initial multi-practitioner schema
-- Safe foundation: tenant-scoped practitioners, services, slots, readings, profiles.
-- Run this in the dedicated OracleOS Supabase project.

create extension if not exists pgcrypto;

create type public.oracleos_member_role as enum ('owner', 'admin', 'reader');
create type public.oracleos_reading_status as enum ('pending_payment', 'booked', 'queue', 'reading', 'done', 'cancelled', 'no_show');
create type public.oracleos_payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  tiktok_handle text,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.practitioners (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  slug text not null unique,
  display_name text not null,
  bio text,
  tiktok_handle text,
  stripe_account_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.practitioner_members (
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.oracleos_member_role not null default 'reader',
  created_at timestamptz not null default now(),
  primary key (practitioner_id, user_id)
);

create table public.practitioner_services (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'usd',
  duration_minutes integer,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reading_slots (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  starts_at timestamptz,
  label text,
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.readings (
  id uuid primary key default gen_random_uuid(),
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  client_user_id uuid references auth.users(id) on delete set null,
  service_id uuid references public.practitioner_services(id) on delete set null,
  slot_id uuid references public.reading_slots(id) on delete set null,
  client_name text,
  client_email text,
  client_tiktok_handle text,
  question text,
  status public.oracleos_reading_status not null default 'pending_payment',
  payment_status public.oracleos_payment_status not null default 'pending',
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  amount_cents integer check (amount_cents is null or amount_cents >= 0),
  currency text not null default 'usd',
  queued_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reading_queue_events (
  id uuid primary key default gen_random_uuid(),
  reading_id uuid not null references public.readings(id) on delete cascade,
  practitioner_id uuid not null references public.practitioners(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  from_status public.oracleos_reading_status,
  to_status public.oracleos_reading_status not null,
  note text,
  created_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles(email);
create index practitioners_owner_user_id_idx on public.practitioners(owner_user_id);
create index practitioner_members_user_id_idx on public.practitioner_members(user_id);
create index practitioner_services_practitioner_id_idx on public.practitioner_services(practitioner_id);
create index reading_slots_practitioner_id_idx on public.reading_slots(practitioner_id);
create index readings_practitioner_status_idx on public.readings(practitioner_id, status);
create index readings_client_user_id_idx on public.readings(client_user_id);
create index reading_queue_events_reading_id_idx on public.reading_queue_events(reading_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger practitioners_set_updated_at
before update on public.practitioners
for each row execute function public.set_updated_at();

create trigger practitioner_services_set_updated_at
before update on public.practitioner_services
for each row execute function public.set_updated_at();

create trigger reading_slots_set_updated_at
before update on public.reading_slots
for each row execute function public.set_updated_at();

create trigger readings_set_updated_at
before update on public.readings
for each row execute function public.set_updated_at();

create or replace function public.is_practitioner_member(target_practitioner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.practitioner_members member
    where member.practitioner_id = target_practitioner_id
      and member.user_id = auth.uid()
  );
$$;

create or replace function public.is_practitioner_admin(target_practitioner_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.practitioner_members member
    where member.practitioner_id = target_practitioner_id
      and member.user_id = auth.uid()
      and member.role in ('owner', 'admin')
  );
$$;

alter table public.profiles enable row level security;
alter table public.practitioners enable row level security;
alter table public.practitioner_members enable row level security;
alter table public.practitioner_services enable row level security;
alter table public.reading_slots enable row level security;
alter table public.readings enable row level security;
alter table public.reading_queue_events enable row level security;

create policy "profiles_select_self"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles_insert_self"
  on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_update_self"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "practitioners_public_read_active"
  on public.practitioners for select
  using (is_active = true or public.is_practitioner_member(id));

create policy "practitioners_insert_owner"
  on public.practitioners for insert
  with check (owner_user_id = auth.uid());

create policy "practitioners_update_admin"
  on public.practitioners for update
  using (public.is_practitioner_admin(id))
  with check (public.is_practitioner_admin(id));

create policy "practitioner_members_read_own_practitioner"
  on public.practitioner_members for select
  using (public.is_practitioner_member(practitioner_id));

create policy "practitioner_members_manage_admin"
  on public.practitioner_members for all
  using (public.is_practitioner_admin(practitioner_id))
  with check (public.is_practitioner_admin(practitioner_id));

create policy "services_public_read_active"
  on public.practitioner_services for select
  using (is_active = true or public.is_practitioner_member(practitioner_id));

create policy "services_manage_admin"
  on public.practitioner_services for all
  using (public.is_practitioner_admin(practitioner_id))
  with check (public.is_practitioner_admin(practitioner_id));

create policy "slots_public_read_open"
  on public.reading_slots for select
  using (is_open = true or public.is_practitioner_member(practitioner_id));

create policy "slots_manage_admin"
  on public.reading_slots for all
  using (public.is_practitioner_admin(practitioner_id))
  with check (public.is_practitioner_admin(practitioner_id));

create policy "readings_read_client_or_practitioner"
  on public.readings for select
  using (client_user_id = auth.uid() or public.is_practitioner_member(practitioner_id));

create policy "readings_insert_client_or_practitioner"
  on public.readings for insert
  with check (client_user_id = auth.uid() or public.is_practitioner_member(practitioner_id));

create policy "readings_update_practitioner_admin"
  on public.readings for update
  using (public.is_practitioner_admin(practitioner_id))
  with check (public.is_practitioner_admin(practitioner_id));

create policy "queue_events_read_client_or_practitioner"
  on public.reading_queue_events for select
  using (
    public.is_practitioner_member(practitioner_id)
    or exists (
      select 1 from public.readings r
      where r.id = reading_id
        and r.client_user_id = auth.uid()
    )
  );

create policy "queue_events_insert_practitioner_admin"
  on public.reading_queue_events for insert
  with check (public.is_practitioner_admin(practitioner_id));
