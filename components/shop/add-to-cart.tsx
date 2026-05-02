'use client';

import { useState } from 'react';
import { useCartStore, type CartItem } from '@/stores/cart-store';

interface AddToCartProps {
  product: Omit<CartItem, 'quantity'>;
}

export function AddToCart({ product }: AddToCartProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function decrement() {
    setQty((q) => Math.max(1, q - 1));
  }

  function increment() {
    setQty((q) => Math.min(product.maxStock, q + 1));
  }

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (product.maxStock === 0) {
    return (
      <button
        disabled
        className="az-btn az-btn-primary"
        style={{ opacity: 0.5, cursor: 'not-allowed' }}
      >
        Indisponível
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {/* Quantity */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: '1px solid var(--color-primary-dark)',
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={decrement}
          disabled={qty <= 1}
          style={{
            width: 36,
            height: 44,
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: qty <= 1 ? 'not-allowed' : 'pointer',
            color: qty <= 1 ? 'var(--color-text-light)' : 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
          }}
          aria-label="Diminuir quantidade"
        >
          −
        </button>
        <span
          style={{
            width: 36,
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
          }}
        >
          {qty}
        </span>
        <button
          type="button"
          onClick={increment}
          disabled={qty >= product.maxStock}
          style={{
            width: 36,
            height: 44,
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: qty >= product.maxStock ? 'not-allowed' : 'pointer',
            color:
              qty >= product.maxStock
                ? 'var(--color-text-light)'
                : 'var(--color-text-muted)',
            fontFamily: 'var(--font-body)',
          }}
          aria-label="Aumentar quantidade"
        >
          +
        </button>
      </div>

      {/* Add to cart */}
      <button
        type="button"
        onClick={handleAdd}
        className="az-btn az-btn-primary"
        style={{
          flex: 1,
          background: added ? 'var(--color-sage-dark)' : undefined,
          transition: 'background 0.3s',
        }}
        aria-label={`Adicionar ${product.name} ao carrinho`}
      >
        {added ? '✓ Adicionado' : 'Adicionar ao carrinho'}
      </button>
    </div>
  );
}
