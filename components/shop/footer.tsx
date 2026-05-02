'use client';

import Link from 'next/link';
import { ArizLogoLockup } from '@/components/ui/ariz-logo';

const IconArrowRight = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
  </svg>
);

const FOOTER_COLS = [
  {
    title: 'Navegar',
    links: [
      { label: 'Lançamentos', href: '/catalogo?categoria=lancamentos' },
      { label: 'Best-sellers', href: '/catalogo?destaque=true' },
      { label: 'Colares', href: '/catalogo?categoria=colares' },
      { label: 'Brincos', href: '/catalogo?categoria=brincos' },
      { label: 'Anéis', href: '/catalogo?categoria=aneis' },
      { label: 'Pulseiras', href: '/catalogo?categoria=pulseiras' },
    ],
  },
  {
    title: 'Atendimento',
    links: [
      { label: 'Contato', href: '#' },
      { label: 'Guia de tamanhos', href: '#' },
      { label: 'Cuidados com a joia', href: '#' },
      { label: 'Trocas e devoluções', href: '#' },
      { label: 'Garantia vitalícia', href: '#' },
    ],
  },
  {
    title: 'A casa Ariz',
    links: [
      { label: 'Nosso manifesto', href: '#' },
      { label: 'Atelier', href: '#' },
      { label: 'Matérias-primas', href: '#' },
      { label: 'Sustentabilidade', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer
      style={{
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-primary)',
        padding: '72px 48px 32px',
        color: 'var(--color-text)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
          gap: 56,
          alignItems: 'start',
        }}
        className="footer-grid"
      >
        {/* Brand column */}
        <div>
          <ArizLogoLockup mark={42} word={18} tagline />
          <div
            style={{
              marginTop: 28,
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 18,
              fontWeight: 300,
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
              maxWidth: 320,
            }}
          >
            &ldquo;Cada peça é escolhida para acompanhar quem sente o mundo com delicadeza.&rdquo;
          </div>

          {/* Newsletter */}
          <div style={{ marginTop: 24 }}>
            <div className="az-eyebrow" style={{ marginBottom: 10 }}>receba o lookbook</div>
            <form
              style={{ display: 'flex', borderBottom: '1px solid var(--color-primary-dark)' }}
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="footer-email" className="sr-only">Seu e-mail</label>
              <input
                id="footer-email"
                type="email"
                name="email"
                placeholder="seu e-mail"
                required
                className="az-input"
              />
              <button
                type="submit"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-sage-dark)',
                  padding: '8px 4px',
                  cursor: 'pointer',
                  display: 'flex',
                }}
                aria-label="Assinar newsletter"
              >
                <IconArrowRight />
              </button>
            </form>
          </div>
        </div>

        {/* Nav columns */}
        {FOOTER_COLS.map((col) => (
          <div key={col.title}>
            <div className="az-eyebrow" style={{ marginBottom: 18 }}>{col.title}</div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    style={{ fontSize: 12.5, color: 'var(--color-text-muted)', transition: 'color .2s' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text)')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)')}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        style={{
          marginTop: 64,
          paddingTop: 22,
          borderTop: '1px solid var(--color-primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          fontSize: 10.5,
          color: 'var(--color-text-light)',
          letterSpacing: '0.08em',
        }}
      >
        <div>© {new Date().getFullYear()} Ariz Joias · Todas as peças com garantia vitalícia contra defeito de fabricação.</div>
        <div style={{ display: 'flex', gap: 18 }}>
          <a href="https://instagram.com/arizjoias" target="_blank" rel="noopener noreferrer"
            style={{ transition: 'color .2s' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-light)')}
          >Instagram</a>
          <span>Pinterest</span>
          <span>TikTok</span>
        </div>
      </div>
    </footer>
  );
}
