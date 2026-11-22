-- ERMap initial schema. Apply only to a NEW Supabase project.
-- Review Supabase/PostGIS availability and project region before applying.

create extension if not exists postgis with schema extensions;

do $$ begin
  create type public.ed_status as enum ('confirmed_24x7', 'confirmed_limited', 'unconfirmed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.capability_level as enum ('basic', 'multi_specialty', 'advanced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.care_type as enum ('rehab_centre', 'senior_care', 'home_care');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.ownership_type as enum ('government', 'private', 'trust_charitable');
exception when duplicate_object then null; end $$;

create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  osm_id text unique,
  location extensions.geography(point, 4326) not null,
  address text,
  area text,
  ed_phone text,
  ownership public.ownership_type,
  website text,
  ed_status public.ed_status not null default 'unconfirmed',
  capability public.capability_level,
  has_trauma boolean,
  has_icu boolean,
  has_ct boolean,
  has_mri boolean,
  has_cath_lab boolean,
  has_stroke_unit boolean,
  has_paediatric_er boolean,
  has_maternity boolean,
  cost_band smallint check (cost_band between 1 and 3),
  er_beds_reported integer check (er_beds_reported is null or er_beds_reported >= 0),
  er_beds_as_of date,
  icu_beds_reported integer check (icu_beds_reported is null or icu_beds_reported >= 0),
  ccu_beds_reported integer check (ccu_beds_reported is null or ccu_beds_reported >= 0),
  total_beds_reported integer check (total_beds_reported is null or total_beds_reported >= 0),
  accepts_schemes text[],
  source text not null,
  last_verified date,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  constraint er_beds_date_pair check (
    (er_beds_reported is null and er_beds_as_of is null)
    or (er_beds_reported is not null and er_beds_as_of is not null)
  )
);

create index if not exists hospitals_location_gix
  on public.hospitals using gist (location);

create table if not exists public.ambulance_operators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  kind text check (kind in ('government', 'private')),
  vehicle_types text[],
  coverage_areas text[],
  available_24x7 boolean,
  source text not null,
  last_verified date,
  is_sample boolean not null default false
);

create table if not exists public.care_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.care_type not null,
  location extensions.geography(point, 4326),
  area text,
  phone text,
  stay_options jsonb,
  nursing_cover text,
  physio boolean,
  post_surgery_suitable text[],
  price_band smallint check (price_band between 1 and 3),
  source text not null,
  last_verified date,
  is_sample boolean not null default false
);

create index if not exists care_providers_location_gix
  on public.care_providers using gist (location);

create table if not exists public.family_reports (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.care_providers(id) on delete cascade,
  stay_date date,
  summary text not null check (char_length(summary) <= 3000),
  moderated boolean not null default false,
  consent_to_publish boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.verification_log (
  id uuid primary key default gen_random_uuid(),
  entity_table text not null,
  entity_id uuid not null,
  field text not null,
  old_value text,
  new_value text,
  method text,
  verified_by text,
  verified_at timestamptz not null default now()
);

create table if not exists public.er_experience_signals (
  hospital_id uuid primary key references public.hospitals(id) on delete cascade,
  source text not null,
  er_review_count integer check (er_review_count is null or er_review_count >= 0),
  er_avg_rating numeric(2,1) check (er_avg_rating is null or er_avg_rating between 1 and 5),
  caring_staff_pct numeric(4,1) check (caring_staff_pct is null or caring_staff_pct between 0 and 100),
  computed_at timestamptz not null default now()
);

create or replace function public.nearby_hospitals(lat double precision, lng double precision, radius_m integer default 8000)
returns table (id uuid, name text, distance_m double precision, ed_phone text, ed_status public.ed_status)
language sql
stable
set search_path = ''
as $$
  select h.id, h.name,
         extensions.st_distance(h.location, extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography) as distance_m,
         h.ed_phone, h.ed_status
  from public.hospitals h
  where extensions.st_dwithin(
    h.location,
    extensions.st_setsrid(extensions.st_makepoint(lng, lat), 4326)::extensions.geography,
    greatest(radius_m, 0)
  )
  order by distance_m;
$$;

-- Public can read published directory records. Writes are reserved for trusted server/admin workflows.
alter table public.hospitals enable row level security;
alter table public.ambulance_operators enable row level security;
alter table public.care_providers enable row level security;
alter table public.family_reports enable row level security;
alter table public.verification_log enable row level security;
alter table public.er_experience_signals enable row level security;

drop policy if exists "public read hospitals" on public.hospitals;
create policy "public read hospitals" on public.hospitals
  for select to anon, authenticated using (is_sample = true or last_verified is not null);

drop policy if exists "public read ambulance operators" on public.ambulance_operators;
create policy "public read ambulance operators" on public.ambulance_operators
  for select to anon, authenticated using (is_sample = true or last_verified is not null);

drop policy if exists "public read care providers" on public.care_providers;
create policy "public read care providers" on public.care_providers
  for select to anon, authenticated using (is_sample = true or last_verified is not null);

drop policy if exists "public read ER experience signals" on public.er_experience_signals;
create policy "public read ER experience signals" on public.er_experience_signals
  for select to anon, authenticated using (true);

-- family_reports and verification_log intentionally have no public policies.
-- They are not publicly readable/writable. Add narrow authenticated/admin policies
-- only after an auth and moderation model has been designed.

revoke all on function public.nearby_hospitals(double precision, double precision, integer) from public;
grant execute on function public.nearby_hospitals(double precision, double precision, integer) to anon, authenticated;
