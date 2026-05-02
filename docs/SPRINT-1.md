# Sprint 1 — Fundação técnica

> **Duração:** Semanas 1–2
> **Objetivo:** Projeto Next.js inicializado, Supabase configurado, autenticação funcionando, design da Home implementado.
> **Entregável ao final:** Site visualmente completo na Home, qualquer pessoa consegue se cadastrar e fazer login, dados persistem no Supabase.

---

## Contexto para a IA

Esta sprint é a fundação. Não há funcionalidade de e-commerce ainda — o foco é deixar a base técnica sólida para que as próximas sprints só adicionem features sem precisar refatorar.

**Antes de começar qualquer tarefa, leia o README Geral do projeto.** Ele contém a stack obrigatória e as convenções.

**O design da Home já existe.** Você vai buscar o arquivo de design fornecido, ler o `Preview.html` e replicar a Home pixel-perfect. As demais telas (login, cadastro) seguem o mesmo design system.

---

## Tarefas

### TASK-1.1 — Inicialização do projeto Next.js

**Tipo:** Setup inicial

#### O que fazer

1. Criar o projeto com `create-next-app`:
```bash
npx create-next-app@latest ariz-joias --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

2. Instalar dependências base:
```bash
npm install @supabase/supabase-js @supabase/ssr zustand
npm install -D @types/node
```

3. Estruturar as pastas conforme o README Geral (seção 3):
```
app/
  (shop)/
  (auth)/
  conta/
  admin/
  api/
components/ui/
components/shop/
components/admin/
lib/supabase/
lib/utils/
stores/
types/
```

4. Criar `.env.example` com todas as variáveis listadas no README Geral (seção 6) com valores dummy.

5. Configurar `.gitignore` incluindo `.env.local`, `.env*.local`, `next-env.d.ts`.

#### Definição de pronto

- `npm run dev` sobe o projeto em `localhost:3000` sem erros
- `npm run build` completa sem warnings
- Estrutura de pastas espelha o README Geral
- `.env.example` versionado, `.env.local` ignorado

---

### TASK-1.2 — Implementação visual da Home

**Tipo:** Implementação de UI

#### O que fazer

1. Buscar e ler o design da Home executando este comando:
```
Fetch this design file, read its readme, and implement the relevant aspects of the design.
https://api.anthropic.com/v1/design/h/qhUSr57JBtoyBuWQk6SLHA?open_file=Preview.html
Implement: Preview.html
```

2. Extrair do design e configurar globalmente:
   - **Variáveis CSS de cor** em `app/globals.css` (cores primária, secundária, neutros, texto)
   - **Tipografia** no `tailwind.config.ts` (font family, escala de tamanhos)
   - **Espaçamentos e border-radius** no `tailwind.config.ts`

3. Criar componentes reutilizáveis em `components/ui/`:
   - `button.tsx` — variantes primary, secondary, ghost
   - `input.tsx` — campo de texto padrão
   - `card.tsx` — card de produto

4. Criar componentes de layout em `components/shop/`:
   - `header.tsx` — header com navegação, busca e ícone de carrinho
   - `footer.tsx` — footer com informações da loja
   - `product-card.tsx` — card individual de produto (recebe props mockadas por enquanto)

5. Implementar `app/page.tsx` com a Home completa, usando dados mockados em um array local.

6. Implementar `app/layout.tsx` com header e footer envolvendo todas as páginas da `(shop)`.

#### Definição de pronto

- Home renderiza idêntica ao design do Preview.html
- Header e footer aparecem em todas as páginas (exceto `/admin` e `/(auth)`)
- Componentes usam exclusivamente classes Tailwind
- Nenhum CSS inline ou arquivo `.css` adicional além do `globals.css`
- Variáveis de cor centralizadas — nenhuma cor hard-coded em componentes
- Responsivo para desktop (1280px+) e mobile (375px+)

---

### TASK-1.3 — Configuração do Supabase

**Tipo:** Setup de infraestrutura

#### O que fazer

1. Criar projeto no Supabase ([supabase.com](https://supabase.com)) com nome "ariz-joias".
2. Copiar as três keys (URL, anon key, service role key) para o `.env.local`.
3. Criar os clientes Supabase em `lib/supabase/`:

**`lib/supabase/client.ts`** — para uso em Client Components:
```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**`lib/supabase/server.ts`** — para uso em Server Components e Route Handlers:
```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options));
          } catch {}
        },
      },
    }
  );
}
```

**`lib/supabase/admin.ts`** — para operações privilegiadas no servidor (apenas em Route Handlers que precisam bypassar RLS):
```typescript
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
```

4. Documentar a regra: **`createAdminClient()` nunca pode ser importado em Client Components**.

#### Definição de pronto

- Projeto Supabase criado e acessível
- Três clientes funcionais em `lib/supabase/`
- Variáveis de ambiente carregando corretamente
- Comentários nos arquivos explicando quando usar cada cliente

---

### TASK-1.4 — Schema inicial do banco

**Tipo:** Modelagem de dados

#### O que fazer

Executar o SQL abaixo no editor SQL do Supabase. Salvar o arquivo em `docs/migrations/001_initial_schema.sql` no projeto.

