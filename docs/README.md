# Ariz Joias — Marketplace

> Documento de contexto permanente do projeto. **Cole este arquivo no início de toda sessão nova do Claude Code** antes de pedir qualquer tarefa.

---

## 1. Visão geral

Ariz Joias é um e-commerce (loja única, não marketplace multi-vendedor) de joias semi-finas. A cliente atual vende por Instagram e WhatsApp e quer um site profissional para receber pedidos com pagamento online, cálculo automático de frete e gestão própria do catálogo.

O projeto é desenvolvido por uma única pessoa (o gestor) usando Claude Code como executor principal e Claude.ai como arquiteto/revisor.

---

## 2. Stack técnica definitiva

| Camada | Tecnologia | Justificativa |
|--------|-----------|---------------|
| Framework | **Next.js 15 (App Router)** | Frontend e backend no mesmo projeto, um único `npm run dev`, deploy unificado |
| Linguagem | **TypeScript** | Tipagem estrita em todo o projeto |
| Estilização | **Tailwind CSS** | Já é o padrão do design fornecido |
| Banco de dados | **PostgreSQL via Supabase** | Hospedado, gratuito até 500MB, dashboard visual |
| Autenticação | **Supabase Auth** | Cookies de sessão nativos no Next.js, integrado ao banco |
| Storage de imagens | **Supabase Storage** | Mesmo provedor do banco, simplifica a stack |
| Estado global do carrinho | **Zustand** | Mais leve que Redux, suficiente para o escopo |
| Pagamento | **Mercado Pago** | PIX nativo, fácil aprovação para PJ no Brasil |
| Frete | **Melhor Envio** | Agrega Correios, JadLog, Total Express em uma API |
| CEP | **ViaCEP** | API gratuita brasileira para autocomplete de endereço |
| E-mail transacional | **Resend** + **React Email** | 3.000 e-mails/mês grátis, templates em React |
| Deploy | **Vercel** | Integração nativa com Next.js, CI/CD automático |

**Não usamos:** backend separado (Express/Fastify), banco em memória, Redis, Docker, monorepo, microserviços. Tudo é um único projeto Next.js.

---

## 3. Estrutura de pastas

```
ariz-joias/
├── app/
│   ├── layout.tsx                   # Layout raiz com header e footer
│   ├── page.tsx                     # Home
│   ├── globals.css                  # CSS global e variáveis de tema
│   ├── (shop)/                      # Rotas da loja (sem prefixo na URL)
│   │   ├── catalogo/
│   │   ├── produto/[slug]/
│   │   ├── carrinho/
│   │   ├── checkout/
│   │   └── pedido/[id]/
│   ├── (auth)/
│   │   ├── login/
│   │   └── cadastro/
│   ├── conta/                       # Área do cliente logado
│   │   ├── pedidos/
│   │   └── enderecos/
│   ├── admin/                       # Painel da Ariz (role admin)
│   │   ├── produtos/
│   │   ├── categorias/
│   │   ├── pedidos/
│   │   ├── promocoes/
│   │   └── relatorios/
│   └── api/
│       ├── products/
│       ├── orders/
│       ├── checkout/
│       ├── shipping/
│       └── webhooks/
│           └── mercadopago/
├── components/
│   ├── ui/                          # Botão, Input, Card (átomos)
│   ├── shop/                        # ProductCard, CartItem, etc.
│   └── admin/                       # Tabelas e formulários do admin
├── lib/
│   ├── supabase/                    # Clientes (browser e server)
│   ├── mercadopago/
│   ├── melhor-envio/
│   ├── resend/
│   └── utils/
├── stores/
│   └── cart-store.ts                # Zustand
├── types/
│   └── database.ts                  # Tipos gerados pelo Supabase
├── middleware.ts                    # Proteção de rotas
└── .env.local                       # Variáveis (NÃO commitar)
```

---

## 4. Convenções de código

**Nomenclatura de arquivos:** `kebab-case` (ex: `product-card.tsx`).
**Componentes React:** `PascalCase` no nome do componente (ex: `export function ProductCard()`).
**Funções e variáveis:** `camelCase`.
**Tipos e interfaces:** `PascalCase`. Prefixo `T` apenas para tipos genéricos (`TResult`).
**Constantes globais:** `SCREAMING_SNAKE_CASE`.

**Server Components por padrão.** Use `"use client"` apenas quando precisar de hooks, eventos ou estado.

**Server Actions ou Route Handlers?** Use Route Handlers (`/app/api/...`) para chamadas externas (frontend → backend). Use Server Actions para mutações simples diretas dentro de componentes.

