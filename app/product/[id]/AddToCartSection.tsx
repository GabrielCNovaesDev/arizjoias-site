'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useFavorites } from '@/hooks/useFavorites';
import type { Product } from '@/types';

interface AddToCartSectionProps {
  product: Product;
}

export function AddToCartSection({ product }: AddToCartSectionProps) {
  const { addItem } = useCart();
  const { toggle, isFavorite } = useFavorites();
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes?.[0]
  );
  const [added, setAdded] = useState(false);

  const fav = isFavorite(product.id);

  function handleAdd() {
    addItem(product.id, 1, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Size selector */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <p className="font-body text-xs tracking-[0.12em] uppercase mb-3 opacity-60">
            Tamanho
          </p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSize(s)}
                className={`w-10 h-10 font-body text-sm transition-all duration-200 ${
                  selectedSize === s
                    ? 'border-2'
                    : 'border opacity-50 hover:opacity-100'
                }`}
                style={{
                  borderColor: selectedSize === s ? 'var(--sage)' : 'var(--cream-dark)',
                  color: selectedSize === s ? 'var(--sage)' : 'var(--charcoal)',
                  backgroundColor: selectedSize === s ? 'rgba(92,107,80,0.05)' : 'transparent',
                }}
                aria-pressed={selectedSize === s}
                aria-label={`Tamanho ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="btn-primary flex-1 justify-center"
        >
          {added ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Adicionado ao Carrinho
            </>
          ) : product.stock === 0 ? (
            'Esgotado'
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              Adicionar ao Carrinho
            </>
          )}
        </button>

        <button
          onClick={() => toggle(product.id)}
          className="btn-outline px-5"
          aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={fav ? 'var(--sage)' : 'none'}
            stroke="var(--sage)"
            strokeWidth="1.5"
          >
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
      </div>

      {product.stock > 0 && product.stock <= 5 && (
        <p className="font-body text-xs" style={{ color: 'var(--rosegold)' }}>
          Apenas {product.stock} unidade{product.stock !== 1 ? 's' : ''} disponível!
        </p>
      )}
    </div>
  );
}
