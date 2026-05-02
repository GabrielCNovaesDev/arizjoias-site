import Image from 'next/image';
import Link from 'next/link';
import { ProductCard, type ProductCardData } from '@/components/shop/product-card';
import { ArizLogoMark } from '@/components/ui/ariz-logo';
import { CategoryCard, InstagramGrid } from '@/components/shop/home-interactive';

/* ── Icons ── */
const IconArrowRight = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
  </svg>
);
const IconShip = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="13" height="10" rx="1" /><path d="M15 10h4l3 3v4h-7z" /><circle cx="7" cy="19" r="1.6" /><circle cx="17" cy="19" r="1.6" />
  </svg>
);
const IconShield = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z" /><path d="m9 12 2 2 4-4" />
  </svg>
);
const IconBox = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8 12 4l9 4v9l-9 4-9-4Z" /><path d="M3 8l9 4 9-4" /><path d="M12 12v9" />
  </svg>
);
const IconHeart = () => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20s-7-4.5-7-10.2A4.3 4.3 0 0 1 12 6.5a4.3 4.3 0 0 1 7 3.3C19 15.5 12 20 12 20Z" />
  </svg>
);

/* ── Data ── */
const PRODUCTS: ProductCardData[] = [
  {
    id: 'flower-pendant-set',
    slug: 'conjunto-flor-de-cristal',
    name: 'Conjunto Flor de Cristal',
    category: 'Conjuntos',
    price: 389,
    oldPrice: 449,
    image: '/assets/flower-pendant-set-model.png',
    alt: '/assets/flower-pendant-set.png',
    tag: 'exclusivo',
  },
  {
    id: 'heart-necklace-set',
    slug: 'colar-duo-coracao',
    name: 'Colar Duo Coração',
    category: 'Colares',
    price: 219,
    image: '/assets/set-heart-necklace.png',
    alt: '/assets/butterfly-ring.png',
    tag: 'mais amado',
  },
  {
    id: 'emerald-clover',
    slug: 'brincos-trevo-esmeralda',
    name: 'Brincos Trevo Esmeralda',
    category: 'Brincos',
    price: 279,
    image: '/assets/emerald-clover-earring-model.png',
    alt: '/assets/emerald-clover-earring.png',
    tag: 'novo',
  },
  {
    id: 'crystal-hoop',
    slug: 'argola-baguete',
    name: 'Argola Baguete',
    category: 'Brincos',
    price: 329,
    image: '/assets/earring-crystal-hoop.png',
    tag: 'novo',
  },
  {
    id: 'flower-bracelet',
    slug: 'pulseira-jardim',
    name: 'Pulseira Jardim',
    category: 'Pulseiras',
    price: 459,
    image: '/assets/flower-bracelet.png',
    alt: '/assets/flower-pendant-alt.png',
    tag: 'exclusivo',
  },
  {
    id: 'pearl-infinity',
    slug: 'pulseira-infinito-perola',
    name: 'Pulseira Infinito Pérola',
    category: 'Pulseiras',
    price: 249,
    image: '/assets/pearl-infinity-bracelet.png',
    alt: '/assets/silver-drop-bracelet.png',
  },
  {
    id: 'circle-pendant',
    slug: 'colar-circulo-pave',
    name: 'Colar Círculo Pavê',
    category: 'Colares',
    price: 299,
    image: '/assets/circle-pendant-necklace.png',
    alt: '/assets/flower-pendant-alt.png',
  },
  {
    id: 'butterfly-ring',
    slug: 'anel-borboleta',
    name: 'Anel Borboleta',
    category: 'Anéis',
    price: 189,
    image: '/assets/butterfly-ring.png',
    tag: 'mais amado',
  },
];

const NEW_ARRIVALS = PRODUCTS.filter((p) => p.tag === 'novo' || p.tag === 'exclusivo').slice(0, 4);
const BEST_SELLERS = PRODUCTS.filter((p) => p.tag === 'mais amado' || !p.tag).slice(0, 4);

const CATEGORIES = [
  { name: 'Colares', img: '/assets/circle-pendant-necklace.png', count: 42, slug: 'colares' },
  { name: 'Brincos', img: '/assets/earring-crystal-hoop.png', count: 67, slug: 'brincos' },
  { name: 'Anéis', img: '/assets/butterfly-ring.png', count: 38, slug: 'aneis' },
  { name: 'Pulseiras', img: '/assets/pearl-infinity-bracelet.png', count: 29, slug: 'pulseiras' },
];

const VALUES = [
  { icon: <IconShip />, title: 'Entrega cuidada', text: 'Em até 3 dias úteis, em caixa assinatura.' },
  { icon: <IconShield />, title: 'Garantia vitalícia', text: 'Contra defeito de fabricação, sempre.' },
  { icon: <IconBox />, title: 'Embalagem presente', text: 'Cartão escrito à mão, cortesia da casa.' },
  { icon: <IconHeart />, title: 'Trocas em 30 dias', text: 'Sem perguntas, sem burocracia.' },
];

