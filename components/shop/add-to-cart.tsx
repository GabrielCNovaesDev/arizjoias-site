'use client';

import { useState } from 'react';
import { useCartStore } from '@/stores/cart-store';

interface AddToCartProps {
  productId: string;
  productName: string;
  stock: number;
}

export function AddToCart({ productId, productName, stock }: AddToCartProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  function decrement() {
    setQty((q) => Math.max(1, q - 1));
  }

  function increment() {
    setQty((q) => Math.min(stock, q + 1));
  }

  function handleAdd() {
    for (let i = 0; i < qty; i++) {
      addItem(productId);
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (stock === 0) {
    return (
      <button
        disabled
        className="az-btn az-btn-primary"
        style={{ opacity: 0.5, cursor: 'not-allowed', flex: 1 }}
      >
        Indisponível
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {/* Quantity */}
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-primary-dark)', flexShrink: 0 }}>
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
          disabled={qty >= stock}
          style={{
            width: 36,
            height: 44,
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: qty >= stock ? 'not-allowed' : 'pointer',
            color: qty >= stock ? 'var(--color-text-light)' : 'var(--color-text-muted)',
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
        style={{ flex: 1, background: added ? 'var(--color-sage-dark)' : undefined, transition: 'background 0.3s' }}
        aria-label={`Adicionar ${productName} ao carrinho`}
      >
        {added ? '✓ Adicionado' : 'Adicionar ao carrinho'}
      </button>
    </div>
  );
}
