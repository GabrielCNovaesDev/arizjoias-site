# Sprint 6 — Promoções, cupons e lista de desejos

> **Duração:** Semanas 11–12
> **Objetivo:** Ferramentas de marketing para a Ariz: cupons de desconto, frete grátis condicional, preço promocional por produto, favoritos do cliente.
> **Entregável ao final:** A Ariz cria cupons no painel e divulga no Instagram. Clientes salvam favoritos e voltam para comprar.

---

## Contexto para a IA

Pós-MVP, esta sprint adiciona alavancas de marketing que a Ariz vai usar no dia a dia. Cupom para campanhas, preço promocional para queima de estoque, frete grátis para aumentar ticket médio, favoritos para gerar retorno.

**Pré-requisito:** MVP no ar (Sprint 5 concluída) e funcionando há pelo menos 1 semana.

---

## Tarefas

### TASK-6.1 — Schema de cupons

**Tipo:** Modelagem de dados

#### O que fazer

Migration `004_coupons_schema.sql`:

```sql
create type discount_type as enum ('percentage', 'fixed');

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,                          -- ex: "NATAL20"
  description text,
  discount_type discount_type not null,
  discount_value integer not null,                    -- 20 (% ) ou 2000 (centavos)
  min_purchase_cents integer,                         -- valor mínimo do carrinho
  max_uses integer,                                   -- null = ilimitado
  uses_count integer not null default 0,
  max_uses_per_user integer not null default 1,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,                            -- null = sem expiração
  is_active boolean not null default true,
  applies_to_shipping boolean not null default false, -- se true, desconta frete em vez de subtotal
  created_at timestamptz not null default now()
);

-- Histórico de uso
create table public.coupon_uses (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id),
  order_id uuid not null references public.orders(id),
  profile_id uuid not null references public.profiles(id),
  discount_applied_cents integer not null,
  created_at timestamptz not null default now()
);

create index idx_coupon_uses_user on public.coupon_uses(profile_id, coupon_id);

-- RLS
alter table public.coupons enable row level security;
alter table public.coupon_uses enable row level security;

create policy "Anyone can validate active coupons"
  on public.coupons for select
  using (is_active = true);

create policy "Admins manage coupons"
  on public.coupons for all
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Admins view all coupon uses"
  on public.coupon_uses for select
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

create policy "Users see own coupon uses"
  on public.coupon_uses for select
  using (auth.uid() = profile_id);
```

Adicionar coluna em `orders` (já existe `coupon_code`, agora adicionar referência):
```sql
alter table public.orders
  add column coupon_id uuid references public.coupons(id),
  add column coupon_discount_cents integer not null default 0;
```

#### Definição de pronto

- Tabelas criadas
- Tipos regenerados
- Migration salva

---

### TASK-6.2 — CRUD de cupons no admin

**Tipo:** Implementação

#### O que fazer

1. Criar `app/admin/promocoes/page.tsx`:
   - Tabela de cupons com: código, tipo, valor, validade, usos (atuais/máx), status, ações
   - Filtros: ativos, expirados, sem uso
   - Botão "Novo cupom"

2. Criar `app/admin/promocoes/novo/page.tsx`:
   - Formulário com campos:
     - Código (auto-uppercase, sem espaços)
     - Descrição interna
     - Tipo de desconto: percentual ou valor fixo (R$)
     - Valor do desconto
     - Valor mínimo de compra (opcional)
     - Limite total de usos (opcional)
     - Limite por cliente (default 1)
     - Validade: data inicial e final
     - Aplica a frete? (checkbox)
     - Ativo (checkbox)

3. Criar `app/admin/promocoes/[id]/page.tsx`:
   - Edição
   - Aba "Histórico de uso": lista de pedidos que usaram o cupom
   - Estatísticas: total de descontos concedidos, número de usos, ticket médio dos pedidos com cupom

#### Definição de pronto

- Criar, editar, desativar cupons funciona
- Códigos duplicados retornam erro
- Histórico de uso visível
- Validações: data final > data inicial, valor > 0

---

### TASK-6.3 — Validação de cupom no checkout

**Tipo:** Integração

#### O que fazer

1. Criar `app/api/coupons/validate/route.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Não autenticado" }, { status: 401 });

  const { code, subtotalCents } = await request.json();

  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (!coupon) {
    return Response.json({ error: "Cupom inválido" }, { status: 404 });
  }

  // Validações
  const now = new Date();
  if (coupon.valid_until && new Date(coupon.valid_until) < now) {
    return Response.json({ error: "Cupom expirado" }, { status: 400 });
  }
  if (new Date(coupon.valid_from) > now) {
    return Response.json({ error: "Cupom ainda não está ativo" }, { status: 400 });
  }
  if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
    return Response.json({ error: "Cupom esgotado" }, { status: 400 });
  }
  if (coupon.min_purchase_cents && subtotalCents < coupon.min_purchase_cents) {
    return Response.json({
      error: `Valor mínimo: R$ ${(coupon.min_purchase_cents / 100).toFixed(2)}`
    }, { status: 400 });
  }

  // Verificar uso por usuário
  const { count: userUses } = await supabase
    .from("coupon_uses")
    .select("*", { count: "exact", head: true })
    .eq("coupon_id", coupon.id)
    .eq("profile_id", user.id);

  if (userUses && userUses >= coupon.max_uses_per_user) {
    return Response.json({ error: "Você já usou este cupom" }, { status: 400 });
  }

  // Calcular desconto
  let discountCents = 0;
  if (coupon.discount_type === "percentage") {
    discountCents = Math.round((subtotalCents * coupon.discount_value) / 100);
  } else {
    discountCents = coupon.discount_value;
  }

  return Response.json({
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountCents,
      appliesToShipping: coupon.applies_to_shipping,
    }
  });
}
```

