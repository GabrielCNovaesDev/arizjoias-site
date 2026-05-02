# Sprint 8 — Performance, analytics e LGPD

> **Duração:** Semanas 15–16
> **Objetivo:** Site rápido, conformidade legal, dados sobre o negócio. Encerramento do projeto principal.
> **Entregável ao final:** Site profissional, com Core Web Vitals aprovados, conforme LGPD, com relatórios de vendas para a Ariz tomar decisões.

---

## Contexto para a IA

Esta é a sprint de polimento. Tudo já funciona — agora trata-se de fazer funcionar bem. Performance afeta conversão, conformidade legal evita multas, analytics dão visibilidade.

**Pré-requisito:** Sprints 1–7 concluídas, site no ar com tráfego real.

---

## Tarefas

### TASK-8.1 — Auditoria de performance

**Tipo:** Otimização

#### O que fazer

1. Rodar **Lighthouse** em modo mobile e desktop nas páginas principais:
   - Home
   - Catálogo (`/catalogo`)
   - Página de produto
   - Carrinho
   - Checkout

2. Coletar métricas de **Core Web Vitals**:
   - **LCP** (Largest Contentful Paint) — meta < 2.5s
   - **FID** (First Input Delay) / **INP** (Interaction to Next Paint) — meta < 200ms
   - **CLS** (Cumulative Layout Shift) — meta < 0.1

3. Documentar em `docs/PERFORMANCE-BASELINE.md` o estado atual.

4. Aplicar correções por prioridade:

   **Imagens:**
   - Garantir que todas usam `next/image` com `sizes` e `priority` na imagem principal da Home
   - Converter PNGs para WebP no Supabase Storage (rodar script de migração se necessário)
   - Adicionar `placeholder="blur"` com base64 das imagens principais

   **JavaScript:**
   - Identificar Client Components que poderiam ser Server Components
   - Lazy-load de componentes pesados (galeria, modais) com `next/dynamic`
   - Verificar bundle com `@next/bundle-analyzer`

   **Fontes:**
   - Usar `next/font` (já vem otimizado)
   - Apenas pesos que são realmente usados (geralmente 400 e 600)

   **Banco:**
   - Adicionar índices em colunas frequentemente filtradas (categoria, status do pedido)
   - Garantir que listagem do catálogo só busca campos necessários (nunca `select *` em listagens grandes)

5. Após correções, rodar Lighthouse novamente e documentar antes/depois.

#### Definição de pronto

- LCP < 2.5s em todas as páginas principais
- CLS < 0.1
- Bundle JavaScript da Home < 200KB
- Documento de baseline + correções aplicadas
- Score Lighthouse Performance > 90 em desktop, > 80 em mobile

---

### TASK-8.2 — Banner de cookies e LGPD

**Tipo:** Conformidade legal

#### O que fazer

1. Criar `components/shop/cookie-banner.tsx`:
   - Aparece na primeira visita
   - Texto curto: "Usamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa Política de Privacidade."
   - Botões: "Aceitar todos", "Apenas essenciais", "Personalizar"
   - Modal de personalização com toggles:
     - Essenciais (sempre ativo, não desligável) — sessão, carrinho
     - Analytics (opt-in)
     - Marketing (opt-in)
   - Persistir escolha em cookie por 12 meses

2. Carregar Analytics e ferramentas de marketing **apenas após consentimento**:
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <CookieBanner />
        {/* Scripts carregados condicionalmente baseado no consentimento */}
        <ConditionalAnalytics />
      </body>
    </html>
  );
}
```

3. Criar páginas legais:
   - `app/politica-de-privacidade/page.tsx`
   - `app/termos-de-uso/page.tsx`
   - `app/politica-de-trocas-e-devolucoes/page.tsx`
   - Conteúdo escrito em parceria com a Ariz (revisar com advogado se possível)

4. Adicionar links no footer.

5. Implementar direitos do titular (LGPD Art. 18):
   - Rota `app/conta/dados/page.tsx` com:
     - Botão "Baixar meus dados" (gera JSON com perfil, pedidos, endereços, reviews)
     - Botão "Excluir minha conta" (com confirmação dupla; soft delete recomendado)

#### Definição de pronto

- Banner de cookies funcional
- Páginas legais publicadas
- Cliente consegue baixar dados e solicitar exclusão
- Tracking só carrega após consentimento explícito

---

### TASK-8.3 — Google Analytics 4

**Tipo:** Integração

#### O que fazer

1. Criar conta no [Google Analytics](https://analytics.google.com), criar propriedade GA4 para `arizjoias.com.br`.

2. Adicionar variável de ambiente:
```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

3. Criar `components/analytics/ga.tsx`:
```typescript
"use client";
import Script from "next/script";

export function GoogleAnalytics() {
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID) return null;
  // Carregar apenas se consentimento de analytics aceito
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`} />
      <Script id="ga-init">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
      `}</Script>
    </>
  );
}
```

4. Disparar eventos de e-commerce:
   - `view_item` — ao abrir página de produto
   - `add_to_cart` — ao adicionar ao carrinho
   - `begin_checkout` — ao iniciar checkout
   - `purchase` — após pagamento aprovado (no webhook)

