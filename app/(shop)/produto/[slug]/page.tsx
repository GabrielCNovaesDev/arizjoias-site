import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProductCard, type ProductCardData } from '@/components/shop/product-card';
import { ProductGallery } from '@/components/shop/product-gallery';
import { centsToReais } from '@/lib/utils/currency';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProdutoPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(id, name, slug), product_images(url, alt_text, display_order)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!product) notFound();

  const sortedImages = [...(product.product_images ?? [])].sort(
    (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
  );

  const category = product.categories as { id: string; name: string; slug: string } | null;

  // Related products (same category, different product)
  const { data: related } = category
    ? await supabase
        .from('products')
        .select('id, slug, name, price_cents, promotional_price_cents, categories(name), product_images(url, alt_text, display_order)')
        .eq('category_id', category.id)
        .eq('is_active', true)
        .neq('id', product.id)
        .limit(4)
    : { data: [] };

  function toCard(p: {
    id: string;
    slug: string;
    name: string;
    price_cents: number;
    promotional_price_cents: number | null;
    categories: { name: string } | null;
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

  const hasPromo = !!product.promotional_price_cents;
  const displayPrice = hasPromo ? product.promotional_price_cents! : product.price_cents;
  const originalPrice = hasPromo ? product.price_cents : null;

  return (
    <div style={{ background: 'var(--color-bg)' }}>
      {/* Breadcrumb */}
      <div style={{ padding: '20px 48px', borderBottom: '1px solid var(--color-primary)', display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: 'var(--color-text-light)', letterSpacing: '0.1em' }}>
        <Link href="/" style={{ color: 'var(--color-text-light)' }}>Home</Link>
        <span>/</span>
        <Link href="/catalogo" style={{ color: 'var(--color-text-light)' }}>Catálogo</Link>
        {category && (
          <>
            <span>/</span>
            <Link href={`/catalogo?categoria=${category.slug}`} style={{ color: 'var(--color-text-light)' }}>
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span style={{ color: 'var(--color-text-muted)' }}>{product.name}</span>
      </div>

      {/* Main product section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, padding: '56px 48px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Gallery */}
        <ProductGallery images={sortedImages} productName={product.name} />

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {category && (
            <div className="az-eyebrow">{category.name}</div>
          )}

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 300, margin: 0, lineHeight: 1.05 }}>
            {product.name}
          </h1>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span className="az-price" style={{ fontSize: 24 }}>{centsToReais(displayPrice)}</span>
            {originalPrice && (
              <span style={{ fontSize: 16, color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                {centsToReais(originalPrice)}
              </span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--color-text-light)', letterSpacing: '0.08em' }}>
            em até 6x sem juros
          </div>

          {/* Description */}
          {product.description && (
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.8, margin: 0 }}>
              {product.description}
            </p>
          )}

          {/* Material */}
          {product.material && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-text-light)' }}>Material</span>
              <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{product.material}</span>
            </div>
          )}

          {/* Stock */}
          <div style={{ fontSize: 12, color: product.stock > 0 ? 'var(--color-sage-dark)' : '#b91c1c' }}>
            {product.stock > 0 ? `${product.stock} em estoque` : 'Fora de estoque'}
          </div>

          {/* Quantity + Add to cart (placeholder) */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-primary-dark)' }}>
              <button style={{ width: 36, height: 44, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--color-text-muted)' }}>−</button>
              <span style={{ width: 36, textAlign: 'center', fontSize: 13 }}>1</span>
              <button style={{ width: 36, height: 44, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--color-text-muted)' }}>+</button>
            </div>
            <button
              disabled={product.stock === 0}
              className="az-btn az-btn-primary"
              style={{ flex: 1, opacity: product.stock === 0 ? 0.5 : 1, cursor: product.stock === 0 ? 'not-allowed' : 'pointer' }}
            >
              {product.stock === 0 ? 'Indisponível' : 'Adicionar ao carrinho'}
            </button>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 16, borderTop: '1px solid var(--color-primary)', marginTop: 8 }}>
            {[
              'Entrega em até 3 dias úteis',
              'Garantia vitalícia contra defeito',
              'Trocas em 30 dias sem perguntas',
            ].map((t) => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
                <span style={{ color: 'var(--color-sage)', fontSize: 14 }}>✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related products */}
      {related && related.length > 0 && (
        <section style={{ padding: '64px 48px 96px', borderTop: '1px solid var(--color-primary)' }}>
          <div style={{ marginBottom: 36 }}>
            <div className="az-eyebrow" style={{ marginBottom: 10 }}>você também pode gostar</div>
            <h2 className="az-display" style={{ fontSize: 36, fontWeight: 300, margin: 0 }}>
              Da mesma <em className="az-display-italic">coleção</em>
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28 }}>
            {related.map((p) => (
              <ProductCard key={p.id} product={toCard(p)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
