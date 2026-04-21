'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selected, setSelected] = useState(0);

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-visible">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`flex-shrink-0 relative w-16 h-20 md:w-20 md:h-24 overflow-hidden transition-all duration-300 ${
              selected === i
                ? 'border border-[var(--sage)]'
                : 'border border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ backgroundColor: 'var(--cream-light)' }}
            aria-label={`Imagem ${i + 1} de ${productName}`}
          >
            <Image
              src={img}
              alt={`${productName} — foto ${i + 1}`}
              fill
              sizes="96px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div
        className="flex-1 relative aspect-[3/4] overflow-hidden"
        style={{ backgroundColor: 'var(--cream-light)' }}
      >
        {images.map((img, i) => (
          <Image
            key={i}
            src={img}
            alt={`${productName} — foto ${i + 1}`}
            fill
            priority={i === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`object-cover transition-opacity duration-500 ${
              selected === i ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