**Sem `console.log` em código de produção.** Use comentários `// TODO:` em vez de TODOs em logs.

**Comentários:** apenas quando o "porquê" não é óbvio pelo código. Não comentar o "o quê".

**Imports absolutos:** sempre via `@/` configurado no `tsconfig.json`. Nunca `../../../`.

---

## 5. Design System (origem visual do projeto)

O design completo da Home foi gerado pelo Claude Design. Para implementar qualquer tela visual, **o Claude Code deve primeiro buscar e ler o design** com o seguinte comando:

```
Fetch this design file, read its readme, and implement the relevant aspects of the design.
https://api.anthropic.com/v1/design/h/qhUSr57JBtoyBuWQk6SLHA?open_file=Preview.html
Implement: Preview.html
```

A partir desse design, extrair:

- **Paleta de cores** → variáveis CSS em `app/globals.css`
- **Tipografia** → `font-family` e escala de tamanhos no `tailwind.config.ts`
- **Espaçamentos e radius** → padronizar via Tailwind
- **Componentes visuais** (botão, card, header, footer) → criar em `components/ui/`

**Para telas que ainda não foram desenhadas (catálogo, produto, carrinho, checkout, admin):** seguir o mesmo design system extraído da Home. Nunca improvisar cores, tipografias ou espaçamentos diferentes.

---

## 6. Variáveis de ambiente

Todas as variáveis ficam em `.env.local` (nunca commitado). O arquivo `.env.example` deve listar todas com valores dummy.

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # Apenas no servidor, NUNCA expor

# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN=
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=
MERCADO_PAGO_WEBHOOK_SECRET=

# Melhor Envio
MELHOR_ENVIO_TOKEN=
MELHOR_ENVIO_CEP_ORIGEM=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=pedidos@arizjoias.com.br

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Regra de segurança:** prefixo `NEXT_PUBLIC_` torna a variável visível no navegador. Use APENAS para chaves públicas (anon key do Supabase, public key do Mercado Pago). Tudo que é secreto fica sem o prefixo.

---

## 7. Fluxo de trabalho com Claude Code

1. Sempre começar uma sessão colando este README Geral.
2. Em seguida, colar o README da Sprint atual (`SPRINT-N.md`).
3. Pedir UMA tarefa por vez (ex: "Implemente a TASK-1.2").
4. Após o Claude Code gerar o código, voltar ao Claude.ai com o resultado para revisão.
5. Aplicar as correções sugeridas em uma nova sessão do Claude Code se necessário.

---

## 8. O que NÃO fazer (regras absolutas)

- ❌ Não criar pastas `backend/` ou `server/` separadas. Backend vive em `/app/api`.
- ❌ Não usar Express, Fastify ou qualquer outro framework de backend.
- ❌ Não usar Prisma ou outro ORM. Os clientes do Supabase já fazem o trabalho.
- ❌ Não usar JWT customizado. Sessão é via Supabase Auth.
- ❌ Não persistir senhas. Supabase Auth cuida disso.
- ❌ Não criar páginas em inglês. URLs e textos visíveis em português brasileiro.
- ❌ Não inventar telas que não estão no design sem antes alinhar visualmente.
- ❌ Não fazer chamadas a serviços externos (Mercado Pago, Melhor Envio) do client-side. Sempre via Route Handler.

---

## 9. Critério de "pronto" para qualquer tarefa

Uma tarefa só é considerada concluída quando:

1. O código TypeScript compila sem warnings (`npm run build`)
2. O ESLint passa sem erros
3. A funcionalidade foi testada manualmente no navegador
4. Variáveis de ambiente novas foram adicionadas ao `.env.example`
5. Se houver mudança no banco, o SQL foi documentado em `docs/migrations/`

---

## 10. Roadmap em sprints

| Sprint | Foco | Duração |
|--------|------|---------|
| 1 | Fundação: Supabase + Auth + estrutura base | 2 semanas |
| 2 | Painel admin: produtos e categorias | 2 semanas |
| 3 | Carrinho persistente + cálculo de frete | 2 semanas |
| 4 | Pagamento Mercado Pago + sistema de pedidos | 2 semanas |
| 5 | **MVP** — Deploy + e-mails transacionais | 2 semanas |
| 6 | Promoções, cupons e lista de desejos | 2 semanas |
| 7 | Avaliações, busca e SEO | 2 semanas |
| 8 | Performance, analytics e LGPD | 2 semanas |

Total: ~16 semanas até o produto completo. MVP funcional e vendendo na semana 10.
