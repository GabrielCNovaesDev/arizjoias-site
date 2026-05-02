# Sprint 7 — Avaliações, busca e SEO

> **Duração:** Semanas 13–14
> **Objetivo:** Sistema de avaliações de produtos, busca por texto, otimização para Google e redes sociais.
> **Entregável ao final:** Clientes deixam reviews. O site aparece no Google. Compartilhamentos no WhatsApp e Instagram mostram preview bonito.

---

## Contexto para a IA

Esta sprint adiciona prova social (avaliações), descobribilidade (busca interna) e visibilidade externa (SEO). É a sprint que faz o site começar a crescer organicamente.

**Pré-requisito:** Sprints 1–6 concluídas.

---

## Tarefas

### TASK-7.1 — Schema de avaliações

**Tipo:** Modelagem de dados

#### O que fazer

Migration `006_reviews_schema.sql`:

```sql
create table public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id),       -- garante que comprou
  rating integer not null check (rating between 1 and 5),
  title text,
  comment text,
  is_verified_purchase boolean not null default false,
  is_approved boolean not null default false,        -- moderação manual
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, profile_id)                    -- 1 review por produto por usuário
);

create index idx_reviews_product on public.product_reviews(product_id, is_approved, created_at desc);

alter table public.product_reviews enable row level security;

-- Visíveis publicamente apenas se aprovadas
create policy "Anyone reads approved reviews"
  on public.product_reviews for select
  using (is_approved = true);

-- Usuário vê os próprios reviews mesmo não-aprovados
create policy "Users see own reviews"
  on public.product_reviews for select
  using (auth.uid() = profile_id);

-- Usuário cria/edita os próprios
create policy "Users manage own reviews"
  on public.product_reviews for insert
  with check (auth.uid() = profile_id);

create policy "Users update own reviews"
  on public.product_reviews for update
  using (auth.uid() = profile_id);

-- Admin tem acesso total
create policy "Admins manage all reviews"
  on public.product_reviews for all
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));

-- View materializada para média e contagem por produto
create materialized view public.product_review_stats as
select
  product_id,
  count(*) filter (where is_approved) as review_count,
  round(avg(rating) filter (where is_approved)::numeric, 1) as avg_rating
from public.product_reviews
group by product_id;

create unique index idx_review_stats_product on public.product_review_stats(product_id);

-- Função para refresh (chamar via cron ou após cada review aprovada)
create or replace function public.refresh_review_stats()
returns void as $$
begin
  refresh materialized view concurrently public.product_review_stats;
end;
$$ language plpgsql;
```

#### Definição de pronto

- Tabela criada com constraint de unicidade
- View materializada funcional
- RLS testado: review não-aprovada visível só pro autor

---

### TASK-7.2 — Avaliação após compra

**Tipo:** Implementação

#### O que fazer

1. Atualizar página `/conta/pedidos/[id]`:
   - Para pedidos com status `delivered`, mostrar botão "Avaliar produtos comprados" ao lado de cada item
   - Click abre modal com:
     - Estrelas de 1 a 5
     - Campo título (opcional, max 100 chars)
     - Campo comentário (opcional, max 1000 chars)
     - Botão enviar

2. Server Action `submitReview`:
   - Valida que o usuário comprou aquele produto naquele pedido
   - Insere review com `is_verified_purchase = true` e `is_approved = false`
   - Notifica admin por e-mail (template novo)

3. Criar `app/admin/avaliacoes/page.tsx`:
   - Lista de reviews pendentes de aprovação
   - Cada item: produto, cliente, nota, título, comentário, data
   - Botões: aprovar, rejeitar
   - Filtros: pendentes / aprovadas / rejeitadas

4. Após aprovar/rejeitar, chamar `refresh_review_stats()`.

#### Definição de pronto

- Cliente avalia apenas pedidos entregues
- Avaliações vão para fila de moderação
- Admin aprova/rejeita
- Stats atualizam após aprovação

