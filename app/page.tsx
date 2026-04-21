import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/product/ProductCard';
import { productRepository, reviewRepository } from '@/lib/db';

const categories = [
  {
    name: 'Anéis',
    slug: 'aneis',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80',
    description: 'Solitários, aparadores e alianças',
  },
  {
    name: 'Colares',
    slug: 'colares',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80',
    description: 'Gargantilhas, chokers e longos',
  },
  {
    name: 'Brincos',
    slug: 'brincos',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&q=80',
    description: 'Argolas, pontos de luz e ear cuffs',
  },
  {
    name: 'Pulseiras',
    slug: 'pulseiras',
    image: 'https://images.unsplash.com/photo-1573408301185-9519f94f0b4c?w=600&q=80',
    description: 'Riviera, elos e braceletes',
  },
  {
    name: 'Sets',
    slug: 'sets',
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=600&q=80',
    description: 'Conjuntos presenteáveis completos',
  },
];

const differentials = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    title: 'Qualidade Premium',
    text: 'Todas as peças passam por controle rigoroso de qualidade. Ouro 18k, prata 925 e banhos de alta durabilidade.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
    title: 'Embalagem Exclusiva',
    text: 'Cada joia é entregue em embalagem presenteável de luxo — perfeita para presentear ou se presentear.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: 'Entrega Rápida',
    text: 'Enviamos para todo o Brasil. Frete grátis acima de R$ 299 e entrega expressa disponível.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
    title: 'Feitas com Alma',
    text: 'Cada peça carrega a essência da Ariz Joias — leveza, feminilidade e sofisticação em cada detalhe.',
  },
];

