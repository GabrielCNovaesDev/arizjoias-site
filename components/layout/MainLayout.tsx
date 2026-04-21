'use client';

import { Header } from './Header';
import { Footer } from './Footer';
import { useCart } from '@/hooks/useCart';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { totalItems } = useCart();
  return (
    <>
      <Header cartCount={totalItems} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