---

### TASK-7.3 — Exibição de avaliações na página do produto

**Tipo:** Implementação de UI

#### O que fazer

1. Atualizar `app/(shop)/produto/[slug]/page.tsx`:
   - Buscar `product_review_stats` junto com produto
   - Mostrar média e contagem perto do título: ⭐ 4.8 (23 avaliações)
   - Nova seção "Avaliações" no final da página com:
     - Resumo: distribuição de notas (5 estrelas: 18, 4 estrelas: 4, ...)
     - Lista de reviews aprovadas, ordenadas por data
     - Cada review: estrelas, nome do cliente (primeiro nome + inicial sobrenome), data, título, comentário, badge "Compra verificada"
     - Paginação: 10 por página

2. Atualizar `product-card.tsx` para mostrar média e quantidade.

#### Definição de pronto

- Estrelas visíveis no produto e no card
- Distribuição de notas visualmente clara
- Privacidade: não exibir nome completo
- Performance: stats vêm da view materializada

---

### TASK-7.4 — Busca por texto

**Tipo:** Implementação

#### O que fazer

1. Adicionar busca full-text no PostgreSQL. Migration `007_search.sql`:

```sql
-- Coluna de busca com pesos
alter table public.products
  add column search_vector tsvector
  generated always as (
    setweight(to_tsvector('portuguese', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('portuguese', coalesce(material, '')), 'B') ||
    setweight(to_tsvector('portuguese', coalesce(description, '')), 'C')
  ) stored;

create index idx_products_search on public.products using gin(search_vector);

-- Função de busca
create or replace function public.search_products(query_text text, limit_count integer default 20)
returns setof public.products
language sql stable as $$
  select * from public.products
  where is_active = true
    and search_vector @@ plainto_tsquery('portuguese', query_text)
  order by ts_rank(search_vector, plainto_tsquery('portuguese', query_text)) desc
  limit limit_count;
$$;
```

2. Criar `app/api/search/route.ts`:
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  if (!q || q.length < 2) return Response.json({ results: [] });

  const supabase = await createClient();
  const { data } = await supabase.rpc("search_products", {
    query_text: q,
    limit_count: 12
  });

  return Response.json({ results: data || [] });
}
```

3. Componente `components/shop/search-bar.tsx`:
   - Input no header
   - Debounce de 300ms
   - Dropdown com até 8 sugestões enquanto digita
   - Cada sugestão: thumbnail + nome + preço
   - Enter abre página `/busca?q=...`

4. Página `app/(shop)/busca/page.tsx`:
   - Resultados em grade
   - Mostra termo buscado
   - Estado vazio: "Nenhum produto encontrado para 'X'. Tente outro termo."
   - Sugestão de categorias

#### Definição de pronto

- Busca funciona com tolerância a acentos e plurais
- Sugestões aparecem rapidamente
- Página de resultados acessível por URL compartilhável
- Performance: busca em < 200ms para catálogo de até 1000 produtos

---

### TASK-7.5 — SEO técnico

**Tipo:** Otimização

#### O que fazer

1. **Metadata dinâmica por página** usando a API de Metadata do Next.js:

```typescript
// app/(shop)/produto/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await fetchProduct(params.slug);
  if (!product) return { title: "Produto não encontrado" };

  return {
    title: `${product.name} | Ariz Joias`,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description?.slice(0, 160),
      images: [{ url: product.images[0]?.url, width: 1200, height: 1200 }],
      type: "website",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description?.slice(0, 160),
      images: [product.images[0]?.url],
    },
  };
}
```

2. **JSON-LD de produto** (rich snippets no Google):

```typescript
// dentro da página de produto
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.name,
  image: product.images.map(i => i.url),
  description: product.description,
  sku: product.id,
  brand: { "@type": "Brand", name: "Ariz Joias" },
  offers: {
    "@type": "Offer",
    url: `https://arizjoias.com.br/produto/${product.slug}`,
    priceCurrency: "BRL",
    price: (product.promotional_price_cents ?? product.price_cents) / 100,
    availability: product.stock > 0
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  },
  aggregateRating: stats.review_count > 0 ? {
    "@type": "AggregateRating",
    ratingValue: stats.avg_rating,
    reviewCount: stats.review_count,
  } : undefined,
};

