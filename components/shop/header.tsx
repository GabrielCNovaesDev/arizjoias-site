'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArizLogoLockup } from '@/components/ui/ariz-logo';
import { useCartStore } from '@/stores/cart-store';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const ANNOUNCEMENT_MSGS = [
  'Frete grátis em pedidos acima de R$ 350',
  'Embalagem presente incluída · Entrega em até 3 dias úteis',
  'Parcele em até 6x sem juros',
];

const NAV_CATEGORIES = ['Colares', 'Brincos', 'Anéis', 'Pulseiras', 'Conjuntos'];

const slugMap: Record<string, string> = {
  Colares: 'colares',
  Brincos: 'brincos',
  'Anéis': 'aneis',
  Pulseiras: 'pulseiras',
  Conjuntos: 'conjuntos',
};

/* ── Icons ── */
const IconSearch = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.3-4.3" />
  </svg>
);
const IconBag = ({ s = 17 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);
const IconHeart = ({ s = 17, filled = false }: { s?: number; filled?: boolean }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
    <path d="M12 20s-7-4.5-7-10.2A4.3 4.3 0 0 1 12 6.5a4.3 4.3 0 0 1 7 3.3C19 15.5 12 20 12 20Z" />
  </svg>
);
const IconUser = () => (
  <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <circle cx="12" cy="9" r="3.5" /><path d="M5 20c1.6-3.5 4.2-5 7-5s5.4 1.5 7 5" />
  </svg>
);
const IconMenu = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <path d="M4 8h16M4 16h16" />
  </svg>
);
const IconClose = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
const IconArrowRight = ({ s = 14 }: { s?: number }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
  </svg>
);

const btnIcon: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: 'var(--color-text)',
  padding: 4,
  display: 'flex',
  cursor: 'pointer',
  position: 'relative',
};

const cartBadgeStyle: React.CSSProperties = {
  position: 'absolute',
  top: -4,
  right: -6,
  background: 'var(--color-gold)',
  color: 'var(--color-bg)',
  fontSize: 9,
  fontWeight: 500,
  minWidth: 14,
  height: 14,
  borderRadius: 7,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-body)',
};

function AnnouncementBar() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((x) => (x + 1) % ANNOUNCEMENT_MSGS.length), 4200);
    return () => clearInterval(t);
  }, []);
  return (
    <div
      style={{
        background: 'var(--color-text)',
        color: 'var(--color-text-on-dark)',
        padding: '10px 24px',
        textAlign: 'center',
        fontSize: 11,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        fontWeight: 300,
        overflow: 'hidden',
        height: 34,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span key={idx} className="az-reveal">{ANNOUNCEMENT_MSGS[idx]}</span>
    </div>
  );
}

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const totalItems = useCartStore((s) => s.totalItems());

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    // Carrega sessão inicial
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    // Escuta mudanças de auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/';
  }

  return (
    <>
      <AnnouncementBar />

      <header
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          padding: '22px 48px 14px',
          borderBottom: '1px solid var(--color-primary)',
          background: scrolled ? 'rgba(253,250,248,0.88)' : 'var(--color-bg)',
          backdropFilter: scrolled ? 'blur(12px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          transition: 'background 0.3s',
        }}
      >
        {/* Left — mobile burger / desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Mobile burger */}
          <button
            className="lg:hidden"
            style={btnIcon}
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <IconMenu />
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex" style={{ gap: 28, alignItems: 'center', display: 'flex' }} aria-label="Categorias">
            {NAV_CATEGORIES.slice(0, 3).map((c) => (
              <Link
                key={c}
                href={`/catalogo?categoria=${slugMap[c] ?? c.toLowerCase()}`}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 10.5,
                  fontWeight: 400,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  paddingBottom: 3,
                  borderBottom: '1px solid transparent',
                  transition: 'color .2s, border-color .2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-sage-dark)';
                  (e.currentTarget as HTMLElement).style.borderBottomColor = 'var(--color-sage)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                  (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent';
                }}
              >
                {c}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center — logo */}
        <div style={{ textAlign: 'center' }}>
          <Link href="/" aria-label="Ariz Joias — página inicial">
            <ArizLogoLockup mark={32} word={18} />
          </Link>
        </div>

        {/* Right — nav + icons */}
        <div style={{ display: 'flex', gap: 22, alignItems: 'center', justifyContent: 'flex-end' }}>
          <nav className="hidden lg:flex" style={{ gap: 28, alignItems: 'center', display: 'flex' }} aria-label="Links secundários">
            {NAV_CATEGORIES.slice(3).map((c) => (
              <Link
                key={c}
                href={`/catalogo?categoria=${slugMap[c] ?? c.toLowerCase()}`}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 10.5,
                  fontWeight: 400,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  paddingBottom: 3,
                  borderBottom: '1px solid transparent',
                  transition: 'color .2s, border-color .2s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-sage-dark)';
                  (e.currentTarget as HTMLElement).style.borderBottomColor = 'var(--color-sage)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                  (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent';
                }}
              >
                {c}
              </Link>
            ))}
            <Link
              href="#"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 10.5,
                fontWeight: 400,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                paddingBottom: 3,
                borderBottom: '1px solid transparent',
                transition: 'color .2s',
              }}
            >
              Lookbook
            </Link>
          </nav>

          <button style={btnIcon} aria-label="Buscar">
            <IconSearch />
          </button>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <Link
                href="/conta"
                style={{ ...btnIcon, fontSize: 10.5, fontFamily: 'var(--font-body)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}
              >
                {user.user_metadata?.full_name?.split(' ')[0] ?? 'Conta'}
              </Link>
              <button
                onClick={handleLogout}
                style={{ ...btnIcon, fontSize: 10.5, fontFamily: 'var(--font-body)', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}
                aria-label="Sair"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link href="/login" style={btnIcon} aria-label="Entrar">
              <IconUser />
            </Link>
          )}
          <button style={{ ...btnIcon, position: 'relative' }} aria-label="Favoritos">
            <IconHeart />
          </button>
          <Link
            href="/carrinho"
            style={{ ...btnIcon, position: 'relative' }}
            aria-label={`Carrinho${totalItems > 0 ? ` — ${totalItems} ${totalItems === 1 ? 'item' : 'itens'}` : ''}`}
          >
            <IconBag />
            {totalItems > 0 && (
              <span style={cartBadgeStyle} aria-hidden="true">{totalItems}</span>
            )}
          </Link>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      {menuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--color-bg)',
            zIndex: 50,
            padding: '20px 24px',
            animation: 'azFadeUp 0.3s ease',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <ArizLogoLockup mark={28} word={14} />
            <button onClick={() => setMenuOpen(false)} style={btnIcon} aria-label="Fechar menu">
              <IconClose />
            </button>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 20 }} aria-label="Menu mobile">
            {NAV_CATEGORIES.map((c) => (
              <Link
                key={c}
                href={`/catalogo?categoria=${slugMap[c] ?? c.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 28,
                  fontWeight: 300,
                  color: 'var(--color-text)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: 14,
                  borderBottom: '1px solid var(--color-primary)',
                }}
              >
                {c} <IconArrowRight s={14} />
              </Link>
            ))}
          </nav>
          <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Link
              href="/conta"
              onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}
            >
              <IconUser /> Minha conta
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
