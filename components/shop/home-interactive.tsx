'use client';

import Image from 'next/image';
import Link from 'next/link';

interface CategoryCardProps {
  name: string;
  img: string;
  count: number;
  slug: string;
  index: number;
}

export function CategoryCard({ name, img, count, slug, index }: CategoryCardProps) {
  return (
    <Link
      href={`/catalogo?categoria=${slug}`}
      className="az-reveal category-card"
      style={{ animationDelay: `${index * 0.08}s`, cursor: 'pointer', display: 'block' }}
    >
      <div style={{ position: 'relative', aspectRatio: '3 / 4', background: 'var(--color-surface)', overflow: 'hidden' }}>
        <Image
          src={img}
          alt={name}
          fill
          sizes="25vw"
          className="object-cover category-card-img"
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(44,35,32,0.4), transparent 50%)' }} />
        <div style={{ position: 'absolute', bottom: 24, left: 24, right: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, color: 'var(--color-bg)', fontWeight: 400, lineHeight: 1 }}>{name}</div>
          <div style={{ fontSize: 10, color: 'var(--color-bg)', opacity: 0.85, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 6 }}>{count} peças</div>
        </div>
      </div>
    </Link>
  );
}

interface InstagramGridProps {
  images: string[];
}

export function InstagramGrid({ images }: InstagramGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
      {images.map((src, i) => (
        <a
          key={i}
          href="https://instagram.com/arizjoias"
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-cell"
          style={{
            aspectRatio: '1/1',
            overflow: 'hidden',
            position: 'relative',
            display: 'block',
            background: 'var(--color-surface)',
          }}
          aria-label={`Post ${i + 1} no Instagram da Ariz Joias`}
        >
          <Image
            src={src}
            alt={`Instagram Ariz Joias — post ${i + 1}`}
            fill
            sizes="17vw"
            className="object-cover instagram-img"
          />
        </a>
      ))}
    </div>
  );
}
