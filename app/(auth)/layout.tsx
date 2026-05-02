// Layout da área de autenticação — sem header/footer da loja
import Link from 'next/link';
import { ArizLogoLockup } from '@/components/ui/ariz-logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: 'var(--color-surface)' }}
    >
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <Link href="/" aria-label="Voltar para a loja">
            <ArizLogoLockup mark={40} word={18} tagline />
          </Link>
          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginTop: 24,
              opacity: 0.5,
              color: 'var(--color-text-muted)',
              transition: 'opacity .2s',
            }}
          >
            ← Voltar para a loja
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