export default function HomePage() {
  const featured = productRepository.findFeatured().slice(0, 4);
  const newArrivals = productRepository.findAll().slice(0, 8);
  const reviews = reviewRepository.findAll();

  return (
    <MainLayout>
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden grain-overlay">
        <Image
          src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1800&q=85"
          alt="Joias Ariz — coleção especial"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
          style={{ filter: 'brightness(0.82)' }}
        />
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(135deg, rgba(44,44,44,0.55) 0%, rgba(92,107,80,0.2) 60%, transparent 100%)',
          }}
        />
        <div className="relative z-20 h-full flex items-center px-8 md:px-16 lg:px-24">
          <div className="max-w-2xl">
            <p
              className="font-body text-xs tracking-[0.3em] uppercase mb-6 animate-fade-up"
              style={{ color: 'var(--cream-light)', opacity: 0.8 }}
            >
              Nova Coleção 2025
            </p>
            <h1
              className="font-display font-light leading-[1.1] mb-8 animate-fade-up animate-delay-100"
              style={{ color: 'var(--cream-light)', fontSize: 'clamp(2.8rem, 7vw, 6rem)' }}
            >
              Joias com
              <br />
              <em>Leveza</em> e Alma
            </h1>
            <p
              className="font-body font-light text-lg leading-relaxed mb-10 animate-fade-up animate-delay-200"
              style={{ color: 'rgba(242,237,233,0.85)', maxWidth: '480px' }}
            >
              Peças artesanais que traduzem elegância natural. Cada joia conta uma história de quem a usa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-up animate-delay-300">
              <Link href="/catalog" className="btn-primary">
                Explorar Coleção
              </Link>
              <Link
                href="/catalog?featured=true"
                className="font-body text-xs tracking-[0.12em] uppercase py-3.5 px-8 border inline-flex items-center gap-2 transition-all duration-300 hover:bg-white/10"
                style={{ color: 'var(--cream-light)', borderColor: 'rgba(242,237,233,0.5)' }}
              >
                Ver Destaques
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-float">
          <span className="font-body text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(242,237,233,0.5)' }}>
            Rolar
          </span>
          <div className="w-px h-12" style={{ background: 'linear-gradient(to bottom, rgba(242,237,233,0.5), transparent)' }} />
        </div>
      </section>

      {/* ── Gold divider ────────────────────────────────────────── */}
      <section className="py-6 px-6" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="divider-gold w-full max-w-xl">
            <span className="font-body text-[11px] tracking-[0.25em] uppercase whitespace-nowrap" style={{ color: 'var(--gold)' }}>
              Ariz Joias
            </span>
          </div>
        </div>
      </section>

      {/* ── Featured products ───────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12" style={{ backgroundColor: 'var(--warm-white)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--sage-light)' }}>
                Selecionados para você
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-light" style={{ color: 'var(--charcoal)' }}>
                Peças em Destaque
              </h2>
            </div>
            <Link href="/catalog?featured=true" className="btn-outline self-start md:self-auto">
              Ver todos
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 2} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Editorial banner ────────────────────────────────────── */}
      <section className="relative h-80 md:h-[500px] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=85"
          alt="Editorial Ariz Joias"
          fill
          sizes="100vw"
          className="object-cover object-top"
          style={{ filter: 'brightness(0.75)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(44,44,44,0.6) 0%, rgba(92,107,80,0.15) 100%)' }}
        />
        <div className="relative z-10 h-full flex items-center px-8 md:px-24">
          <div>
            <p className="font-body text-xs tracking-[0.25em] uppercase mb-4" style={{ color: 'var(--gold-light)' }}>
              Coleção Especial
            </p>
            <h2 className="font-display font-light text-4xl md:text-6xl mb-6" style={{ color: 'var(--cream-light)' }}>
              Sets Presenteáveis
            </h2>
            <p className="font-body font-light mb-8" style={{ color: 'rgba(242,237,233,0.8)', maxWidth: '380px' }}>
              Conjuntos completos em embalagem exclusiva. O presente perfeito para quem você ama.
            </p>
            <Link href="/catalog?category=sets" className="btn-gold">
              Explorar Sets
            </Link>
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12" style={{ backgroundColor: 'var(--cream-light)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-body text-xs tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--sage-light)' }}>
              Navegue por categoria
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light" style={{ color: 'var(--charcoal)' }}>
              Encontre sua Joia
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/catalog?category=${cat.slug}`}
                className="group relative overflow-hidden aspect-[3/4] block"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 50vw, 20vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  style={{ filter: 'brightness(0.7)' }}
                />
                <div
                  className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-100 opacity-0"
                  style={{ backgroundColor: 'rgba(92,107,80,0.35)' }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-end p-5">
                  <h3 className="font-display text-xl font-light" style={{ color: 'var(--cream-light)' }}>
                    {cat.name}
                  </h3>
                  <p className="font-body text-xs mt-1 opacity-80 text-center" style={{ color: 'var(--cream-light)' }}>
                    {cat.description}
                  </p>
                  <div
                    className="mt-3 h-px w-8 transition-all duration-300 group-hover:w-16"
                    style={{ backgroundColor: 'var(--gold)' }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── New arrivals ────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12" style={{ backgroundColor: 'var(--warm-white)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--sage-light)' }}>
                Acabaram de chegar
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-light" style={{ color: 'var(--charcoal)' }}>
                Novas Coleções
              </h2>
            </div>
            <Link href="/catalog" className="btn-outline self-start md:self-auto">
              Ver catálogo completo
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {newArrivals.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 4} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Differentials ───────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-body text-xs tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--sage-light)' }}>
              Por que escolher
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light" style={{ color: 'var(--charcoal)' }}>
              A Essência Ariz
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {differentials.map((d, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-5">
                <div style={{ color: 'var(--sage)' }}>{d.icon}</div>
                <h3 className="font-display text-xl font-light" style={{ color: 'var(--charcoal)' }}>
                  {d.title}
                </h3>
                <p className="font-body text-sm font-light leading-relaxed opacity-60">{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Reviews ─────────────────────────────────────────────── */}
      <section className="py-24 px-6 lg:px-12" style={{ backgroundColor: 'var(--warm-white)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-body text-xs tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--sage-light)' }}>
              Quem usa Ariz
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-light" style={{ color: 'var(--charcoal)' }}>
              O que dizem nossas clientes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-8 flex flex-col gap-4"
                style={{ backgroundColor: 'var(--cream-light)', border: '1px solid var(--cream-dark)' }}
              >
                <div className="flex gap-1">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="var(--gold)">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <p className="font-display text-lg font-light italic leading-relaxed" style={{ color: 'var(--charcoal)' }}>
                  &ldquo;{r.comment}&rdquo;
                </p>
                <div className="mt-auto pt-4 border-t" style={{ borderColor: 'var(--cream-dark)' }}>
                  <p className="font-body text-sm font-medium" style={{ color: 'var(--sage)' }}>{r.userName}</p>
                  <p className="font-body text-xs opacity-40">Cliente verificada</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Instagram CTA ────────────────────────────────────────── */}
      <section
        className="py-20 px-6 text-center"
        style={{ backgroundColor: 'var(--sage)', color: 'var(--cream-light)' }}
      >
        <p className="font-body text-xs tracking-[0.3em] uppercase mb-4 opacity-70">Siga nossa jornada</p>
        <h2 className="font-display text-3xl md:text-5xl font-light mb-4">@arizjoias</h2>
        <p className="font-body font-light opacity-70 mb-8">
          Inspire-se com looks e bastidores da nossa coleção
        </p>
        <a
          href="https://instagram.com/arizjoias"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 font-body text-xs tracking-[0.15em] uppercase py-3.5 px-8 border transition-all duration-300 hover:bg-white/10"
          style={{ borderColor: 'rgba(242,237,233,0.4)', color: 'var(--cream-light)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="2" width="20" height="20" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          Seguir no Instagram
        </a>
      </section>
    </MainLayout>
  );
}
