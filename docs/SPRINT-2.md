# Sprint 2 — Painel admin

> **Duração:** Semanas 3–4
> **Objetivo:** Construir a área administrativa onde a Ariz cadastra produtos com fotos, gerencia categorias e marca produtos em destaque.
> **Entregável ao final:** A Ariz consegue, sozinha, criar/editar/desativar produtos e categorias. Os produtos cadastrados aparecem na Home e no catálogo.

---

## Contexto para a IA

Esta sprint é o coração da autonomia da cliente. Sem ela, qualquer mudança de catálogo dependeria do desenvolvedor. O painel não precisa ser bonito — precisa ser **funcional, rápido e à prova de erros**.

Use o mesmo design system da Home (cores, tipografia), mas com layout mais denso típico de painéis administrativos. Tabelas com muitas linhas, filtros no topo, botões de ação claros.

**Pré-requisito:** Sprint 1 100% concluída. Auth funcionando, RLS ativo, schema do banco existente.

---

## Tarefas

### TASK-2.1 — Layout base do admin

**Tipo:** Implementação de UI

#### O que fazer

1. Criar `app/admin/layout.tsx` com:
   - Sidebar fixa à esquerda com links: Dashboard, Produtos, Categorias, Pedidos, Promoções
   - Header superior com nome da Ariz logada e botão de sair
   - Área de conteúdo principal à direita
   - Verificação dupla: middleware já bloqueia, mas o layout também valida `role === 'admin'` no servidor

2. Criar `app/admin/page.tsx` (dashboard):
   - 4 cards de KPIs: total de produtos, produtos ativos, categorias, estoque baixo (< 5 unidades)
   - Lista vazia para "últimos pedidos" (será preenchida na Sprint 4)
   - Lista dos 5 produtos com estoque mais baixo

3. Criar componentes em `components/admin/`:
   - `admin-sidebar.tsx`
   - `admin-header.tsx`
   - `kpi-card.tsx`
   - `data-table.tsx` — tabela genérica com header, body, paginação

#### Definição de pronto

- `/admin` mostra dashboard com KPIs reais do banco
- Sidebar destaca o item ativo
- Layout responsivo a partir de 1024px (admin é desktop-first)
- Não-admins recebem 404 ao acessar `/admin`

---

### TASK-2.2 — CRUD de categorias

**Tipo:** Implementação completa

#### O que fazer

1. Criar `app/admin/categorias/page.tsx`:
   - Tabela listando todas as categorias com colunas: imagem, nome, slug, ordem, número de produtos, ações
   - Botão "Nova categoria" no topo

2. Criar `app/admin/categorias/nova/page.tsx`:
   - Formulário com campos: nome, slug (auto-gerado a partir do nome, editável), descrição, imagem de capa (upload), ordem de exibição
   - Server Action `createCategory` que valida e insere no banco

3. Criar `app/admin/categorias/[id]/page.tsx`:
   - Mesmo formulário, pré-preenchido
   - Server Action `updateCategory`
   - Botão "Excluir" com confirmação (verifica se há produtos vinculados antes)

4. Criar `lib/utils/slugify.ts`:
```typescript
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // remove acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
```

#### Definição de pronto

- Criar, editar e excluir categorias funciona
- Slug é gerado automaticamente mas pode ser sobrescrito
- Slugs duplicados retornam erro claro
- Não é possível excluir categoria com produtos ativos vinculados (mostrar mensagem)

---

### TASK-2.3 — Upload de imagens para Supabase Storage

**Tipo:** Integração

#### O que fazer

1. No dashboard do Supabase, criar dois buckets:
   - `categories` — público, max 2MB por arquivo
   - `products` — público, max 5MB por arquivo

2. Configurar políticas de Storage:
   - Leitura pública (qualquer um pode ver as imagens)
   - Upload apenas para usuários com `role = 'admin'`

3. Criar `lib/supabase/storage.ts`:
```typescript
import { createClient } from "@/lib/supabase/server";

export async function uploadImage(
  bucket: "categories" | "products",
  file: File,
  path: string
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, cacheControl: "3600" });

  if (error) return { error: error.message };

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return { url: publicUrl };
}

export async function deleteImage(bucket: string, path: string) {
  const supabase = await createClient();
  return supabase.storage.from(bucket).remove([path]);
}
```

4. Criar componente `components/admin/image-uploader.tsx`:
   - Aceita drag-and-drop ou clique para selecionar
   - Mostra preview antes do upload
   - Validação client: tamanho máximo, tipo (jpg, png, webp)
   - Compressão básica antes do upload (opcional, usar `browser-image-compression` se quiser otimizar)

#### Definição de pronto

- Upload funciona para categorias e produtos
- URL pública gerada e salva no banco
- Imagem aparece imediatamente após upload
- Erros (arquivo grande, formato inválido) são exibidos no formulário
- Excluir produto/categoria também remove a imagem do Storage

---