5. Configurar conversões no GA4 (event `purchase` como conversão).

#### Definição de pronto

- GA4 instalado e recebendo dados
- Eventos de e-commerce configurados
- Tracking só ativa com consentimento
- Conversões marcadas

---

### TASK-8.4 — Relatórios de vendas no admin

**Tipo:** Implementação

#### O que fazer

Criar `app/admin/relatorios/page.tsx`:

1. **Filtro de período** no topo: hoje, últimos 7 dias, mês atual, mês anterior, customizado.

2. **KPIs do período:**
   - Total de pedidos
   - Receita bruta (soma de `total_cents` dos pedidos pagos)
   - Receita líquida (descontando estornos)
   - Ticket médio
   - Taxa de conversão (se GA4 integrado: visitantes vs compradores)

3. **Gráficos:**
   - Vendas por dia (line chart)
   - Top 10 produtos mais vendidos (bar chart com quantidade)
   - Distribuição de método de pagamento (pie chart)
   - Distribuição de origem do pedido (categoria mais vendida)

4. **Tabela de produtos vendidos** com: produto, quantidade vendida, receita gerada.

5. **Exportar para CSV:** botão que gera arquivo com pedidos do período (útil para contabilidade).

Bibliotecas:
```bash
npm install recharts
```

#### Definição de pronto

- Relatório carrega rápido (queries otimizadas no Supabase)
- Gráficos renderizam corretamente
- Filtro de período funciona
- Exportação CSV inclui todos os dados relevantes

---

### TASK-8.5 — Job de limpeza de pedidos pendentes

**Tipo:** Automação

#### O que fazer

Pedidos com status `pending_payment` há mais de 24h provavelmente foram abandonados. Liberar.

1. Criar `app/api/cron/clean-pending-orders/route.ts`:
```typescript
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  // Proteção: apenas Vercel Cron pode chamar
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("status", "pending_payment")
    .lt("created_at", cutoff)
    .select("id");

  return Response.json({ cancelled: data?.length || 0 });
}
```

2. Configurar Vercel Cron em `vercel.json`:
```json
{
  "crons": [
    { "path": "/api/cron/clean-pending-orders", "schedule": "0 3 * * *" }
  ]
}
```
(roda todo dia às 3h da manhã)

3. Adicionar `CRON_SECRET` (string aleatória) nas env vars da Vercel.

#### Definição de pronto

- Cron configurado e executando
- Pedidos pendentes > 24h são cancelados
- Logs de execução visíveis no painel Vercel

---

### TASK-8.6 — Documentação técnica final e handoff

**Tipo:** Documentação

#### O que fazer

Criar `docs/TECHNICAL.md` com:

1. **Arquitetura geral** — diagrama da stack
2. **Decisões importantes** — por que cada tecnologia foi escolhida
3. **Como rodar localmente** — passo a passo
4. **Como fazer deploy** — fluxo via Vercel
5. **Como adicionar uma migration de banco** — convenção
6. **Variáveis de ambiente explicadas**
7. **Webhooks externos** — como simular em dev
8. **Onboarding de novo dev** — pré-requisitos, primeiros passos
9. **Como debugar problemas comuns** — erros conhecidos e soluções
10. **Roadmap futuro** — ideias para depois (programa de fidelidade, segunda-via, integração com WhatsApp Business)

Atualizar `README.md` da raiz do projeto com:
- Descrição
- Status: produção
- Como contribuir
- Contato

#### Definição de pronto

- Documentação técnica completa em `docs/`
- Outro desenvolvedor consegue rodar o projeto localmente seguindo apenas a documentação
- README do projeto profissional

---

## Checklist de conclusão da sprint (e do projeto principal)

- [ ] Lighthouse > 90 em desktop, > 80 em mobile
- [ ] Banner de cookies funcional
- [ ] Páginas legais publicadas
- [ ] Cliente exporta/exclui dados (LGPD)
- [ ] Google Analytics 4 ativo com eventos de e-commerce
- [ ] Relatórios de vendas funcionais para a Ariz
- [ ] Cron de limpeza de pedidos pendentes ativo
- [ ] Documentação técnica completa
- [ ] Site estável após 30 dias de produção

---

## Dependências e ordem

```
8.1 (performance) ── (independente)
8.2 (LGPD) ─→ 8.3 (GA4)  [GA depende do consentimento]
8.4 (relatórios) ── (independente)
8.5 (cron) ── (independente)
8.6 (docs) ── (último, ao final de tudo)
```

---

## 🏁 Encerramento do projeto

Ao final desta sprint, o projeto Ariz Joias está **completo, profissional e em pleno funcionamento**.

Próximos passos sugeridos (fora do escopo das 8 sprints):

- **Programa de fidelidade** — pontos por compra que viram desconto
- **Integração WhatsApp Business** — atendimento direto pelo site
- **Pré-venda e listas de espera** para coleções limitadas
- **Marketplace multi-vendedor** se a Ariz quiser revender peças de outras designers
- **Aplicativo mobile** com push notifications

Recomendação: definir um **contrato de manutenção** com a Ariz (mensalidade pequena para correções, atualizações de dependências e suporte ocasional). Sem isso, o site pode ficar desatualizado em 6–12 meses.
