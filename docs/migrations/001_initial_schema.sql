-- ============================================================
-- Ariz Joias — Schema inicial
-- Executar no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/hiaohgussmvfdxcadgeg/sql/new
-- ============================================================

-- Perfis de usuário (estende auth.users do Supabase)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  cpf text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categorias de produtos
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Produtos
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  material text,
  price_cents integer not null,
  promotional_price_cents integer,
  stock integer not null default 0,
  weight_grams integer not null default 0,
  width_cm numeric(5,2) not null default 0,
  height_cm numeric(5,2) not null default 0,
  length_cm numeric(5,2) not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Imagens dos produtos (1:N)
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  alt_text text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Endereços do cliente
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  recipient_name text not null,
  zip_code text not null,
  street text not null,
  number text not null,
  complement text,
  district text not null,
  city text not null,
  state text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ── Triggers ────────────────────────────────────────────────────────

-- Atualiza updated_at automaticamente
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at_products
  before update on public.products
  for each row execute function public.handle_updated_at();

-- Cria profile automaticamente quando usuário é criado
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Row Level Security ───────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.categories enable row level security;
alter table public.addresses enable row level security;

-- Produtos e categorias: leitura pública
create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true);

create policy "Anyone can view product images"
  on public.product_images for select
  using (true);

create policy "Anyone can view categories"
  on public.categories for select
  using (true);

-- Profiles: usuário lê e edita o próprio
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Addresses: usuário gerencia os próprios
create policy "Users can manage own addresses"
  on public.addresses for all
  using (auth.uid() = profile_id);

-- Admin: acesso total via role no profile
create policy "Admins can manage products"
  on public.products for all
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  ));

create policy "Admins can manage product_images"
  on public.product_images for all
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  ));

create policy "Admins can manage categories"
  on public.categories for all
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  ));

-- ── Seed de teste ────────────────────────────────────────────────────

insert into public.categories (name, slug, description, display_order) values
  ('Colares', 'colares', 'Gargantilhas, chokers e longos', 1),
  ('Brincos', 'brincos', 'Argolas, pontos de luz e ear cuffs', 2),
  ('Anéis', 'aneis', 'Solitários, aparadores e alianças', 3),
  ('Pulseiras', 'pulseiras', 'Riviera, elos e braceletes', 4),
  ('Conjuntos', 'conjuntos', 'Sets presenteáveis completos', 5);