const INSTAGRAM_IMGS = [
  '/assets/flower-pendant-set-model.png',
  '/assets/set-heart-necklace.png',
  '/assets/silver-drop-bracelet.png',
  '/assets/earring-crystal-hoop.png',
  '/assets/pearl-infinity-bracelet.png',
  '/assets/butterfly-ring.png',
];

/* ── Reusable product grid section ── */
function ProductGridSection({
  eyebrow,
  title,
  subtitle,
  products,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  products: ProductCardData[];
}) {
  return (
    <section style={{ padding: '96px 48px', background: 'var(--color-bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48, flexWrap: 'wrap', gap: 20 }}>
        <div>
          <div className="az-eyebrow" style={{ marginBottom: 12 }}>{eyebrow}</div>
          <h2 className="az-display" style={{ fontSize: 52, margin: 0, fontWeight: 300, lineHeight: 1.05 }}>{title}</h2>
          {subtitle && <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 12, maxWidth: 460 }}>{subtitle}</p>}
        </div>
        <Link href="/catalogo" className="az-btn-link">
          Ver todas <IconArrowRight s={12} />
        </Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 28 }}>
        {products.map((p, i) => (
          <div key={p.id} className="az-reveal" style={{ animationDelay: `${i * 0.06}s` }}>
            <ProductCard product={p} priority={i < 2} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ── Hero — split editorial ─────────────────────────────── */}
      <section style={{ background: 'var(--color-bg)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', minHeight: 'calc(100vh - 120px)' }}>
          {/* Left — text */}
          <div style={{ padding: '72px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
            <div className="az-reveal">
              <div className="az-eyebrow" style={{ marginBottom: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 28, height: 1, background: 'var(--color-sage)', display: 'inline-block' }} />
                coleção primavera 2026
              </div>
              <h1 className="az-display" style={{ fontSize: 104, fontWeight: 300, margin: 0, lineHeight: 0.92, color: 'var(--color-text)' }}>
                Joias com<br />
                <em className="az-display-italic" style={{ color: 'var(--color-sage-dark)' }}>leveza</em>
                <br />&amp; alma
              </h1>
              <p style={{ fontSize: 15, color: 'var(--color-text-muted)', lineHeight: 1.75, maxWidth: 440, marginTop: 32, fontWeight: 300 }}>
                Peças em prata 925 desenhadas para acompanhar mulheres que sentem — porque um bom gesto nunca pede licença para existir.
              </p>
              <div style={{ display: 'flex', gap: 16, marginTop: 36, flexWrap: 'wrap' }}>
                <Link href="/catalogo" className="az-btn az-btn-primary">
                  Explorar coleção <IconArrowRight s={14} />
                </Link>
                <Link href="#manifesto" className="az-btn az-btn-ghost">Nossa história</Link>
              </div>
              {/* Stats */}
              <div style={{ display: 'flex', gap: 40, marginTop: 80, paddingTop: 32, borderTop: '1px solid var(--color-primary)' }}>
                {[
                  { value: '925', label: 'prata certificada' },
                  { value: '9', label: 'etapas de acabamento' },
                  { value: '∞', label: 'garantia vitalícia' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="az-display" style={{ fontSize: 26, color: 'var(--color-sage-dark)' }}>{s.value}</div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — image */}
          <div style={{ position: 'relative', background: 'var(--color-primary)' }}>
            <Image
              src="/assets/flower-pendant-set-model.png"
              alt="Conjunto Flor de Cristal — Ariz Joias"
              fill
              priority
              sizes="55vw"
              className="object-cover"
            />
            {/* Floating product card */}
            <div style={{ position: 'absolute', bottom: 40, left: 40, background: 'var(--color-bg)', padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'center', maxWidth: 320, boxShadow: 'var(--shadow-md)' }}>
              <div style={{ width: 54, height: 64, background: 'var(--color-surface)', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                <Image src="/assets/flower-pendant-set.png" alt="Conjunto Flor de Cristal" fill className="object-cover" sizes="54px" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-text-light)' }}>em destaque</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginTop: 2 }}>Conjunto Flor de Cristal</div>
                <div className="az-price" style={{ fontSize: 12, marginTop: 2 }}>R$ 389,00</div>
              </div>
              <Link
                href="/produto/conjunto-flor-de-cristal"
                style={{ background: 'var(--color-text)', color: 'var(--color-bg)', border: 'none', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                aria-label="Ver produto"
              >
                <IconArrowRight s={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category strip ─────────────────────────────────────── */}
      <section style={{ padding: '88px 48px', background: 'var(--color-bg)', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="az-eyebrow" style={{ marginBottom: 16 }}>universos</div>
          <h2 className="az-display" style={{ fontSize: 56, margin: 0 }}>
            <em className="az-display-italic">Para cada</em> sentimento,
            <br />uma peça que se faz memória
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {CATEGORIES.map((c, i) => (
            <CategoryCard key={c.name} name={c.name} img={c.img} count={c.count} slug={c.slug} index={i} />
          ))}
        </div>
      </section>

      {/* ── Editorial feature — Coleção Trevo ─────────────────── */}
      <section style={{ background: 'var(--color-surface-2)', padding: '88px 64px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden' }}>
              <Image
                src="/assets/emerald-clover-earring-model.png"
                alt="Brincos Trevo Esmeralda — modelo"
                fill
                sizes="45vw"
                className="object-cover"
              />
            </div>
            <div style={{ position: 'absolute', bottom: 20, right: 20, background: 'var(--color-bg)', padding: '14px 18px', maxWidth: 240 }}>
              <div className="az-eyebrow" style={{ color: 'var(--color-sage-dark)', marginBottom: 6 }}>cápsula primavera</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, lineHeight: 1.3 }}>Edição limitada de 200 peças numeradas.</div>
            </div>
          </div>
          <div style={{ padding: '0 20px' }}>
            <div className="az-eyebrow" style={{ marginBottom: 20 }}>✿ coleção trevo</div>
            <h2 className="az-display" style={{ fontSize: 72, margin: '0 0 24px', lineHeight: 1 }}>
              Verde como<br />
              <em className="az-display-italic" style={{ color: 'var(--color-sage-dark)' }}>um bom presságio</em>
            </h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.8, maxWidth: 440, marginBottom: 28 }}>
              Quartzos verdes com lapidação coração, montados um a um em prata 925. Uma cápsula que celebra a intuição feminina — aquele instinto que sussurra antes mesmo da certeza chegar.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/produto/brincos-trevo-esmeralda" className="az-btn az-btn-primary">
                Ver a cápsula <IconArrowRight s={14} />
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span className="az-price" style={{ fontSize: 16 }}>a partir de R$ 279,00</span>
                <span style={{ fontSize: 10.5, color: 'var(--color-text-light)', letterSpacing: '0.08em' }}>6x sem juros</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── New arrivals ───────────────────────────────────────── */}
      <ProductGridSection
        eyebrow="recém chegadas"
        title={<>Novas peças, <em className="az-display-italic">velhos encantos</em></>}
        subtitle="As chegadas desta semana, escolhidas para quem gosta de ser a primeira a notar."
        products={NEW_ARRIVALS}
      />

      {/* ── Brand story ────────────────────────────────────────── */}
      <section
        id="manifesto"
        style={{ background: 'var(--color-text)', color: 'var(--color-text-on-dark)', padding: '104px 64px', position: 'relative', overflow: 'hidden' }}
      >
        <div className="az-grain" />
        <div style={{ maxWidth: 780, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <ArizLogoMark size={72} color="var(--color-sage-light)" stroke={1.1} />
          <div className="az-eyebrow" style={{ color: 'var(--color-sage-light)', marginTop: 28, marginBottom: 22 }}>desde 2019</div>
          <h2 className="az-display" style={{ fontSize: 52, margin: 0, fontWeight: 300, color: 'var(--color-bg)', lineHeight: 1.1 }}>
            A casa Ariz nasceu de um desejo simples —<br />
            <em className="az-display-italic" style={{ color: 'var(--color-primary)' }}>que joia fosse um gesto,</em>
            <br />não uma vitrine.
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(253,250,248,0.7)', lineHeight: 1.9, maxWidth: 520, margin: '32px auto 36px', fontWeight: 300 }}>
            Trabalhamos exclusivamente com prata 925 certificada e pedras selecionadas à mão. Cada peça passa por nove etapas de acabamento no nosso atelier em São Paulo — porque a delicadeza do produto final só aparece quando cada detalhe invisível foi pensado com cuidado.
          </p>
          <button className="az-btn az-btn-ghost" style={{ borderColor: 'var(--color-primary-light)', color: 'var(--color-bg)' }}>
            Nosso manifesto
          </button>
        </div>
      </section>

      {/* ── Best sellers ───────────────────────────────────────── */}
      <ProductGridSection
        eyebrow="mais amadas"
        title={<>Aquelas que <em className="az-display-italic">não voltam</em> para a vitrine</>}
        subtitle="Escolhidas pelas nossas clientes semana após semana."
        products={BEST_SELLERS}
      />

      {/* ── Values / trust strip ───────────────────────────────── */}
      <section style={{ padding: '64px 48px', background: 'var(--color-surface)', borderTop: '1px solid var(--color-primary)', borderBottom: '1px solid var(--color-primary)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {VALUES.map((v) => (
            <div key={v.title} style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', textAlign: 'center', color: 'var(--color-sage-dark)' }}>
              {v.icon}
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'var(--color-text)', fontWeight: 400 }}>{v.title}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{v.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Instagram grid ─────────────────────────────────────── */}
      <section style={{ padding: '80px 48px 96px', textAlign: 'center' }}>
        <div className="az-eyebrow" style={{ marginBottom: 10 }}>@arizjoias</div>
        <h3 className="az-display" style={{ fontSize: 40, margin: '0 0 36px' }}>
          Nossa comunidade, <em className="az-display-italic">nosso espelho</em>
        </h3>
        <InstagramGrid images={INSTAGRAM_IMGS} />
      </section>
    </>
  );
}
