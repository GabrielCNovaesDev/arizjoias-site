import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/shop/header';
import { Footer } from '@/components/shop/footer';

export const metadata: Metadata = {
  title: {
    default: 'Ariz Joias — Joias com Leveza e Alma',
    template: '%s | Ariz Joias',
  },
  description:
    'Joias artesanais com leveza e alma. Anéis, colares, brincos e pulseiras em ouro 18k, prata 925 e banho de ouro rosé.',
  keywords: ['joias', 'ariz joias', 'anéis', 'colares', 'brincos', 'pulseiras', 'ouro', 'prata'],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Ariz Joias',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