// no JSX
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
```

3. **Sitemap dinâmico** em `app/sitemap.ts`:
```typescript
import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("is_active", true);

  const { data: categories } = await supabase
    .from("categories")
    .select("slug");

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1.0 },
    { url: `${baseUrl}/catalogo`, lastModified: new Date(), priority: 0.9 },
    ...(categories || []).map(c => ({
      url: `${baseUrl}/catalogo/${c.slug}`,
      priority: 0.8,
    })),
    ...(products || []).map(p => ({
      url: `${baseUrl}/produto/${p.slug}`,
      lastModified: new Date(p.updated_at),
      priority: 0.7,
    })),
  ];
}
```

4. **robots.txt** em `app/robots.ts`:
```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/", "/conta/", "/checkout/"] }
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL}/sitemap.xml`,
  };
}
```

5. **Google Search Console:**
   - Cadastrar `arizjoias.com.br`
   - Verificar via DNS ou meta tag
   - Submeter sitemap

#### Definição de pronto

- Metadata visível no `view-source` de cada página
- JSON-LD validado no [Rich Results Test](https://search.google.com/test/rich-results)
- `sitemap.xml` gerado e acessível
- `robots.txt` correto
- Site enviado ao Search Console

---

### TASK-7.6 — Compartilhamento social

**Tipo:** Implementação

#### O que fazer

1. Configurar imagens Open Graph dedicadas:
   - Para produtos: usar a primeira foto em alta resolução (1200×1200 mínimo)
   - Para a Home: criar imagem de capa em `public/og-home.jpg` (1200×630)

2. Adicionar botões de compartilhar na página do produto:
   - WhatsApp: `https://wa.me/?text=` + URL
   - Pinterest: relevante para joias
   - Copiar link (com toast de confirmação)

3. Testar previews em:
   - WhatsApp Web (cole link e veja preview)
   - [Open Graph Debugger do Facebook](https://developers.facebook.com/tools/debug/)

#### Definição de pronto

- Compartilhamento no WhatsApp mostra imagem, título e descrição
- Botões funcionam em mobile e desktop

---

## Checklist de conclusão da sprint

- [ ] Cliente avalia produtos comprados após entrega
- [ ] Admin modera avaliações
- [ ] Estrelas e contagem visíveis no produto
- [ ] Busca por texto funcional com sugestões
- [ ] Metadata e JSON-LD em todas as páginas relevantes
- [ ] Sitemap automático
- [ ] Site indexado no Search Console
- [ ] Preview de compartilhamento funcionando

---

## Dependências e ordem

```
7.1 (schema reviews) ─→ 7.2 (avaliação após compra) ─→ 7.3 (exibição)
7.4 (busca) ─── (independente)
7.5 (SEO) ─── (independente, fazer ao final)
7.6 (social) ── (depende de 7.5)
```

---

## Notas técnicas

- **Português no full-text search:** PostgreSQL tem dicionário `portuguese` que entende plurais e radicais.
- **View materializada:** rodar `refresh_review_stats()` após cada aprovação. Em escala maior, considerar trigger ou job agendado.
- **JSON-LD condicional:** só incluir `aggregateRating` se houver pelo menos 1 review (Google penaliza fake data).
- **Cuidado com SEO de filtros:** `/catalogo?categoria=aneis&preco-min=100` pode gerar páginas duplicadas. Usar `noindex` em URLs com query params (a menos que estrategicamente queira indexá-las).
