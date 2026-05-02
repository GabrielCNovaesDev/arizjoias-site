# Sprint 3 — Carrinho persistente e cálculo de frete

> **Duração:** Semanas 5–6
> **Objetivo:** Carrinho funcional com persistência, integração ViaCEP e cálculo de frete via Melhor Envio.
> **Entregável ao final:** O cliente adiciona produtos ao carrinho, o carrinho persiste entre sessões, e ao informar o CEP vê opções de frete com preço e prazo.

---

## Contexto para a IA

Esta sprint conecta o catálogo ao checkout. Não tem pagamento ainda — esse fica na Sprint 4. O foco aqui é: o cliente consegue montar o pedido até o ponto onde só falta pagar.

**Pré-requisito:** Sprints 1 e 2 100% concluídas. Produtos cadastrados com peso e dimensões.

**Conta no Melhor Envio:** o gestor precisa criar conta em [melhorenvio.com.br](https://melhorenvio.com.br) antes desta sprint, fazer cadastro de empresa e gerar token de API no painel deles.

---

## Tarefas

### TASK-3.1 — Estado global do carrinho com Zustand

**Tipo:** Implementação de estado

#### O que fazer

1. Criar `stores/cart-store.ts`:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string;
  priceCents: number;
  quantity: number;
  weightGrams: number;
  // dimensões necessárias para cálculo de frete
  widthCm: number;
  heightCm: number;
  lengthCm: number;
  maxStock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  getSubtotalCents: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item, quantity = 1) => set((state) => {
        const existing = state.items.find(i => i.productId === item.productId);
        if (existing) {
          const newQty = Math.min(existing.quantity + quantity, item.maxStock);
          return {
            items: state.items.map(i =>
              i.productId === item.productId ? { ...i, quantity: newQty } : i
            )
          };
        }
        return { items: [...state.items, { ...item, quantity: Math.min(quantity, item.maxStock) }] };
      }),

      removeItem: (productId) => set((state) => ({
        items: state.items.filter(i => i.productId !== productId)
      })),

      updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map(i =>
          i.productId === productId
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
            : i
        )
      })),

      clear: () => set({ items: [] }),

      getSubtotalCents: () => get().items.reduce(
        (sum, item) => sum + item.priceCents * item.quantity, 0
      ),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "ariz-cart" }
  )
);
```

2. Atualizar `components/shop/header.tsx`:
   - Mostrar contador de itens no ícone do carrinho usando `useCartStore`
   - O contador atualiza em tempo real

3. Atualizar `app/(shop)/produto/[slug]/page.tsx`:
   - Botão "Adicionar ao carrinho" agora chama `addItem`
   - Mostra toast de confirmação após adicionar
   - Validação: não permite quantidade maior que estoque

#### Definição de pronto

- Adicionar produto ao carrinho funciona e persiste após reload
- Contador no header atualiza imediatamente
- Limites de estoque respeitados
- Persistência via localStorage funciona em navegação anônima

---

### TASK-3.2 — Página do carrinho

**Tipo:** Implementação de UI

#### O que fazer

Criar `app/(shop)/carrinho/page.tsx`:

- Lista de itens com: imagem, nome, preço unitário, controle de quantidade (+/-), preço total do item, botão de remover
- Subtotal calculado em tempo real
- Campo para CEP com botão "Calcular frete" (preenchido na TASK-3.4)
- Campo para cupom (placeholder, será implementado na Sprint 6)
- Total geral
- Botão "Continuar comprando" e "Finalizar compra"
- Estado vazio: ícone, mensagem "Seu carrinho está vazio" e botão para o catálogo

#### Definição de pronto

- Quantidades ajustáveis com feedback visual imediato
- Remover item funciona com confirmação
- Subtotal recalcula automaticamente
- Estado vazio bem desenhado
- Botão "Finalizar compra" desabilitado se carrinho vazio ou sem CEP calculado

---

### TASK-3.3 — Integração ViaCEP

**Tipo:** Integração de API

#### O que fazer

1. Criar `lib/viacep.ts`:

```typescript
export interface AddressFromCep {
  zipCode: string;
  street: string;
  district: string;
  city: string;
  state: string;
}

