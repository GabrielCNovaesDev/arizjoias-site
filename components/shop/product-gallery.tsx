'use client';

import { useState } from 'react';
import Image from 'next/image';

interface GalleryImage {
  url: string;
  alt_text?: string | null;
}

interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div
        style={{
          aspectRatio: '1 / 1.1',
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-light)',
          fontSize: 12,
        }}
      >
        Sem imagem
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Main image */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '1 / 1.1',
          background: 'var(--color-surface)',
          overflow: 'hidden',
        }}
      >
        <Image
          src={images[active].url}
          alt={images[active].alt_text ?? productName}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                width: 72,
                height: 80,
                position: 'relative',
                background: 'var(--color-surface)',
                border: `2px solid ${i === active ? 'var(--color-sage)' : 'transparent'}`,
                padding: 0,
                cursor: 'pointer',
                overflow: 'hidden',
                flexShrink: 0,
                transition: 'border-color 0.2s',
              }}
              aria-label={`Ver imagem ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt_text ?? `${productName} — imagem ${i + 1}`}
                fill
                className="object-cover"
                sizes="72px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
