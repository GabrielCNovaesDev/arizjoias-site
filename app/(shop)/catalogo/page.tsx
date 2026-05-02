import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProductCard, type ProductCardData } from '@/components/shop/product-card';
import { centsToReais } from '@/lib/utils/currency';

interface Props {
  searchParams: Promise<{
    categoria?: string;
    'preco-min'?: string;
    'preco-max'?: string;
    material?: string;
    ordem?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 24;

export default async function CatalogoPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1');
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('display_order');

  let query = supabase
    .from('products')
    .select(
      'id, slug, name, price_cents, promotional_price_cents, material, category_id, categories(name, slug), product_images(url, alt_text, display_order)',
      { count: 'exact' }
    )
    .eq('is_active', true)
    .range(offset, offset + PAGE_SIZE - 1);

  if (params.categoria) {
    const cat = categories?.find((c) => c.slug === params.categoria);
    if (cat) query = query.eq('category_id', cat.id);
  }
  if (params['preco-min']) query = query.gte('price_cents', parseInt(params['preco-min']) * 100);
  if (params['preco-max']) query = query.lte('price_cents', parseInt(params['preco-max']) * 100);
  if (params.material) query = query.ilike('material', `%${params.material}%`);

  const ordem = params.ordem ?? 'recentes';
  if (ordem === 'menor-preco') query = query.order('price_cents', { ascending: true });
  else if (ordem === 'maior-preco') query = query.order('price_cents', { ascending: false });
  else query = query.order('created_at', { ascending: false });

  const { data: products, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function toCard(p: {
    id: string;
    slug: string;
    name: string;
    price_cents: number;
    promotional_price_cents: number | null;
    categories: { name: string; slug: string } | null;
    product_images: { url: string; alt_text: string | null; display_order: number }[];
  }): ProductCardData {
    const sorted = [...(p.product_images ?? [])].sort((a, b) => a.display_order - b.display_order);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: (p.categories as { name: string } | null)?.name ?? '',
      price: p.price_cents / 100,
      oldPrice: p.promotional_price_cents ? p.price_cents / 100 : undefined,
      image: sorted[0]?.url ?? '/assets/flower-pendant-set-model.png',
      alt: sorted[1]?.url,
    };
  }

  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged = { ...params, ...overrides };
    const clean = Object.fromEntries(
      Object.entries(merged).filter(([, v]) => v !== undefined && v !== '')
    ) as Record<string, string>;
    delete clean.page;
    return `/catalogo?${new URLSearchParams(clean)}`;
  }

  return (
    <div style={{ padding: '48px 48px 96px', background: 'var(--color-bg)', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div className="az-eyebrow" style={{ marginBottom: 12 }}>catálogo</div>
        <h1 className="az-display" style={{ fontSize: 52, fontWeight: 300, margin: 0 }}>
          {params.categoria
            ? categories?.find((c) => c.slug === params.categoria)?.name ?? 'Produtos'
            : 'Todas as peças'}
        </h1>
        {count !== null && (
          <p style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 8 }}>
            {count} produto{count !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 48, alignItems: 'start' }}>
        {/* Sidebar filters */}
        <aside>
          <form method="GET">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              {/* Categoria */}
              <div>
                <div className="az-eyebrow" style={{ marginBottom: 12 }}>Categoria</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <Link
                    href={buildUrl({ categoria: undefined })}
                    style={{
                      fontSize: 12,
                      color: !params.categoria ? 'var(--color-sage-dark)' : 'var(--color-text-muted)',
                      fontWeight: !params.categoria ? 500 : 300,
                    }}
                  >
                    Todas
                  </Link>
                  {categories?.map((c) => (
                    <Link
                      key={c.id}
                      href={buildUrl({ categoria: c.slug })}
                      style={{
                        fontSize: 12,
                        color: params.categoria === c.slug ? 'var(--color-sage-dark)' : 'var(--color-text-muted)',
                        fontWeight: params.categoria === c.slug ? 500 : 300,
                      }}
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Faixa de preço */}
              <div>
                <div className="az-eyebrow" style={{ marginBottom: 12 }}>Faixa de preço</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    name="preco-min"
                    type="number"
                    min={0}
                    defaultValue={params['preco-min'] ?? ''}
                    placeholder="Min"
                    style={{
                      width: 72,
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-primary-dark)',
                      padding: '6px 8px',
                      fontSize: 12,
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>—</span>
                  <input
                    name="preco-max"
                    type="number"
                    min={0}
                    defaultValue={params['preco-max'] ?? ''}
                    placeholder="Máx"
                    style={{
                      width: 72,
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-primary-dark)',
                      padding: '6px 8px',
                      fontSize: 12,
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                </div>
                {params.categoria && <input type="hidden" name="categoria" value={params.categoria} />}
                {params.ordem && <input type="hidden" name="ordem" value={params.ordem} />}
                <button
                  type="submit"
                  style={{
                    marginTop: 10,
                    background: 'none',
                    border: '1px solid var(--color-primary-dark)',
                    padding: '6px 14px',
                    fontSize: 10,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-body)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  Aplicar
                </button>
              </div>

              {/* Limpar filtros */}
              {(params.categoria || params['preco-min'] || params['preco-max'] || params.material) && (
                <Link
                  href="/catalogo"
                  style={{ fontSize: 11, color: 'var(--color-text-light)', letterSpacing: '0.1em', textTransform: 'uppercase' }}
                >
                  Limpar filtros
                </Link>
              )}
            </div>
          </form>
        </aside>

        {/* Product grid */}
        <div>
          {/* Sort */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24, gap: 8 }}>
            {[
              { value: 'recentes', label: 'Mais recentes' },
              { value: 'menor-preco', label: 'Menor preço' },
              { value: 'maior-preco', label: 'Maior preço' },
            ].map((o) => (
              <Link
                key={o.value}
                href={buildUrl({ ordem: o.value })}
                style={{
                  fontSize: 10,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  padding: '6px 12px',
                  border: `1px solid ${ordem === o.value ? 'var(--color-sage)' : 'var(--color-primary-dark)'}`,
                  color: ordem === o.value ? 'var(--color-sage-dark)' : 'var(--color-text-muted)',
                  background: ordem === o.value ? 'var(--color-sage-pale)' : 'transparent',
                }}
              >
                {o.label}
              </Link>
            ))}
          </div>

          {!products || products.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--color-text-light)' }}>
                Nenhum produto encontrado com esses filtros.
              </p>
              <Link href="/catalogo" className="az-btn-link" style={{ marginTop: 16, display: 'inline-flex' }}>
                Ver todos os produtos
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
              {products.map((p, i) => (
                <div key={p.id} className="az-reveal" style={{ animationDelay: `${i * 0.04}s` }}>
                  <ProductCard product={toCard(p)} priority={i < 3} />
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
              {page > 1 && (
                <Link
                  href={`${buildUrl({})}&page=${page - 1}`}
                  style={{ border: '1px solid var(--color-primary-dark)', padding: '8px 16px', fontSize: 11, color: 'var(--color-text-muted)' }}
                >
                  ← Anterior
                </Link>
              )}
              <span style={{ padding: '8px 16px', fontSize: 11, color: 'var(--color-text-light)' }}>
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`${buildUrl({})}&page=${page + 1}`}
                  style={{ border: '1px solid var(--color-primary-dark)', padding: '8px 16px', fontSize: 11, color: 'var(--color-text-muted)' }}
                >
                  Próxima →
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
