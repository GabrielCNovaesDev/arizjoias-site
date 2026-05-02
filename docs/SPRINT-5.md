# Sprint 5 — MVP: Deploy e e-mails transacionais

> **Duração:** Semanas 9–10
> **Objetivo:** Site no ar em domínio próprio, e-mails automáticos para cliente e Ariz, treinamento da Ariz no painel.
> **Entregável ao final:** **A loja está vendendo.** Qualquer pessoa acessa `arizjoias.com.br`, faz uma compra, paga e recebe e-mail de confirmação. A Ariz consegue gerenciar tudo sozinha.

---

## Contexto para a IA

Esta é a sprint do MVP. Tudo que vem depois é melhoria — esta sprint deixa o produto **vendável**. O foco é estabilidade, comunicação automatizada e capacitação da cliente.

Não é o momento de adicionar features. É o momento de polir o que já existe e colocar no ar.

**Pré-requisito:** Sprints 1–4 100% concluídas. Conta no Mercado Pago de produção, conta no Resend, domínio adquirido.

---

## Tarefas

### TASK-5.1 — Configuração do Resend e domínio de e-mail

**Tipo:** Setup de infraestrutura

#### O que fazer

1. Criar conta em [resend.com](https://resend.com) (plano gratuito: 3.000 e-mails/mês, 100/dia).

2. Adicionar domínio `arizjoias.com.br` no Resend e configurar DNS:
   - Adicionar registros TXT (SPF e DKIM) no provedor de DNS
   - Aguardar verificação (até 48h)

3. Gerar API Key e adicionar ao `.env.local`:
```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=pedidos@arizjoias.com.br
ARIZ_NOTIFICATION_EMAIL=ariz@arizjoias.com.br  # e-mail da Ariz para receber notificações
```

4. Instalar dependências:
```bash
npm install resend @react-email/components
npm install -D react-email
```

5. Criar `lib/resend/client.ts`:
```typescript
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY!);

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL!;
export const ADMIN_EMAIL = process.env.ARIZ_NOTIFICATION_EMAIL!;
```

#### Definição de pronto

- Domínio verificado no Resend (status verde)
- Envio teste funcionando
- Variáveis de ambiente configuradas

---

### TASK-5.2 — Templates de e-mail com React Email

**Tipo:** Implementação de UI

#### O que fazer

Criar pasta `emails/` na raiz do projeto.

1. **Template base** `emails/components/layout.tsx`:
   - Header com logo da Ariz
   - Footer com endereço, contato, link para descadastro
   - Cores e tipografia alinhadas com o site

2. **Template: confirmação de pedido para o cliente** `emails/order-confirmation.tsx`:
```typescript
import {
  Html, Body, Container, Heading, Text, Section, Row, Column, Img, Hr, Button
} from "@react-email/components";

interface OrderConfirmationProps {
  customerName: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number; priceCents: number; imageUrl: string }>;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddress: { street: string; number: string; city: string; state: string; zipCode: string };
  paymentMethod: string;
  estimatedDeliveryDays: number;
  orderUrl: string;
}

export default function OrderConfirmation(props: OrderConfirmationProps) {
  // JSX completo: agradecimento, resumo, itens, total, endereço, prazo, botão "ver pedido"
}
```

3. **Template: novo pedido para a Ariz** `emails/new-order-admin.tsx`:
   - Aviso destacado de novo pedido
   - Dados do cliente (nome, e-mail, telefone)
   - Itens e valores
   - Endereço de entrega
   - Método de pagamento (PIX/cartão/boleto)
   - Link direto para o pedido no admin

4. **Template: status atualizado** `emails/order-status-update.tsx`:
   - Variantes para: em separação, enviado (com código de rastreio), entregue
   - Tom amigável

5. **Template: cadastro confirmado** `emails/welcome.tsx`:
   - Boas-vindas
   - Link para começar a comprar
   - Cupom de boas-vindas (Sprint 6 vai criar a funcionalidade — por enquanto só o template)

#### Definição de pronto

- Todos os templates renderizam corretamente
- Visualização local com `npx react-email dev` funciona
- Templates seguem o design system da Ariz
- Texto em português brasileiro, tom adequado para joalheria

---

### TASK-5.3 — Disparo de e-mails nos eventos

**Tipo:** Integração

#### O que fazer

1. Criar `lib/resend/send.ts`:
```typescript
import { resend, FROM_EMAIL, ADMIN_EMAIL } from "./client";
import { render } from "@react-email/components";
import OrderConfirmation from "@/emails/order-confirmation";
import NewOrderAdmin from "@/emails/new-order-admin";
import OrderStatusUpdate from "@/emails/order-status-update";
import Welcome from "@/emails/welcome";

export async function sendOrderConfirmation(to: string, props: any) {
  const html = await render(OrderConfirmation(props));
  return resend.emails.send({
    from: `Ariz Joias <${FROM_EMAIL}>`,
    to,
    subject: `Pedido confirmado #${props.orderNumber}`,
    html,
  });
}