2. Adicionar campo de cupom no carrinho e no checkout:
   - Input "Tem um cupom?" com botão "Aplicar"
   - Após aplicar com sucesso, mostrar desconto e valor original riscado
   - Botão para remover cupom
   - Cupom persiste no Zustand junto com o carrinho

3. Atualizar criação de preferência (TASK-4.3) para incluir desconto:
   - Aplicar desconto antes de calcular total
   - Salvar `coupon_id` e `coupon_discount_cents` no pedido
   - Após pagamento aprovado, no webhook, registrar uso em `coupon_uses` e incrementar `uses_count`

#### Definição de pronto

- Aplicar cupom válido reduz o total
- Mensagens de erro claras para cada caso (expirado, esgotado, mínimo, já usado)
- Após pagamento, uso é registrado
- Tentativa de usar mesmo cupom além do limite é bloqueada

---

### TASK-6.4 — Frete grátis condicional

**Tipo:** Implementação

#### O que fazer

1. Adicionar configuração no admin:
   - Página `app/admin/configuracoes/frete-gratis/page.tsx`
   - Campos: valor mínimo do pedido para frete grátis, ativo (sim/não)
   - Salvar em uma nova tabela `store_settings`:
```sql
create table public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.store_settings (key, value) values
  ('free_shipping', '{"enabled": false, "min_purchase_cents": 30000}'::jsonb);
```

2. Atualizar lógica do carrinho:
   - Após calcular frete, verificar se subtotal >= mínimo configurado
   - Se sim, mostrar opções de frete normalmente, mas com `priceCents: 0` na opção mais barata
   - Mostrar banner: "🎉 Você ganhou frete grátis!"
   - Se subtotal próximo do mínimo (90%): mostrar incentivo: "Adicione mais R$ X para ganhar frete grátis"

#### Definição de pronto

- Ariz consegue ativar/desativar e configurar valor mínimo
- Frete fica zerado quando atinge o mínimo
- Incentivo de "faltam X reais" aparece quando perto do mínimo
- Configuração refletida imediatamente após salvar

---

### TASK-6.5 — Lista de desejos (favoritos)

**Tipo:** Implementação

#### O que fazer

1. Migration `005_wishlist_schema.sql`:
```sql
create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (profile_id, product_id)
);

alter table public.wishlist_items enable row level security;

create policy "Users manage own wishlist"
  on public.wishlist_items for all
  using (auth.uid() = profile_id);

create index idx_wishlist_user on public.wishlist_items(profile_id, created_at desc);
```

2. Criar `app/api/wishlist/toggle/route.ts`:
   - POST com `productId` no body
   - Se já existe, remove. Se não existe, adiciona.
   - Retorna estado atual

3. Criar componente `components/shop/wishlist-button.tsx`:
   - Ícone de coração (vazio/preenchido)
   - Click toggle
   - Se não logado, abre modal "Faça login para favoritar"
   - Otimista: atualiza visualmente antes da resposta da API

4. Adicionar o botão em:
   - `product-card.tsx` (canto superior direito da imagem)
   - Página de produto individual (ao lado do botão "Adicionar ao carrinho")

5. Criar `app/conta/favoritos/page.tsx`:
   - Lista de produtos favoritos
   - Botão "Adicionar ao carrinho" em cada item
   - Botão "Remover dos favoritos"
   - Estado vazio

#### Definição de pronto

- Toggle de favorito funciona em produtos
- Lista de favoritos no perfil
- Não-logados são convidados a fazer login
- Performance OK mesmo com muitos favoritos (paginação se > 50)

---

### TASK-6.6 — Banner de cupom de boas-vindas

**Tipo:** Implementação

#### O que fazer

1. Criar cupom de boas-vindas via admin (manualmente):
   - Código: `BEMVINDA10`
   - 10% off, máx 1 uso por cliente, sem expiração

2. Atualizar e-mail de boas-vindas (TASK-5.2) para incluir o cupom:
   - "Use o código BEMVINDA10 e ganhe 10% na sua primeira compra"

3. Criar banner no topo do site para visitantes não-logados:
   - "Cadastre-se e ganhe 10% off na primeira compra! [Cadastrar]"
   - Pode ser fechado (cookie de 7 dias)

#### Definição de pronto

- Cupom de boas-vindas funcional
- Banner aparece para não-logados
- E-mail de boas-vindas inclui o código

---

## Checklist de conclusão da sprint

- [ ] Cupons criados e aplicados no checkout
- [ ] Frete grátis condicional funcionando
- [ ] Lista de favoritos persistente
- [ ] Cupom de boas-vindas no e-mail e banner
- [ ] Histórico de uso de cupons no admin
- [ ] Mensagens de erro claras em todos os fluxos

---

## Dependências e ordem

```
6.1 (schema cupons) ─→ 6.2 (CRUD admin) ─→ 6.3 (validação checkout)
                                                  ↓
6.4 (frete grátis) ←──────────────────────────────┘
6.5 (favoritos) ─── (independente)
6.6 (boas-vindas) ── (depende de 6.3)
```

---

## Notas técnicas

- **Cupom + promocional:** se o produto já tem `promotional_price_cents`, o cupom aplica em cima do preço promocional. Considerar bloquear cumulatividade no admin (campo "não combinável").
- **Concorrência em cupons únicos:** dois usuários tentando usar o último cupom ao mesmo tempo. Usar lock otimista no incremento de `uses_count`.
- **Cupom de frete:** zera apenas o frete, não o subtotal.
- **Favoritos sem login:** considerar persistir em localStorage também, mesclar com banco no login (similar ao carrinho).
