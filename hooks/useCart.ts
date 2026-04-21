'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CartItem } from '@/types';

const CART_KEY = 'ariz_cart';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) ?? '[]') as CartItem[];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(loadCart());
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    saveCart(next);
  }, []);

  const addItem = useCallback(
    (productId: string, quantity = 1, size?: string) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.productId === productId && i.size === size
        );
        let next: CartItem[];
        if (existing) {
          next = prev.map((i) =>
            i.productId === productId && i.size === size
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        } else {
          next = [...prev, { productId, quantity, size }];
        }
        saveCart(next);
        return next;
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, size?: string) => {
    setItems((prev) => {
      const next = prev.filter(
        (i) => !(i.productId === productId && i.size === size)
      );
      saveCart(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, size?: string) => {
      if (quantity <= 0) {
        removeItem(productId, size);
        return;
      }
      setItems((prev) => {
        const next = prev.map((i) =>
          i.productId === productId && i.size === size ? { ...i, quantity } : i
        );
        saveCart(next);
        return next;
      });
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return { items, addItem, removeItem, updateQuantity, clearCart, totalItems };
}