export async function sendNewOrderToAdmin(props: any) {
  const html = await render(NewOrderAdmin(props));
  return resend.emails.send({
    from: `Ariz Joias <${FROM_EMAIL}>`,
    to: ADMIN_EMAIL,
    subject: `🛍️ Novo pedido #${props.orderNumber} — R$ ${(props.totalCents / 100).toFixed(2)}`,
    html,
  });
}

// Demais funções: sendOrderStatusUpdate, sendWelcome
```

2. Atualizar webhook do Mercado Pago (`app/api/webhooks/mercadopago/route.ts`):
   - Após marcar pedido como `paid`, disparar `sendOrderConfirmation` e `sendNewOrderToAdmin`

3. Atualizar Server Action `updateOrderStatus` (admin):
   - Após mudança de status, disparar `sendOrderStatusUpdate`

4. Atualizar fluxo de cadastro:
   - Após `signUp` bem-sucedido, disparar `sendWelcome`

5. **Tratamento de erros de e-mail:** envio falhar **não pode** quebrar o fluxo principal. Use try/catch e logue o erro. O pedido foi pago, isso é o que importa.

#### Definição de pronto

- E-mail de confirmação chega no cliente após pagamento aprovado
- E-mail de novo pedido chega na Ariz simultaneamente
- E-mail de mudança de status dispara ao atualizar pedido
- Falha de e-mail não trava o sistema (tratado e logado)

---

### TASK-5.4 — Deploy na Vercel

**Tipo:** Deploy

#### O que fazer

1. Conectar o repositório do projeto no GitHub à Vercel.

2. Configurar variáveis de ambiente em produção (todas listadas no `.env.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `MERCADO_PAGO_ACCESS_TOKEN` (token de PRODUÇÃO, não teste)
   - `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY`
   - `MERCADO_PAGO_WEBHOOK_SECRET`
   - `MELHOR_ENVIO_TOKEN`
   - `MELHOR_ENVIO_CEP_ORIGEM`
   - `MELHOR_ENVIO_API_URL=https://melhorenvio.com.br/api/v2/me` (URL de produção)
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `ARIZ_NOTIFICATION_EMAIL`
   - `NEXT_PUBLIC_APP_URL=https://arizjoias.com.br`