```sql
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
  material text,                          -- ex: "Prata 925", "Ouro 18k"
  price_cents integer not null,           -- preço em centavos para evitar float
  promotional_price_cents integer,        -- null se não está em promoção
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

-- Endereços do cliente (N por usuário)
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  label text,                             -- ex: "Casa", "Trabalho"
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

-- Trigger para atualizar updated_at automaticamente
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

-- Trigger para criar profile automaticamente quando user é criado
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

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.categories enable row level security;
alter table public.addresses enable row level security;

-- Políticas: produtos e categorias são públicos para leitura
create policy "Anyone can view active products"
  on public.products for select
  using (is_active = true);

create policy "Anyone can view product images"
  on public.product_images for select
  using (true);

create policy "Anyone can view categories"
  on public.categories for select
  using (true);

-- Políticas: profile - usuário lê e edita o próprio
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Políticas: addresses - usuário lê e edita os próprios
create policy "Users can manage own addresses"
  on public.addresses for all
  using (auth.uid() = profile_id);

-- Políticas: admin pode tudo (verificação via role no profile)
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
```

Após executar, gerar os tipos TypeScript:
```bash
npx supabase gen types typescript --project-id <project-id> > types/database.ts
```

#### Definição de pronto

- Todas as tabelas criadas e visíveis no dashboard do Supabase
- RLS habilitado em todas as tabelas
- Tipos TypeScript gerados em `types/database.ts`
- Arquivo SQL salvo em `docs/migrations/001_initial_schema.sql`
- Seed de teste: 1 categoria e 2 produtos inseridos manualmente para validar

---

### TASK-1.5 — Páginas de cadastro e login

**Tipo:** Implementação com integração

#### O que fazer

1. Criar `app/(auth)/login/page.tsx`:
   - Formulário com email e senha
   - Server Action que chama `supabase.auth.signInWithPassword()`
   - Após sucesso, redireciona para `/`
   - Tratamento de erro: senha incorreta, email não cadastrado

2. Criar `app/(auth)/cadastro/page.tsx`:
   - Formulário com nome completo, email, senha, confirmação de senha
   - Validação client-side: senha mínima 8 caracteres, e-mails válidos
   - Server Action que chama `supabase.auth.signUp()` passando `full_name` em `data.user_metadata`
   - O trigger SQL criado na TASK-1.4 cria o profile automaticamente
   - Após sucesso, redireciona para `/`

3. Criar `app/(auth)/layout.tsx`:
   - Layout sem header/footer da loja
   - Centraliza o formulário com logo da Ariz no topo
   - Link de "voltar para a loja"

4. Criar `app/api/auth/logout/route.ts`:
   - POST handler que chama `supabase.auth.signOut()` e redireciona para `/`

5. Atualizar `components/shop/header.tsx`:
   - Mostrar "Entrar / Cadastrar" se não logado
   - Mostrar nome do usuário e link para `/conta` se logado
   - Botão "Sair" que chama `/api/auth/logout`

#### Definição de pronto

- Cadastro cria usuário no `auth.users` e profile correspondente em `public.profiles`
- Login funciona e a sessão persiste após reload da página
- Logout limpa a sessão e o header atualiza
- Erros de validação aparecem visualmente nos formulários
- Páginas de auth seguem o mesmo design system da Home

---

### TASK-1.6 — Middleware de proteção de rotas

**Tipo:** Implementação de segurança

#### O que fazer

Criar `middleware.ts` na raiz do projeto:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Rotas que exigem login
  const protectedRoutes = ["/conta", "/checkout"];
  const adminRoutes = ["/admin"];

  const isProtected = protectedRoutes.some(r => pathname.startsWith(r));
  const isAdmin = adminRoutes.some(r => pathname.startsWith(r));

  if ((isProtected || isAdmin) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAdmin && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

#### Definição de pronto

- Acessar `/conta` sem login redireciona para `/login`
- Acessar `/admin` sem login redireciona para `/login`
- Acessar `/admin` logado como customer redireciona para `/`
- Para testar admin: alterar manualmente `role = 'admin'` no Supabase para um usuário
- Acessar `/admin` como admin permite o acesso (mesmo que a página ainda não exista)

---

## Checklist de conclusão da sprint

- [ ] `npm run dev` e `npm run build` funcionam sem erros nem warnings
- [ ] Home implementada idêntica ao design fornecido
- [ ] Cadastro cria usuário + profile automaticamente
- [ ] Login persiste sessão entre reloads
- [ ] Logout funciona e atualiza UI
- [ ] Middleware protege `/conta`, `/checkout` e `/admin`
- [ ] RLS ativo em todas as tabelas
- [ ] `.env.example` atualizado e `.env.local` ignorado pelo Git

---

## Dependências e ordem

```
1.1 (setup)
  ↓
1.2 (Home) ←─ pode ser paralelo a 1.3
1.3 (Supabase clients)
  ↓
1.4 (schema)
  ↓
1.5 (auth pages) ─→ 1.6 (middleware)
```

Recomendo executar nesta ordem: 1.1 → 1.3 → 1.4 → 1.2 → 1.5 → 1.6.

---

## Notas técnicas

- **Não criar uma tabela `users` própria.** Use `auth.users` do Supabase + tabela `profiles`.
- **Preços sempre em centavos** (`price_cents: integer`). Float em valores monetários sempre dá problema.
- **Slugs únicos** garantidos pelo banco (`unique`). Gerar slug a partir do nome com `slugify` quando criar produto.
- **Imagens dos produtos** ficam em tabela separada (`product_images`). Um produto pode ter várias fotos.
- **Endereços separados** do profile permitem que o usuário tenha múltiplos endereços (casa, trabalho).
