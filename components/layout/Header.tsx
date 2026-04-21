'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArizLogotype } from '@/components/ui/ArizLogo';

const navLeft = [
  { href: '/catalog', label: 'Catálogo' },
  { href: '/catalog?category=aneis', label: 'Anéis' },
];

const navRight = [
  { href: '/catalog?category=colares', label: 'Colares' },
  { href: '/catalog?category=brincos', label: 'Brincos' },
  { href: '/catalog?category=pulseiras', label: 'Pulseiras' },
];

const navMobile = [...navLeft, ...navRight];

interface HeaderProps {
  cartCount?: number;
}

export function Header({ cartCount = 0 }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Top banner */}
      <div
        className="w-full text-center py-2 text-xs tracking-[0.15em] font-body font-light"
        style={{ backgroundColor: 'var(--sage)', color: 'var(--cream-light)' }}
      >
        Frete grátis para compras acima de R$ 299 &nbsp;✦&nbsp; Parcele em até 6x sem juros
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass shadow-sm' : 'bg-[var(--warm-white)]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* 3-column grid: left nav | logo center | right nav + icons */}
          <div className="grid grid-cols-3 items-center h-20">

            {/* Col 1 — mobile burger / desktop left nav */}
            <div className="flex items-center">
              {/* Mobile burger */}
              <button
                className="lg:hidden p-2 text-(--sage)"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Abrir menu"
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {menuOpen ? (
                    <>
                      <line x1="4" y1="4" x2="18" y2="18" />
                      <line x1="18" y1="4" x2="4" y2="18" />
                    </>
                  ) : (
                    <>
                      <line x1="3" y1="7" x2="19" y2="7" />
                      <line x1="3" y1="12" x2="19" y2="12" />
                      <line x1="3" y1="17" x2="19" y2="17" />
                    </>
                  )}
                </svg>
              </button>

              {/* Desktop left nav */}
              <nav className="hidden lg:flex items-center gap-8">
                {navLeft.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="font-body text-xs tracking-[0.12em] uppercase text-(--sage) hover:text-(--sage-dark) transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Col 2 — logo centered */}
            <div className="flex justify-center">
              <Link href="/" aria-label="Ariz Joias — página inicial">
                <ArizLogotype size="sm" />
              </Link>
            </div>

            {/* Col 3 — desktop right nav + icons */}
            <div className="flex items-center justify-end gap-8">
              <nav className="hidden lg:flex items-center gap-8">
                {navRight.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="font-body text-xs tracking-[0.12em] uppercase text-(--sage) hover:text-(--sage-dark) transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              {/* Icons */}
              <div className="flex items-center gap-4">
                <Link
                  href="/account"
                  className="text-(--sage) hover:text-(--sage-dark) transition-colors"
                  aria-label="Minha conta"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </Link>
                <Link
                  href="/cart"
                  className="relative text-[var(--sage)] hover:text-[var(--sage-dark)] transition-colors"
                  aria-label="Carrinho"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 01-8 0" />
                  </svg>
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-body font-medium"
                      style={{ backgroundColor: 'var(--sage)', color: 'var(--cream-light)' }}
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="lg:hidden border-t animate-fade-in"
            style={{ borderColor: 'var(--cream-dark)', backgroundColor: 'var(--warm-white)' }}
          >
            <nav className="flex flex-col px-6 py-6 gap-6">
              {navMobile.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-body text-sm tracking-[0.12em] uppercase text-(--sage) hover:text-(--sage-dark) transition-colors"
                >
                  {l.label}
                </Link>
              ))}
              <hr style={{ borderColor: 'var(--cream-dark)' }} />
              <Link
                href="/account"
                onClick={() => setMenuOpen(false)}
                className="font-body text-sm tracking-widest text-(--sage)"
              >
                Minha Conta
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
