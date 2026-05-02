-- ============================================================
-- Ariz Joias — Sprint 4: Função decrement_stock
-- Executar APÓS 003_orders_schema.sql
-- ============================================================

-- Decrementa estoque de forma segura (nunca abaixo de 0)
create or replace function public.decrement_stock(product_id uuid, amount integer)
returns void as $$
begin
  update public.products
  set stock = greatest(0, stock - amount)
  where id = product_id;
end;
$$ language plpgsql security definer;

-- Incrementa estoque (usado ao cancelar pedido pago)
create or replace function public.increment_stock(product_id uuid, amount integer)
returns void as $$
begin
  update public.products
  set stock = stock + amount
  where id = product_id;
end;
$$ language plpgsql security definer;
