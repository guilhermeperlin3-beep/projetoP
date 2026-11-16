-- PatrocinaAê: schema inicial para Supabase
create extension if not exists pgcrypto;

create table if not exists public.events (
  id text primary key,
  name text not null,
  event_date date not null,
  venue text not null,
  fundraising_goal numeric(12,2) not null default 0,
  amount_raised numeric(12,2) not null default 0,
  status text not null default 'Planejamento' check (status in ('Planejamento','Captação','Realizado')),
  created_at timestamptz not null default now()
);

create table if not exists public.sponsors (
  id text primary key,
  name text not null,
  contact_name text not null,
  email text,
  segment text,
  proposed_value numeric(12,2) not null default 0,
  status text not null default 'Prospect' check (status in ('Prospect','Em negociação','Confirmado')),
  event_id text references public.events(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.sponsorship_tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2) not null default 0,
  benefits jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  event_id text references public.events(id) on delete cascade,
  sponsor_id text references public.sponsors(id) on delete cascade,
  tier_id uuid references public.sponsorship_tiers(id) on delete set null,
  title text not null,
  amount numeric(12,2) not null default 0,
  status text not null default 'Rascunho' check (status in ('Rascunho','Enviada','Aceita','Recusada')),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  sponsor_id text references public.sponsors(id) on delete cascade,
  event_id text references public.events(id) on delete cascade,
  activity_type text not null,
  description text not null,
  due_date date,
  created_at timestamptz not null default now()
);

-- Para produção: habilite RLS e crie políticas por organização/usuário autenticado.
-- Não deixe tabelas públicas sem políticas em um projeto real.
alter table public.events enable row level security;
alter table public.sponsors enable row level security;
alter table public.sponsorship_tiers enable row level security;
alter table public.proposals enable row level security;
alter table public.activities enable row level security;

-- Políticas de desenvolvimento para acesso via chave anon. Substitua por políticas
-- baseadas em auth.uid() antes de colocar a aplicação em produção.
create policy "dev events all" on public.events for all to anon, authenticated using (true) with check (true);
create policy "dev sponsors all" on public.sponsors for all to anon, authenticated using (true) with check (true);
create policy "dev tiers all" on public.sponsorship_tiers for all to anon, authenticated using (true) with check (true);
create policy "dev proposals all" on public.proposals for all to anon, authenticated using (true) with check (true);
create policy "dev activities all" on public.activities for all to anon, authenticated using (true) with check (true);
