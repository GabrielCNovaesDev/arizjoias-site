'use client';

import { useState, useEffect, useCallback } from 'react';

const FAV_KEY = 'ariz_favorites';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]') as string[];
      setFavorites(stored);
    } catch {
      setFavorites([]);
    }
  }, []);

  const toggle = useCallback((productId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem(FAV_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (productId: string) => favorites.includes(productId),
    [favorites]
  );

  return { favorites, toggle, isFavorite };
}
