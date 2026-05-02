# Sprint 4 — Pagamento Mercado Pago e sistema de pedidos

> **Duração:** Semanas 7–8
> **Objetivo:** Integrar Mercado Pago (PIX, cartão, boleto), criar pedido após pagamento confirmado, baixar estoque, gerenciar pedidos no admin.
> **Entregável ao final:** Cliente compra de verdade com PIX ou cartão. Pedido é criado no banco. Ariz vê pedidos no painel admin e pode atualizar status.

---

## Contexto para a IA

Esta sprint transforma o site numa loja de verdade. É a sprint mais sensível porque envolve dinheiro real e estado consistente entre Mercado Pago e o banco.

**Princípio crítico:** o pedido só é criado **depois** da confirmação do pagamento via webhook. Não criar pedido antes, não baixar estoque antes. Se o cliente abandona o pagamento, nada acontece no nosso lado.

**Pré-requisito:** Sprints 1–3 100% concluídas. Conta no Mercado Pago Developers criada com app configurado.

---

## Tarefas

### TASK-4.1 — Configuração da conta Mercado Pago

**Tipo:** Setup de infraestrutura

#### O que fazer

1. Criar conta em [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers).
2. Criar uma "Aplicação" no painel — nome "Ariz Joias".
3. Copiar credenciais:
   - **Access Token (produção)** — `MERCADO_PAGO_ACCESS_TOKEN`
   - **Public Key (produção)** — `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY`
   - **Access Token (teste)** — `MERCADO_PAGO_ACCESS_TOKEN_TEST` (usar durante desenvolvimento)