3. Configurar domínio personalizado:
   - Adicionar `arizjoias.com.br` na Vercel
   - Configurar DNS no registrador (Registro.br ou similar):
     - `A` apontando para `76.76.21.21` (IP da Vercel)
     - `CNAME www` apontando para `cname.vercel-dns.com`
   - Aguardar SSL automático (Let's Encrypt)

4. Atualizar webhook do Mercado Pago:
   - Trocar URL temporária do ngrok pela URL definitiva: `https://arizjoias.com.br/api/webhooks/mercadopago`

5. Configurar redirect `www` → não-`www` (ou vice-versa, escolher um padrão).

6. Habilitar **Vercel Analytics** (gratuito) para métricas básicas.

#### Definição de pronto

- Site acessível em `arizjoias.com.br` com HTTPS
- Build de produção sem erros
- Todas as variáveis de ambiente configuradas
- Webhook do MP atualizado para produção
- Redirecionamento `www` ↔ não-`www` funcional

---

### TASK-5.5 — Testes end-to-end de produção

**Tipo:** QA

#### O que fazer

Executar checklist completo no ambiente de produção:

**Cenário 1: Cliente novo**
- [ ] Acessar a Home, navegar pelo catálogo
- [ ] Clicar em um produto, ver galeria de imagens
- [ ] Adicionar ao carrinho
- [ ] Calcular frete com CEP real
- [ ] Cadastrar nova conta
- [ ] Receber e-mail de boas-vindas
- [ ] Finalizar checkout escolhendo PIX
- [ ] Pagar (com valor real pequeno, ex: R$ 1)
- [ ] Receber e-mail de confirmação
- [ ] Ariz recebe e-mail de novo pedido
- [ ] Estoque do produto baixado

**Cenário 2: Cliente recorrente**
- [ ] Login funciona
- [ ] Endereço salvo aparece no checkout
- [ ] Histórico de pedidos visível em `/conta/pedidos`

**Cenário 3: Ariz como admin**
- [ ] Login como admin redireciona corretamente para `/admin`
- [ ] Cadastrar produto novo com 3 fotos
- [ ] Produto aparece no catálogo imediatamente
- [ ] Atualizar status do pedido teste para "em separação"
- [ ] Cliente recebe e-mail de status atualizado
- [ ] Marcar como "enviado" com código de rastreio fictício

**Cenário 4: Erros**
- [ ] Pagamento recusado → pedido marcado como cancelado
- [ ] CEP inválido → mensagem clara
- [ ] Tentar comprar produto sem estoque → bloqueado

#### Definição de pronto

- Todos os cenários executados com sucesso
- Bugs encontrados anotados e corrigidos antes de prosseguir

---

### TASK-5.6 — Documentação para a Ariz (manual de uso)

**Tipo:** Documentação

#### O que fazer

Criar `docs/MANUAL-ARIZ.md` — documento em linguagem não-técnica explicando:

1. **Como acessar o painel** (URL, login)
2. **Como cadastrar um produto novo** (passo a passo com screenshots)
3. **Como editar um produto existente**
4. **Como criar uma categoria nova**
5. **Como ver pedidos novos**
6. **Como atualizar o status de um pedido**
7. **Como adicionar código de rastreio**
8. **Como cancelar um pedido**
9. **O que fazer se um cliente entrar em contato com problemas**
10. **Onde ver as métricas básicas (vendas, produtos)**

Também:
- Gravar um vídeo curto (10–15 min) navegando pelo painel e demonstrando os fluxos principais.
- Marcar reunião de treinamento de 1 hora com a Ariz.

#### Definição de pronto

- Manual escrito e acessível
- Vídeo gravado e enviado para a Ariz
- Treinamento realizado
- Ariz consegue cadastrar 1 produto sozinha durante o treinamento

---

## Checklist de conclusão da sprint

- [ ] Site no ar em `arizjoias.com.br` com HTTPS
- [ ] E-mails transacionais funcionando para cliente e admin
- [ ] Pelo menos 1 venda de teste real concluída
- [ ] Manual da Ariz pronto e treinamento realizado
- [ ] Ariz operando o painel sem ajuda
- [ ] Webhook do MP em produção verificado
- [ ] Vercel Analytics ativo

---

## Dependências e ordem

```
5.1 (Resend setup) ─→ 5.2 (templates) ─→ 5.3 (disparos)
                                              ↓
5.4 (deploy) ─────────────────────────────→ 5.5 (testes E2E)
                                              ↓
                                          5.6 (manual + treino)
```

---

## 🎉 Marco do MVP

Ao final desta sprint, **a Ariz Joias está vendendo**. Tudo que vem nas Sprints 6–8 são adições que ampliam o produto, mas o negócio já roda.

A partir daqui, considere:

- Acompanhar de perto as primeiras semanas para corrigir bugs reais que aparecem em uso
- Coletar feedback de clientes reais para priorizar os próximos passos
- Possibilidade de pausar o desenvolvimento se a Ariz preferir validar o MVP antes de investir mais