export async function fetchAddressByCep(cep: string): Promise<AddressFromCep | null> {
  const cleaned = cep.replace(/\D/g, "");
  if (cleaned.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`, {
      next: { revalidate: 86400 }  // cache de 1 dia
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.erro) return null;

    return {
      zipCode: cleaned,
      street: data.logradouro || "",
      district: data.bairro || "",
      city: data.localidade || "",
      state: data.uf || "",
    };
  } catch {
    return null;
  }
}
```

2. Criar componente `components/shop/cep-input.tsx`:
   - Input com máscara `00000-000`
   - Após 8 dígitos, dispara busca automaticamente
   - Mostra spinner durante busca
   - Retorna o endereço via callback prop

3. Criar `app/api/shipping/lookup-cep/route.ts`:
```typescript
import { fetchAddressByCep } from "@/lib/viacep";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cep = searchParams.get("cep");

  if (!cep) return Response.json({ error: "CEP obrigatório" }, { status: 400 });

  const address = await fetchAddressByCep(cep);
  if (!address) return Response.json({ error: "CEP não encontrado" }, { status: 404 });

  return Response.json(address);
}
```

#### Definição de pronto

- Digitar CEP completo busca o endereço automaticamente
- CEP inválido mostra mensagem clara
- Cache de respostas (mesmo CEP não dispara nova request em curto prazo)
- Componente reutilizável (será usado também no checkout)

---

### TASK-3.4 — Integração Melhor Envio

**Tipo:** Integração de API

#### O que fazer

1. Adicionar variáveis de ambiente:
```
MELHOR_ENVIO_TOKEN=               # Bearer token gerado no painel deles
MELHOR_ENVIO_CEP_ORIGEM=          # CEP da Ariz (loja)
MELHOR_ENVIO_API_URL=https://melhorenvio.com.br/api/v2/me  # produção
# Para testes use: https://sandbox.melhorenvio.com.br/api/v2/me
```

2. Criar `lib/melhor-envio.ts`:

```typescript
export interface ShippingOption {
  id: number;
  name: string;            // "PAC", "Sedex", "JadLog"
  company: string;
  priceCents: number;
  deliveryDays: number;
  error?: string;
}

interface CartItemForShipping {
  weightGrams: number;
  widthCm: number;
  heightCm: number;
  lengthCm: number;
  priceCents: number;
  quantity: number;
}

export async function calculateShipping(
  destinationZipCode: string,
  items: CartItemForShipping[]
): Promise<ShippingOption[]> {
  const cleanedCep = destinationZipCode.replace(/\D/g, "");

  // Calcular pacote agregado: soma de pesos, dimensões da maior peça
  const totalWeightKg = items.reduce(
    (sum, i) => sum + (i.weightGrams * i.quantity) / 1000, 0
  );
  const totalValueCents = items.reduce(
    (sum, i) => sum + i.priceCents * i.quantity, 0
  );
  const maxWidth = Math.max(...items.map(i => i.widthCm));
  const maxHeight = Math.max(...items.map(i => i.heightCm));
  const totalLength = items.reduce((sum, i) => sum + i.lengthCm * i.quantity, 0);

  const payload = {
    from: { postal_code: process.env.MELHOR_ENVIO_CEP_ORIGEM!.replace(/\D/g, "") },
    to: { postal_code: cleanedCep },
    package: {
      height: Math.max(2, maxHeight),       // mínimo 2cm
      width: Math.max(11, maxWidth),        // mínimo 11cm exigido pelos Correios
      length: Math.max(16, totalLength),    // mínimo 16cm
      weight: Math.max(0.1, totalWeightKg), // mínimo 100g
    },
    options: {
      insurance_value: totalValueCents / 100,
      receipt: false,
      own_hand: false,
    },
    services: "1,2,3,4",  // Códigos: 1=PAC, 2=Sedex (consultar tabela do Melhor Envio)
  };

  const response = await fetch(
    `${process.env.MELHOR_ENVIO_API_URL}/shipment/calculate`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Ariz Joias contato@arizjoias.com.br",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Melhor Envio: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  return data
    .filter((opt: any) => !opt.error)
    .map((opt: any) => ({
      id: opt.id,
      name: opt.name,
      company: opt.company.name,
      priceCents: Math.round(parseFloat(opt.price) * 100),
      deliveryDays: opt.delivery_time,
    }));
}
```

3. Criar `app/api/shipping/calculate/route.ts`:

```typescript
import { calculateShipping } from "@/lib/melhor-envio";

export async function POST(request: Request) {
  try {
    const { zipCode, items } = await request.json();

    if (!zipCode || !items?.length) {
      return Response.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const options = await calculateShipping(zipCode, items);
    return Response.json({ options });
  } catch (error) {
    console.error("Shipping error:", error);
    return Response.json(
      { error: "Erro ao calcular frete. Tente novamente." },
      { status: 500 }
    );
  }
}
```

4. No componente do carrinho, ao calcular frete:
   - Chamar `/api/shipping/calculate` com o CEP e os itens
   - Listar as opções retornadas com radio buttons
   - Cliente seleciona a opção desejada
   - O total é atualizado: `subtotal + frete escolhido`

5. Salvar a opção escolhida no Zustand para usar no checkout:
```typescript
// adicionar ao cart-store.ts
selectedShipping: ShippingOption | null;
setShipping: (option: ShippingOption) => void;
```

#### Definição de pronto

- Calcular frete retorna opções reais do Melhor Envio
- Seleção de opção atualiza o total
- Erros da API são tratados e exibidos ao usuário
- Sandbox testado primeiro, produção configurada
- Frete grátis condicional (pré-config para Sprint 6) — por enquanto só calcula

---

### TASK-3.5 — Página de checkout (apenas dados de entrega)

**Tipo:** Implementação de UI + persistência

#### O que fazer

Criar `app/(shop)/checkout/page.tsx`:

1. Verificação inicial (Server Component):
   - Se não logado → redireciona para `/login?redirect=/checkout`
   - Se carrinho vazio → redireciona para `/carrinho`

2. Estrutura em etapas (steps visuais no topo):
   - **Etapa 1 — Endereço de entrega** (esta tarefa)
   - **Etapa 2 — Pagamento** (Sprint 4)
   - **Etapa 3 — Confirmação** (Sprint 4)

3. Etapa 1 mostra:
   - Endereços salvos (lista de cards selecionáveis)
   - Botão "+ Novo endereço"
   - Formulário inline para novo endereço com:
     - Nome do destinatário
     - CEP (componente `cep-input`)
     - Rua, número, complemento, bairro, cidade, estado (auto-preenchidos pelo CEP)
     - Checkbox "Salvar como endereço padrão"
   - Após selecionar/criar endereço, mostrar opções de frete (já calculadas no carrinho ou recalcular)
   - Botão "Continuar para pagamento" (desabilitado até endereço + frete selecionados)

4. Criar Server Action `saveAddress` em `app/(shop)/checkout/actions.ts`:
   - Insere novo endereço em `addresses`
   - Se `is_default`, desmarca outros endereços do mesmo usuário

#### Definição de pronto

- Endereços salvos do usuário aparecem listados
- Cadastrar novo endereço funciona com CEP autopreenchido
- Frete recalcula automaticamente quando endereço muda
- Continuar para pagamento desabilitado até dados completos
- Estado preservado se usuário recarregar a página (carrinho via Zustand persist)

---

## Checklist de conclusão da sprint

- [ ] Carrinho funcional com Zustand + persist
- [ ] Adicionar/remover/alterar quantidade funciona
- [ ] CEP autopreenche endereço via ViaCEP
- [ ] Cálculo de frete via Melhor Envio retorna opções reais
- [ ] Página de checkout etapa 1 (endereço) funcional
- [ ] Endereços salvos no perfil do usuário
- [ ] Estoque verificado antes de adicionar ao carrinho

---

## Dependências e ordem

```
3.1 (Zustand)
  ↓
3.2 (página carrinho) ─→ 3.3 (ViaCEP) ─→ 3.4 (Melhor Envio)
                                              ↓
                                          3.5 (checkout etapa 1)
```

---

## Notas técnicas

- **Frete sempre calculado no servidor.** Token do Melhor Envio nunca pode ir para o client.
- **Cache de cálculo de frete:** considerar cachear por 5 minutos no Redis/memória do servidor (mesmos itens + mesmo CEP). Para a Sprint 3, não é necessário.
- **Pacote agregado** é uma simplificação. Em produção, alguns marketplaces dividem em vários pacotes. Para a Ariz Joias (joias pequenas), agregar é razoável.
- **CEP de origem fixo** por enquanto. Se a Ariz mudar de endereço, atualiza-se a env var.
- **Sandbox do Melhor Envio:** teste todas as integrações lá antes de mover para produção.