4. Configurar URL de webhook (será preenchida na TASK-4.4):
   - Em produção: `https://arizjoias.com.br/api/webhooks/mercadopago`
   - Em desenvolvimento, usar [ngrok](https://ngrok.com) para expor `localhost:3000` na internet
5. Habilitar notificações para o evento `payment`.

6. Adicionar SDK ao projeto:
```bash
npm install mercadopago
```

7. Criar `lib/mercadopago/client.ts`:
```typescript
import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

const isProduction = process.env.NODE_ENV === "production";

export const mpClient = new MercadoPagoConfig({
  accessToken: isProduction
    ? process.env.MERCADO_PAGO_ACCESS_TOKEN!
    : process.env.MERCADO_PAGO_ACCESS_TOKEN_TEST!,
  options: { timeout: 5000 },
});

export const mpPreference = new Preference(mpClient);
export const mpPayment = new Payment(mpClient);
```

#### Definição de pronto

- Conta criada e app configurado
- Variáveis de ambiente preenchidas (teste e produção)
- Cliente SDK importável
- Webhook URL temporária via ngrok funcionando localmente

---

### TASK-4.2 — Schema de pedidos no banco

**Tipo:** Modelagem de dados

#### O que fazer

Executar SQL e salvar em `docs/migrations/002_orders_schema.sql`:

```sql
-- Status possíveis de um pedido
create type order_status as enum (
  'pending_payment',  -- aguardando pagamento (PIX gerado, cartão sendo processado)
  'paid',             -- pago e confirmado
  'preparing',        -- sendo separado/embalado pela Ariz
  'shipped',          -- enviado (Ariz colocou código de rastreio)
  'delivered',        -- entregue
  'cancelled',        -- cancelado
  'refunded'          -- estornado
);

-- Tabela de pedidos
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id),
  status order_status not null default 'pending_payment',

  -- Snapshot do endereço (não referencia addresses para preservar histórico)
  shipping_recipient_name text not null,
  shipping_zip_code text not null,
  shipping_street text not null,
  shipping_number text not null,
  shipping_complement text,
  shipping_district text not null,
  shipping_city text not null,
  shipping_state text not null,

  -- Frete escolhido
  shipping_method_name text not null,    -- "PAC", "Sedex"
  shipping_company text not null,        -- "Correios"
  shipping_price_cents integer not null,
  shipping_delivery_days integer not null,
  tracking_code text,                    -- preenchido depois pela Ariz

  -- Valores
  subtotal_cents integer not null,
  discount_cents integer not null default 0,
  total_cents integer not null,

  -- Pagamento (Mercado Pago)
  mp_preference_id text,                 -- ID da preferência criada
  mp_payment_id text,                    -- ID do pagamento (vem do webhook)
  payment_method text,                   -- "pix", "credit_card", "boleto"
  payment_confirmed_at timestamptz,

  -- Cupom usado (Sprint 6)
  coupon_code text,

  notes text,                            -- observações da Ariz

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Itens de cada pedido (snapshot do produto no momento da compra)
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),  -- nullable: produto pode ser excluído depois

  -- Snapshot
  product_name text not null,
  product_slug text not null,
  product_image_url text,
  unit_price_cents integer not null,
  quantity integer not null,
  subtotal_cents integer not null,

  created_at timestamptz not null default now()
);

-- Histórico de mudanças de status (auditoria)
create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  from_status order_status,
  to_status order_status not null,
  changed_by uuid references public.profiles(id),  -- null se sistema
  notes text,
  created_at timestamptz not null default now()
);

-- Trigger updated_at
create trigger set_updated_at_orders
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- Trigger para registrar mudanças de status automaticamente
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
```

Regenerar tipos TypeScript após executar:
```bash
npx supabase gen types typescript --project-id <id> > types/database.ts
```

#### Definição de pronto

- Tabelas criadas no Supabase
- RLS funcional (cliente só vê os próprios pedidos)
- Tipos regenerados
- Trigger de histórico funcionando

---

### TASK-4.3 — Etapa de pagamento no checkout

**Tipo:** Implementação de UI + integração

#### O que fazer

1. Criar `app/(shop)/checkout/payment/page.tsx`:

   - Resumo do pedido (itens, subtotal, frete, total)
   - Seleção de método de pagamento:
     - **PIX** (recomendado, taxa menor)
     - **Cartão de crédito** (até 6x sem juros — configurável)
     - **Boleto bancário**
   - Botão "Pagar agora"

2. Criar `app/api/checkout/create-preference/route.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";
import { mpPreference } from "@/lib/mercadopago/client";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { items, shipping, address, paymentMethod } = body;

  // 1. Criar pedido com status 'pending_payment' antes de chamar MP
  const subtotalCents = items.reduce(
    (sum: number, i: any) => sum + i.priceCents * i.quantity, 0
  );
  const totalCents = subtotalCents + shipping.priceCents;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      profile_id: user.id,
      status: "pending_payment",
      shipping_recipient_name: address.recipientName,
      shipping_zip_code: address.zipCode,
      shipping_street: address.street,
      shipping_number: address.number,
      shipping_complement: address.complement,
      shipping_district: address.district,
      shipping_city: address.city,
      shipping_state: address.state,
      shipping_method_name: shipping.name,
      shipping_company: shipping.company,
      shipping_price_cents: shipping.priceCents,
      shipping_delivery_days: shipping.deliveryDays,
      subtotal_cents: subtotalCents,
      total_cents: totalCents,
    })
    .select()
    .single();

  if (orderError || !order) {
    return Response.json({ error: "Erro ao criar pedido" }, { status: 500 });
  }

  // 2. Criar itens do pedido
  await supabase.from("order_items").insert(
    items.map((item: any) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      product_slug: item.slug,
      product_image_url: item.imageUrl,
      unit_price_cents: item.priceCents,
      quantity: item.quantity,
      subtotal_cents: item.priceCents * item.quantity,
    }))
  );

  // 3. Criar preferência no Mercado Pago
  const preference = await mpPreference.create({
    body: {
      items: items.map((i: any) => ({
        id: i.productId,
        title: i.name,
        quantity: i.quantity,
        unit_price: i.priceCents / 100,
        currency_id: "BRL",
      })),
      shipments: {
        cost: shipping.priceCents / 100,
        mode: "not_specified",
      },
      payer: { email: user.email },
      external_reference: order.id,
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL}/pedido/${order.id}`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/payment?error=true`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL}/pedido/${order.id}`,
      },
      auto_return: "approved",
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mercadopago`,
      payment_methods: {
        installments: 6,
      },
    },
  });

  // 4. Salvar preference_id no pedido
  await supabase
    .from("orders")
    .update({ mp_preference_id: preference.id })
    .eq("id", order.id);

  return Response.json({
    orderId: order.id,
    preferenceId: preference.id,
    initPoint: preference.init_point,  // URL para redirecionar
  });
}
```

