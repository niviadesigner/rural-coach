-- ============================================================
-- RURAL COACH — Esquema Supabase (Postgres)
-- RLS activo: cada usuario solo ve lo suyo.
-- Ejecutar en Supabase → SQL Editor, o con la CLI:
--   supabase db push
-- ============================================================

-- ---------- Extensiones ----------
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  peso_kg numeric,
  nivel text check (nivel in ('principiante','intermedio','avanzado')) default 'intermedio',
  dias_disponibles int[] default '{2,4,6}',
  horas_semana numeric default 6,
  tiene_potenciometro boolean default false,
  tiene_pulsometro boolean default false,
  ftp_watts int,
  fc_umbral int,
  fc_max int,
  km_tipicos_salida numeric,
  lesiones text,
  created_at timestamptz default now()
);

-- ============================================================
-- STRAVA ACCOUNTS
-- ============================================================
create table if not exists public.strava_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  athlete_id bigint unique not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  scopes text,
  created_at timestamptz default now()
);
create index if not exists idx_strava_athlete on public.strava_accounts(athlete_id);

-- ============================================================
-- EVENTS (catálogo público de eventos)
-- ============================================================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  es_rural_cycle boolean default true,
  fecha date not null,
  ciudad text,
  distancia_km numeric,
  desnivel_m int,
  pct_gravel int check (pct_gravel between 0 and 100),
  dificultad int check (dificultad between 1 and 5),
  descripcion text,
  imagen_url text,
  created_at timestamptz default now()
);

-- ============================================================
-- ACTIVITIES (desde Strava)
-- ============================================================
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  strava_id bigint unique,
  fecha date,
  tipo text,
  distancia_km numeric,
  desnivel_m int,
  duracion_s int,
  potencia_media numeric,
  potencia_normalizada numeric,
  mejor_20min_w numeric,
  fc_media numeric,
  fc_max numeric,
  tss numeric,
  superficie text check (superficie in ('gravel','ruta','mixto')) default 'mixto',
  sincronizado_at timestamptz default now()
);
create index if not exists idx_activities_user on public.activities(user_id, fecha desc);

-- ============================================================
-- TRAINING PLANS
-- ============================================================
create table if not exists public.training_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  tipo text check (tipo in ('evento','mensual','3m','6m')) default 'evento',
  fecha_inicio date,
  fecha_evento date,
  semanas_totales int,
  estado text check (estado in ('prueba','activo','finalizado')) default 'prueba',
  ftp_base int,
  fc_umbral_base int,
  created_at timestamptz default now()
);
create index if not exists idx_plans_user on public.training_plans(user_id);

-- ============================================================
-- PLAN PHASES
-- ============================================================
create table if not exists public.plan_phases (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.training_plans(id) on delete cascade,
  fase text check (fase in ('base','construccion','especifico','tapering')),
  sem_inicio int,
  sem_fin int
);

-- ============================================================
-- WORKOUTS
-- ============================================================
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.training_plans(id) on delete cascade,
  semana int,
  dia int check (dia between 0 and 6),
  nombre text,
  tipo text check (tipo in ('fondo','tempo','umbral','vo2','tecnica_gravel','fuerza','descanso')),
  duracion_min int,
  estructura_intervalos jsonb,
  tss_objetivo int,
  descripcion text,
  es_semana_prueba boolean default false,
  superficie text check (superficie in ('gravel','ruta','mixto')) default 'mixto'
);
create index if not exists idx_workouts_plan on public.workouts(plan_id, semana, dia);

-- ============================================================
-- WORKOUT COMPLETIONS
-- ============================================================
create table if not exists public.workout_completions (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid references public.workouts(id) on delete cascade,
  activity_id uuid references public.activities(id) on delete set null,
  cumplimiento_pct numeric,
  notas text,
  created_at timestamptz default now()
);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
create table if not exists public.subscriptions (
  id text primary key, -- usamos la referencia de pago Wompi como id
  user_id uuid references auth.users(id) on delete cascade,
  plan_id uuid references public.training_plans(id) on delete set null,
  tipo text,
  monto_cop int,
  gateway text default 'wompi',
  estado text check (estado in ('pendiente','activo','cancelado','vencido')) default 'pendiente',
  es_prueba boolean default true,
  prueba_termina_at timestamptz,
  codigo_descuento text,
  created_at timestamptz default now()
);
create index if not exists idx_subs_user on public.subscriptions(user_id);

-- ============================================================
-- DISCOUNT CODES
-- ============================================================
create table if not exists public.discount_codes (
  id uuid primary key default gen_random_uuid(),
  codigo text unique not null,
  event_id uuid references public.events(id) on delete cascade,
  descuento_pct int check (descuento_pct between 0 and 100),
  valido_hasta date,
  usos_max int,
  usos_actuales int default 0
);

-- ============================================================
-- METRICS SNAPSHOTS (forma física — Fase 2)
-- ============================================================
create table if not exists public.metrics_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  fecha date,
  ftp_estimado int,
  ctl numeric,
  atl numeric,
  tsb numeric
);
create index if not exists idx_metrics_user on public.metrics_snapshots(user_id, fecha desc);

-- ============================================================
-- RLS — cada usuario solo ve/edita lo suyo
-- ============================================================
alter table public.profiles enable row level security;
alter table public.strava_accounts enable row level security;
alter table public.activities enable row level security;
alter table public.training_plans enable row level security;
alter table public.plan_phases enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_completions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.metrics_snapshots enable row level security;
alter table public.events enable row level security;
alter table public.discount_codes enable row level security;

-- Helper: políticas "propietario" por user_id
do $$
declare t text;
begin
  foreach t in array array['profiles','strava_accounts','activities','training_plans','subscriptions','metrics_snapshots']
  loop
    execute format($f$
      drop policy if exists "own_select" on public.%I;
      create policy "own_select" on public.%I for select using (auth.uid() = user_id);
      drop policy if exists "own_insert" on public.%I;
      create policy "own_insert" on public.%I for insert with check (auth.uid() = user_id);
      drop policy if exists "own_update" on public.%I;
      create policy "own_update" on public.%I for update using (auth.uid() = user_id);
      drop policy if exists "own_delete" on public.%I;
      create policy "own_delete" on public.%I for delete using (auth.uid() = user_id);
    $f$, t, t, t, t, t, t, t, t);
  end loop;
end $$;

-- profiles usa columna id (no user_id): política aparte
drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

-- plan_phases / workouts / workout_completions: acceso vía el plan del usuario
drop policy if exists "phases_own" on public.plan_phases;
create policy "phases_own" on public.plan_phases for all using (
  exists (select 1 from public.training_plans p where p.id = plan_id and p.user_id = auth.uid())
);
drop policy if exists "workouts_own" on public.workouts;
create policy "workouts_own" on public.workouts for all using (
  exists (select 1 from public.training_plans p where p.id = plan_id and p.user_id = auth.uid())
);
drop policy if exists "completions_own" on public.workout_completions;
create policy "completions_own" on public.workout_completions for all using (
  exists (
    select 1 from public.workouts w
    join public.training_plans p on p.id = w.plan_id
    where w.id = workout_id and p.user_id = auth.uid()
  )
);

-- events y discount_codes: lectura pública, escritura solo service_role
drop policy if exists "events_read" on public.events;
create policy "events_read" on public.events for select using (true);
drop policy if exists "codes_read" on public.discount_codes;
create policy "codes_read" on public.discount_codes for select using (true);

-- Crear profile automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, nombre) values (new.id, new.raw_user_meta_data->>'name')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
