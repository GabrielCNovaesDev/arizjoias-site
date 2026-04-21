'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

function formatPrice(price: number): string {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { toggle, isFavorite } = useFavorites();
  const { addItem } = useCart();
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const fav = isFavorite(product.id);
  const hasSecondImage = product.images.length > 1;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    toggle(product.id);
  }

  return (
    <article
      className="product-card group flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product/${product.id}`} className="block relative overflow-hidden aspect-[3/4] bg-[var(--cream-light)]">
        {/* Main image */}
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`product-card-img object-cover transition-opacity duration-500 ${
            hovered && hasSecondImage ? 'opacity-0' : 'opacity-100'
          }`}
          priority={priority}
        />

        {/* Second image on hover */}
        {hasSecondImage && (
          <Image
            src={product.images[1]}
            alt={`${product.name} — vista alternativa`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover absolute inset-0 transition-opacity duration-500 ${
              hovered ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.originalPrice && (
            <span
              className="px-2 py-0.5 font-body text-[10px] tracking-widest uppercase"
              style={{ backgroundColor: 'var(--sage)', color: 'var(--cream-light)' }}
            >
              Oferta
            </span>
          )}
          {product.featured && !product.originalPrice && (
            <span
              className="px-2 py-0.5 font-body text-[10px] tracking-widest uppercase"
              style={{ backgroundColor: 'var(--gold)', color: 'var(--warm-white)' }}
            >
              Destaque
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-3 right-3 w-8 h-8 flex items-center justify-center transition-all duration-300 ${
            hovered || fav ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundColor: 'rgba(250,248,245,0.85)',
            backdropFilter: 'blur(4px)',
          }}
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

        {/* Quick add overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
            hovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          }`}
          style={{ background: 'linear-gradient(to top, rgba(44,44,44,0.6), transparent)' }}
        >
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 font-body text-xs tracking-[0.12em] uppercase transition-all duration-200"
            style={{
              backgroundColor: added ? 'var(--sage)' : 'var(--cream-light)',
              color: added ? 'var(--cream-light)' : 'var(--sage)',
            }}
          >
            {added ? '✓ Adicionado' : 'Adicionar ao Carrinho'}
          </button>
        </div>
      </Link>

      {/* Product info */}
      <div className="pt-4 flex flex-col gap-1 flex-1">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-display text-lg font-light text-[var(--charcoal)] hover:text-[var(--sage)] transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>
        <p className="font-body text-xs tracking-[0.1em] uppercase opacity-50">
          {materialLabel(product.material)}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="font-display text-xl font-light" style={{ color: 'var(--sage)' }}>
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="font-body text-sm line-through opacity-40">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function materialLabel(m: string): string {
  const map: Record<string, string> = {
    'ouro-18k': 'Ouro 18k',
    prata: 'Prata 925',
    'banhado-ouro': 'Banho de Ouro',
    'banhado-rosegold': 'Banho Rosé Gold',
  };
  return map[m] ?? m;
}
