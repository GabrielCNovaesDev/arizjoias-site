-- ============================================================
-- Ariz Joias — Sprint 2: Storage buckets, políticas e admin
-- Executar no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/hiaohgussmvfdxcadgeg/sql/new
-- ============================================================

-- ── 1. Criar buckets de Storage ─────────────────────────────
-- O Supabase permite criar buckets via SQL com a função storage.create_bucket

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'categories',
    'categories',
    true,
    2097152, -- 2MB
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'products',
    'products',
    true,
    5242880, -- 5MB
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do nothing;

-- ── 2. Políticas de Storage — bucket "categories" ───────────

-- Leitura pública
create policy "Public read categories"
  on storage.objects for select
  using (bucket_id = 'categories');

-- Upload apenas para admin
create policy "Admin upload categories"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'categories'
    and (
      select role from public.profiles where id = auth.uid()
    ) = 'admin'
  );

-- Update apenas para admin
create policy "Admin update categories"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'categories'
    and (
      select role from public.profiles where id = auth.uid()
    ) = 'admin'
  );

-- Delete apenas para admin
create policy "Admin delete categories"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'categories'
    and (
      select role from public.profiles where id = auth.uid()
    ) = 'admin'
  );

-- ── 3. Políticas de Storage — bucket "products" ─────────────

-- Leitura pública
create policy "Public read products"
  on storage.objects for select
  using (bucket_id = 'products');

-- Upload apenas para admin
create policy "Admin upload products"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'products'
    and (
      select role from public.profiles where id = auth.uid()
    ) = 'admin'
  );

-- Update apenas para admin
create policy "Admin update products"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'products'
    and (
      select role from public.profiles where id = auth.uid()
    ) = 'admin'
  );

-- Delete apenas para admin
create policy "Admin delete products"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'products'
    and (
      select role from public.profiles where id = auth.uid()
    ) = 'admin'
  );

-- ── 4. Política extra: admin lê todos os produtos (ativos e inativos) ──
-- A migration 001 criou "Anyone can view active products" (is_active = true)
-- e "Admins can manage products" (all). O SELECT do admin já está coberto
-- pela política "Admins can manage products", então nada a adicionar.

-- ── 5. Tornar um usuário admin ───────────────────────────────
-- Substitua o e-mail abaixo pelo e-mail da conta que deve ser admin.
-- Execute esta parte separadamente após criar a conta em /cadastro.

-- update public.profiles
-- set role = 'admin'
-- where id = (
--   select id from auth.users where email = 'SEU_EMAIL_AQUI'
-- );