3. No frontend, ao clicar "Pagar agora":
   - Chama `/api/checkout/create-preference`
   - Redireciona para `initPoint` (Checkout Pro do Mercado Pago)
   - Após pagamento, MP redireciona de volta para `/pedido/[id]`

#### Definição de pronto

- Pedido criado no banco com status `pending_payment`
- Preferência criada no Mercado Pago
- Cliente é redirecionado para tela do MP
- Sandbox testado com cartões de teste do MP

---

### TASK-4.4 — Webhook do Mercado Pago

**Tipo:** Implementação crítica

#### O que fazer

Criar `app/api/webhooks/mercadopago/route.ts`:

```typescript
import { mpPayment } from "@/lib/mercadopago/client";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

// Verificação de assinatura do webhook
function verifySignature(request: Request, body: string): boolean {
  const signature = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");

  if (!signature || !requestId) return false;

  const parts = signature.split(",");
  const ts = parts.find(p => p.startsWith("ts="))?.split("=")[1];
  const v1 = parts.find(p => p.startsWith("v1="))?.split("=")[1];

  if (!ts || !v1) return false;

  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id");

  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.MERCADO_PAGO_WEBHOOK_SECRET!)
    .update(manifest)
    .digest("hex");

  return v1 === expectedSignature;
}

export async function POST(request: Request) {
  const body = await request.text();

  // Verificar assinatura (em produção)
  if (process.env.NODE_ENV === "production" && !verifySignature(request, body)) {
    return Response.json({ error: "Invalid signature" }, { status: 401 });
  }

  const data = JSON.parse(body);

  // Apenas eventos de pagamento
  if (data.type !== "payment") {
    return Response.json({ received: true });
  }

  const paymentId = data.data.id;

  try {
    // Buscar detalhes do pagamento no MP
    const payment = await mpPayment.get({ id: paymentId });
    const orderId = payment.external_reference;

    if (!orderId) {
      return Response.json({ error: "Sem external_reference" }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Buscar pedido
    const { data: order } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (!order) {
      return Response.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    // Processar status
    if (payment.status === "approved" && order.status === "pending_payment") {
      // 1. Atualizar pedido
      await supabase
        .from("orders")
        .update({
          status: "paid",
          mp_payment_id: paymentId.toString(),
          payment_method: payment.payment_method_id,
          payment_confirmed_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      // 2. Baixar estoque
      for (const item of order.order_items) {
        if (item.product_id) {
          await supabase.rpc("decrement_stock", {
            product_id: item.product_id,
            amount: item.quantity,
          });
        }
      }

      // 3. Disparar e-mail (Sprint 5 vai implementar)
      // TODO: enviar e-mail de confirmação para cliente e Ariz
    } else if (payment.status === "rejected" || payment.status === "cancelled") {
      await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
```

Criar a função SQL `decrement_stock` em uma nova migration `003_stock_function.sql`:

```sql
create or replace function public.decrement_stock(product_id uuid, amount integer)
returns void as $$
begin
  update public.products
  set stock = greatest(0, stock - amount)
  where id = product_id;
end;
$$ language plpgsql security definer;
```

#### Definição de pronto

- Webhook recebe POST do Mercado Pago e responde 200
- Verificação de assinatura ativa em produção
- Pagamento aprovado → pedido atualiza para `paid` e estoque é baixado
- Pagamento rejeitado → pedido atualiza para `cancelled`
- Idempotente: receber o mesmo webhook 2x não duplica baixa de estoque (verificar se status já é `paid`)
- Testado com webhook simulado pelo painel do MP

---

### TASK-4.5 — Página de confirmação do pedido

**Tipo:** Implementação de UI

#### O que fazer

