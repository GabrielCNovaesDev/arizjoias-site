'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart-store';

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  alt?: string;
  tag?: string | null;
}

interface ProductCardProps {
  product: ProductCardData;
  priority?: boolean;
}

const formatBRL = (n: number) => 'R$ ' + n.toFixed(2).replace('.', ',');

const IconHeart = ({ filled = false }: { filled?: boolean }) => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
    <path d="M12 20s-7-4.5-7-10.2A4.3 4.3 0 0 1 12 6.5a4.3 4.3 0 0 1 7 3.3C19 15.5 12 20 12 20Z" />
  </svg>
);

const IconArrowRight = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
  </svg>
);

const TAG_COLORS: Record<string, string> = {
  novo: 'var(--color-sage)',
  exclusivo: 'var(--color-gold)',
  'mais amado': 'var(--color-primary-dark)',
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [hover, setHover] = useState(false);
  const [fav, setFav] = useState(false);
  const [justFav, setJustFav] = useState(false);

  const tagColor = product.tag ? (TAG_COLORS[product.tag] ?? 'var(--color-sage)') : null;

  function handleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setFav((v) => !v);
    setJustFav(true);
    setTimeout(() => setJustFav(false), 500);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id);
  }

  return (
    <article
      style={{ background: 'transparent', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 14 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Link href={`/produto/${product.slug}`} style={{ display: 'block' }}>
        <div
          style={{
            position: 'relative',
            background: 'var(--color-surface)',
            aspectRatio: '1 / 1.15',
            overflow: 'hidden',
            borderRadius: 2,
          }}
        >
          {/* Main image */}
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            style={{
              transition: 'transform 0.8s cubic-bezier(.2,.7,.3,1), opacity 0.4s',
              transform: hover ? 'scale(1.04)' : 'scale(1)',
              opacity: hover && product.alt ? 0 : 1,
            }}
            priority={priority}
          />

          {/* Alt image on hover */}
          {product.alt && (
            <Image
              src={product.alt}
              alt={`${product.name} — vista alternativa`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover"
              style={{
                position: 'absolute',
                inset: 0,
                transition: 'opacity 0.4s',
                opacity: hover ? 1 : 0,
              }}
            />
          )}

          {/* Tag badge */}
          {product.tag && tagColor && (
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 14,
                background: 'var(--color-bg)',
                color: tagColor,
                fontFamily: 'var(--font-body)',
                fontSize: 9,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                fontWeight: 500,
                padding: '6px 10px',
                border: `1px solid ${tagColor}`,
              }}
            >
              {product.tag}
            </div>
          )}

          {/* Heart button */}
          <button
            onClick={handleFav}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'var(--color-bg)',
              border: 'none',
              width: 34,
              height: 34,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: fav ? 'var(--color-sage-dark)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'color .2s',
            }}
            aria-label={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          >
            <span className={justFav ? 'az-heart-pulse' : ''} style={{ display: 'flex' }}>
              <IconHeart filled={fav} />
            </span>
          </button>

          {/* Quick add */}
          <button
            onClick={handleAddToCart}
            style={{
              position: 'absolute',
              left: 14,
              right: 14,
              bottom: 14,
              background: 'var(--color-text)',
              color: 'var(--color-text-on-dark)',
              border: 'none',
              padding: '11px 12px',
              fontFamily: 'var(--font-body)',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 400,
              cursor: 'pointer',
              transform: hover ? 'translateY(0)' : 'translateY(6px)',
              opacity: hover ? 1 : 0,
              transition: 'all 0.35s cubic-bezier(.2,.7,.3,1)',
            }}
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            Adicionar
          </button>
        </div>

        {/* Product info */}
        <div style={{ padding: '0 2px', display: 'flex', flexDirection: 'column', gap: 5, marginTop: 14 }}>
          <div style={{ fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-text-light)' }}>
            {product.category}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17,
              fontWeight: 400,
              color: 'var(--color-text)',
              letterSpacing: '0.005em',
              lineHeight: 1.2,
            }}
          >
            {product.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 2 }}>
            <span className="az-price" style={{ fontSize: 13 }}>{formatBRL(product.price)}</span>
            {product.oldPrice && (
              <span style={{ fontSize: 11, color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                {formatBRL(product.oldPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
