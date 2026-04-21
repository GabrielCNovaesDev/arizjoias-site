import { ProductCard } from './ProductCard';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  columns?: 2 | 3 | 4;
}

const colClasses = {
  2: 'grid-cols-2',
  3: 'grid-cols-2 md:grid-cols-3',
  4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
};

export function ProductGrid({ products, columns = 4 }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-3xl font-light text-[var(--sage)] opacity-50">
          Nenhuma joia encontrada
        </p>
        <p className="font-body text-sm opacity-40 mt-3">
          Tente ajustar os filtros para ver mais resultados
        </p>
      </div>
    );
  }

  return (
    <div className={`grid ${colClasses[columns]} gap-x-6 gap-y-12`}>
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}
