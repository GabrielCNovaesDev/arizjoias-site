import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductCard } from '@/components/product/ProductCard';
import { productRepository } from '@/lib/db';
import { AddToCartSection } from './AddToCartSection';

const MATERIAL_LABELS: Record<string, string> = {
  'ouro-18k': 'Ouro 18k',
  prata: 'Prata 925',
  'banhado-ouro': 'Banho de Ouro 18k',
  'banhado-rosegold': 'Banho Rosé Gold',
};

const CATEGORY_LABELS: Record<string, string> = {
  aneis: 'Anéis',
  colares: 'Colares',
  brincos: 'Brincos',
  pulseiras: 'Pulseiras',
  sets: 'Sets',
};

export async function generateStaticParams() {
  return productRepository.findAll().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = productRepository.findById(id);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = productRepository.findById(id);
  if (!product) notFound();

  const related = productRepository
    .findByCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const formatPrice = (p: number) =>
    p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <MainLayout>
      {/* Breadcrumb */}
      <div className="px-6 lg:px-12 pt-8 pb-4" style={{ backgroundColor: 'var(--cream-light)' }}>
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 font-body text-xs tracking-wide opacity-50">
            <Link href="/" className="hover:opacity-100 transition-opacity">Início</Link>
            <span>/</span>
            <Link href="/catalog" className="hover:opacity-100 transition-opacity">Catálogo</Link>
            <span>/</span>
            <Link href={`/catalog?category=${product.category}`} className="hover:opacity-100 transition-opacity">
              {CATEGORY_LABELS[product.category]}
            </Link>
            <span>/</span>
            <span className="opacity-100">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product detail */}
      <section className="py-12 px-6 lg:px-12" style={{ backgroundColor: 'var(--warm-white)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Gallery */}
            <ProductGallery images={product.images} productName={product.name} />

            {/* Info */}
            <div className="flex flex-col justify-center">
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {product.featured && (
                  <span
                    className="px-3 py-1 font-body text-[10px] tracking-widest uppercase"
                    style={{ backgroundColor: 'var(--gold)', color: 'var(--warm-white)' }}
                  >
                    Destaque
                  </span>
                )}
                {product.originalPrice && (
                  <span
                    className="px-3 py-1 font-body text-[10px] tracking-widest uppercase"
                    style={{ backgroundColor: 'var(--sage)', color: 'var(--cream-light)' }}
                  >
                    Oferta
                  </span>
                )}
              </div>

              <h1 className="font-display text-4xl md:text-5xl font-light mb-3" style={{ color: 'var(--charcoal)' }}>
                {product.name}
              </h1>

              <p className="font-body text-xs tracking-[0.15em] uppercase mb-6 opacity-50">
                {MATERIAL_LABELS[product.material]} · {CATEGORY_LABELS[product.category]}
              </p>

              {/* Price */}
              <div className="flex items-end gap-4 mb-8">
                <span className="font-display text-4xl font-light" style={{ color: 'var(--sage)' }}>
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="font-body text-xl line-through opacity-40 mb-1">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              <div className="h-px mb-8" style={{ backgroundColor: 'var(--cream-dark)' }} />

              {/* Description */}
              <p className="font-body font-light leading-relaxed mb-8 opacity-70">
                {product.description}
              </p>

              {/* Add to cart — client component */}
              <AddToCartSection product={product} />

              {/* Details */}
              <div className="mt-8 pt-8 border-t grid grid-cols-2 gap-4" style={{ borderColor: 'var(--cream-dark)' }}>
                {[
                  { label: 'Material', value: MATERIAL_LABELS[product.material] },
                  { label: 'Categoria', value: CATEGORY_LABELS[product.category] },
                  { label: 'Estoque', value: product.stock > 5 ? 'Disponível' : `Últimas ${product.stock} unidades` },
                  { label: 'Entrega', value: 'Frete grátis acima de R$ 299' },
                ].map((d) => (
                  <div key={d.label}>
                    <p className="font-body text-xs tracking-[0.1em] uppercase opacity-40 mb-1">{d.label}</p>
                    <p className="font-body text-sm font-light">{d.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section className="py-24 px-6 lg:px-12" style={{ backgroundColor: 'var(--cream-light)' }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <p className="font-body text-xs tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--sage-light)' }}>
                Você também pode gostar
              </p>
              <h2 className="font-display text-3xl font-light" style={{ color: 'var(--charcoal)' }}>
                Peças Relacionadas
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </MainLayout>
  );
}