1. Criar `app/(shop)/pedido/[id]/page.tsx`:
   - Acessível apenas pelo dono do pedido (RLS garante)
   - Polling do status a cada 5 segundos enquanto `pending_payment`
   - Exibe:
     - Número do pedido (primeiros 8 caracteres do UUID)
     - Status visual em timeline (Pago → Em separação → Enviado → Entregue)
     - Itens comprados
     - Endereço de entrega
     - Frete escolhido
     - Total pago
     - Código de rastreio (se houver)
     - Para PIX pendente: QR Code e código copiável (vindo do MP)

2. Criar `app/conta/pedidos/page.tsx`:
   - Lista de todos os pedidos do usuário
   - Cada item: número, data, total, status
   - Clica e vai para `/pedido/[id]`

#### Definição de pronto

- Cliente vê confirmação após voltar do MP
- Status atualiza automaticamente quando webhook processa
- Lista de pedidos no perfil funciona
- Cliente não consegue ver pedidos de outros usuários (RLS)

---

### TASK-4.6 — Gestão de pedidos no admin

**Tipo:** Implementação de UI

#### O que fazer

1. Criar `app/admin/pedidos/page.tsx`:
   - Tabela com: número, cliente, data, total, método de pagamento, status, ações
   - Filtros: status, período, busca por cliente/número
   - Badge colorido por status

2. Criar `app/admin/pedidos/[id]/page.tsx`:
   - Detalhes completos do pedido
   - Botões de ação por status atual:
     - `paid` → "Marcar como em separação"
     - `preparing` → "Marcar como enviado" (abre modal pedindo código de rastreio)
     - `shipped` → "Marcar como entregue"
   - Botão "Cancelar pedido" disponível em qualquer status (com confirmação)
   - Ao cancelar pedido pago, **estornar estoque** (incrementar de volta)
   - Histórico de mudanças de status (timeline)

3. Server Actions em `app/admin/pedidos/actions.ts`:
```typescript
"use server";
export async function updateOrderStatus(orderId: string, newStatus: OrderStatus, trackingCode?: string) {
  // Validações de transição: paid -> preparing -> shipped -> delivered
  // Não pode pular status (exceto cancelar)
  // Se cancelar pedido pago, estornar estoque
}
```

#### Definição de pronto

- Ariz vê todos os pedidos com filtros
- Atualizar status funciona com validação de transição
- Marcar como enviado exige código de rastreio
- Cancelar pedido pago restaura estoque
- Histórico visível na página do pedido

---

## Checklist de conclusão da sprint

- [ ] Cliente consegue pagar com PIX, cartão e boleto (sandbox)
- [ ] Pedido criado apenas após confirmação de pagamento
- [ ] Estoque baixado automaticamente
- [ ] Cliente vê o pedido em `/conta/pedidos`
- [ ] Ariz vê e gerencia pedidos no admin
- [ ] Webhook idempotente (re-execução não duplica)
- [ ] Cancelamento de pedido pago restaura estoque
- [ ] Histórico de status registrado

---

## Dependências e ordem

```
4.1 (setup MP)
  ↓
4.2 (schema pedidos)
  ↓
4.3 (checkout pagamento) ─→ 4.4 (webhook) ─→ 4.5 (confirmação)
                                                  ↓
                                               4.6 (admin pedidos)
```

---

## Notas técnicas

- **Pedido ANTES do MP:** criamos com status `pending_payment` para ter o `external_reference`. Se cliente abandonar, fica pendente — adicionar job na Sprint 8 para limpar pendentes > 24h.
- **Webhook idempotente:** sempre verificar status atual antes de aplicar mudanças.
- **Service Role para webhooks:** webhook não tem usuário autenticado, precisa do `createAdminClient()` para bypassar RLS.
- **PIX vs Checkout Pro:** o Checkout Pro já cuida de gerar QR code e copia-cola. Não precisamos implementar PIX manualmente.
- **Testes em sandbox:** o MP fornece cartões de teste (todos com CVV 123, vencimento 11/30). Documentação: [Cartões de teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards).
- **Códigos de rastreio dos Correios:** apenas armazenamos. Cliente clica no código e abre o site dos Correios (ou Melhor Envio) em nova aba.
