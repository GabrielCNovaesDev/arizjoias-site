'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductGrid } from '@/components/product/ProductGrid';
import type { Product } from '@/types';

const CATEGORIES = [
  { value: '', label: 'Todos' },
  { value: 'aneis', label: 'Anéis' },
  { value: 'colares', label: 'Colares' },
  { value: 'brincos', label: 'Brincos' },
  { value: 'pulseiras', label: 'Pulseiras' },
  { value: 'sets', label: 'Sets' },
];

const MATERIALS = [
  { value: '', label: 'Todos os materiais' },
  { value: 'ouro-18k', label: 'Ouro 18k' },
  { value: 'prata', label: 'Prata 925' },
  { value: 'banhado-ouro', label: 'Banho de Ouro' },
  { value: 'banhado-rosegold', label: 'Banho Rosé Gold' },
];

const PRICE_RANGES = [
  { label: 'Todos os preços', min: undefined, max: undefined },
  { label: 'Até R$ 150', min: undefined, max: 150 },
  { label: 'R$ 150 – R$ 300', min: 150, max: 300 },
  { label: 'Acima de R$ 300', min: 300, max: undefined },
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') ?? '';
  const material = searchParams.get('material') ?? '';
  const search = searchParams.get('search') ?? '';
  const featured = searchParams.get('featured') === 'true';
  const priceIdx = Number(searchParams.get('price') ?? 0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (material) params.set('material', material);
    if (search) params.set('search', search);
    if (featured) params.set('featured', 'true');
    const range = PRICE_RANGES[priceIdx];
    if (range?.min !== undefined) params.set('minPrice', String(range.min));
    if (range?.max !== undefined) params.set('maxPrice', String(range.max));

    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }, [category, material, search, featured, priceIdx]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  function setParam(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    router.push(`/catalog?${p}`);
  }

  return (
    <MainLayout>
      {/* Page header */}
      <div className="py-16 px-6 lg:px-12 text-center" style={{ backgroundColor: 'var(--cream)' }}>
        <p className="font-body text-xs tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--sage-light)' }}>
          {featured ? 'Selecionados para você' : 'Todas as peças'}
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-light" style={{ color: 'var(--charcoal)' }}>
          {featured ? 'Peças em Destaque' : category ? CATEGORIES.find(c => c.value === category)?.label ?? 'Catálogo' : 'Catálogo Completo'}
        </h1>
        {products.length > 0 && !loading && (
          <p className="font-body text-sm opacity-50 mt-3">{products.length} peça{products.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar filters */}
          <aside className="lg:w-56 flex-shrink-0">
            {/* Search */}
            <div className="mb-8">
              <label className="block font-body text-xs tracking-[0.15em] uppercase mb-3" style={{ color: 'var(--sage)' }}>
                Buscar
              </label>
              <input
                type="search"
                placeholder="Nome, material..."
                defaultValue={search}
                className="input-elegant"
                onChange={(e) => {
                  const v = e.target.value;
                  if (v.length === 0 || v.length > 2) setParam('search', v);
                }}
                aria-label="Buscar produtos"
              />
            </div>

            {/* Category filter */}
            <div className="mb-8">
              <p className="font-body text-xs tracking-[0.15em] uppercase mb-4" style={{ color: 'var(--sage)' }}>
                Categoria
              </p>
              <div className="flex flex-col gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setParam('category', c.value)}
                    className={`text-left font-body text-sm py-1.5 transition-colors duration-200 ${
                      category === c.value ? 'font-medium' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ color: category === c.value ? 'var(--sage)' : 'var(--charcoal)' }}
                  >
                    {c.label}
                    {category === c.value && (
                      <span className="ml-2 inline-block w-4 h-px align-middle" style={{ backgroundColor: 'var(--gold)' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Material filter */}
            <div className="mb-8">
              <p className="font-body text-xs tracking-[0.15em] uppercase mb-4" style={{ color: 'var(--sage)' }}>
                Material
              </p>
              <div className="flex flex-col gap-2">
                {MATERIALS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setParam('material', m.value)}
                    className={`text-left font-body text-sm py-1.5 transition-colors duration-200 ${
                      material === m.value ? 'font-medium' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ color: material === m.value ? 'var(--sage)' : 'var(--charcoal)' }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price filter */}
            <div className="mb-8">
              <p className="font-body text-xs tracking-[0.15em] uppercase mb-4" style={{ color: 'var(--sage)' }}>
                Faixa de Preço
              </p>
              <div className="flex flex-col gap-2">
                {PRICE_RANGES.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setParam('price', i === 0 ? '' : String(i))}
                    className={`text-left font-body text-sm py-1.5 transition-colors duration-200 ${
                      priceIdx === i ? 'font-medium' : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{ color: priceIdx === i ? 'var(--sage)' : 'var(--charcoal)' }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear */}
            {(category || material || search || featured || priceIdx > 0) && (
              <button
                onClick={() => router.push('/catalog')}
                className="font-body text-xs tracking-[0.1em] uppercase opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: 'var(--sage)' }}
              >
                ✕ Limpar filtros
              </button>
            )}
          </aside>

          {/* Products */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="skeleton aspect-[3/4]" />
                    <div className="skeleton h-5 w-3/4" />
                    <div className="skeleton h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid products={products} columns={3} />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default function CatalogPage() {
  return (
    <Suspense>
      <CatalogContent />
    </Suspense>
  );
}