### TASK-2.4 — CRUD de produtos

**Tipo:** Implementação completa

#### O que fazer

1. Criar `app/admin/produtos/page.tsx`:
   - Tabela com: imagem (thumbnail), nome, categoria, preço, estoque, status (ativo/inativo), destaque, ações
   - Filtros: categoria (select), status (todos/ativos/inativos), texto (busca por nome)
   - Botão "Novo produto"
   - Paginação (50 por página)

2. Criar `app/admin/produtos/novo/page.tsx`:
   - Formulário dividido em seções:
     - **Básico:** nome, slug, descrição (textarea com markdown ou rich text simples), categoria, material
     - **Preço:** preço normal, preço promocional (opcional), estoque
     - **Dimensões e peso** (obrigatórios para cálculo de frete na Sprint 3): peso em gramas, largura cm, altura cm, comprimento cm
     - **Imagens:** upload múltiplo, ordem editável (drag-and-drop), alt text por imagem
     - **Visibilidade:** ativo (sim/não), destaque na home (sim/não)
   - Server Action `createProduct`

3. Criar `app/admin/produtos/[id]/page.tsx`:
   - Mesmo formulário, pré-preenchido
   - Histórico de alterações (timestamp da última atualização)
   - Botão "Duplicar" (cria cópia com sufixo "(cópia)" no nome)
   - Botão "Excluir" com confirmação

4. Conversão de preços no formulário:
   - Input mostra `R$ 199,90`
   - Salva no banco como `19990` (centavos)
   - Helper `lib/utils/currency.ts`:
```typescript
export function reaisToCents(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, "").replace(",", ".");
  return Math.round(parseFloat(cleaned) * 100);
}

export function centsToReais(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(cents / 100);
}
```

#### Definição de pronto

- Criar produto com múltiplas imagens funciona
- Preços convertidos corretamente (R$ ↔ centavos)
- Slug auto-gerado e único
- Validações: estoque ≥ 0, preço promocional < preço normal
- Duplicar produto cria cópia com novo slug
- Produtos inativos não aparecem na loja (filtro RLS)

---

### TASK-2.5 — Conectar produtos reais à Home e criar catálogo

**Tipo:** Refatoração + nova página

#### O que fazer

1. Refatorar `app/page.tsx` (Home) para buscar produtos reais:
```typescript
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*, product_images(url, alt_text)")
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(8);

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  return (/* JSX usando os dados */);
}
```

2. Criar `app/(shop)/catalogo/page.tsx`:
   - Lista paginada de todos os produtos ativos
   - Filtros laterais: categoria, faixa de preço, material
   - Ordenação: mais recentes, menor preço, maior preço, mais vendidos (Sprint 4 vai popular)
   - URL refletindo os filtros (`/catalogo?categoria=aneis&preco-min=100`)

3. Criar `app/(shop)/catalogo/[categoria]/page.tsx`:
   - Filtra automaticamente pela categoria do slug

4. Criar `app/(shop)/produto/[slug]/page.tsx`:
   - Galeria de imagens (com thumbnails)
   - Nome, preço (com desconto destacado se promocional), descrição, material
   - Campo de quantidade
   - Botão "Adicionar ao carrinho" (placeholder por enquanto, será implementado na Sprint 3)
   - Seção "Você também pode gostar" (4 produtos aleatórios da mesma categoria)

#### Definição de pronto

- Home mostra produtos cadastrados pela Ariz
- Catálogo lista todos os produtos ativos com filtros funcionais
- URLs de filtros são compartilháveis (estado na URL)
- Página de produto individual funciona com slug
- 404 customizado para produto inexistente ou inativo

---

## Checklist de conclusão da sprint

- [ ] Ariz consegue criar, editar e excluir categorias
- [ ] Ariz consegue cadastrar produtos com múltiplas fotos
- [ ] Upload de imagens funciona via Supabase Storage
- [ ] Produtos em destaque aparecem na Home
- [ ] Catálogo com filtros funcionais
- [ ] Página de produto individual com galeria
- [ ] Dashboard admin mostra KPIs reais
- [ ] Tudo funciona sem erros após `npm run build`

---

## Dependências e ordem

```
2.1 (layout admin)
  ↓
2.2 (categorias) ─→ 2.3 (storage) ─→ 2.4 (produtos)
                                          ↓
                                       2.5 (home + catálogo)
```

---

## Notas técnicas

- **Server Components para listagens.** Use `"use client"` apenas no formulário de cadastro/edição (precisa de estado para upload).
- **Não use bibliotecas pesadas de tabela** (TanStack Table, AG Grid). Para esse volume, uma tabela manual é suficiente.
- **Loading states** em todas as ações que tocam o banco (botões com spinner, skeleton nas tabelas).
- **Validação dupla:** client-side com Zod ou validação manual + server-side antes do insert/update.
- **Não exponha o ID do produto na URL pública.** Use sempre o slug.
