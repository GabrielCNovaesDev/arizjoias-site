-- ============================================================
-- Ariz Joias — Sprint 4: Schema de pedidos
-- Executar no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/hiaohgussmvfdxcadgeg/sql/new
-- ============================================================

-- Status possíveis de um pedido
create type order_status as enum (
  'pending_payment',  -- aguardando pagamento
  'paid',             -- pago e confirmado
  'preparing',        -- sendo separado/embalado
  'shipped',          -- enviado com código de rastreio
  'delivered',        -- entregue
  'cancelled',        -- cancelado
  'refunded'          -- estornado
);

-- Tabela de pedidos
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id),
  status order_status not null default 'pending_payment',

  -- Snapshot do endereço (preserva histórico mesmo se endereço for deletado)
  shipping_recipient_name text not null,
  shipping_zip_code text not null,
  shipping_street text not null,
  shipping_number text not null,
  shipping_complement text,
  shipping_district text not null,
  shipping_city text not null,
  shipping_state text not null,

  -- Frete escolhido
  shipping_method_name text not null,
  shipping_company text not null,
  shipping_price_cents integer not null,
  shipping_delivery_days integer not null,
  tracking_code text,

  -- Valores
  subtotal_cents integer not null,
  discount_cents integer not null default 0,
  total_cents integer not null,

  -- Mercado Pago
  mp_preference_id text,
  mp_payment_id text,
  payment_method text,
  payment_confirmed_at timestamptz,

  -- Cupom (Sprint 6)
  coupon_code text,

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Itens do pedido (snapshot no momento da compra)
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),  -- nullable: produto pode ser excluído depois

  product_name text not null,
  product_slug text not null,
  product_image_url text,
  unit_price_cents integer not null,
  quantity integer not null,
  subtotal_cents integer not null,

  created_at timestamptz not null default now()
);

-- Histórico de mudanças de status
create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  changed_by uuid references public.profiles(id),
  notes text,
  created_at timestamptz not null default now()
);

-- Trigger updated_at
create trigger set_updated_at_orders
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- Trigger para logar mudanças de status automaticamente
create or replace function public.log_order_status_change()
returns trigger as $$
begin
  if old.status is distinct from new.status then
    insert into public.order_status_history (order_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;
  return new;
end;
$$ language plpgsql;

create trigger order_status_change_log
  after update on public.orders
  for each row execute function public.log_order_status_change();

-- RLS
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

-- Cliente vê apenas os próprios pedidos
create policy "Customers see own orders"
  on public.orders for select
  using (auth.uid() = profile_id);

create policy "Customers see own order items"
  on public.order_items for select
  using (exists (
    select 1 from public.orders
    where orders.id = order_items.order_id and orders.profile_id = auth.uid()
  ));

-- Admin tem acesso total
create policy "Admins manage all orders"
  on public.orders for all
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  ));

create policy "Admins manage all order items"
  on public.order_items for all
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  ));

create policy "Admins view status history"
  on public.order_status_history for select
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  ));

-- Índices
create index idx_orders_profile on public.orders(profile_id, created_at desc);
create index idx_orders_status on public.orders(status);
create index idx_order_items_order on public.order_items(order_id);
create index idx_orders_mp_payment on public.orders(mp_payment_id);
