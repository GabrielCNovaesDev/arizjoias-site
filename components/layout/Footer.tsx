import Link from 'next/link';
import { ArizLogo } from '@/components/ui/ArizLogo';

export function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--sage-dark)', color: 'var(--cream-light)' }}>
      {/* Newsletter bar */}
      <div
        className="border-b py-10 px-6"
        style={{ borderColor: 'rgba(229,219,210,0.15)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-display text-2xl font-light" style={{ color: 'var(--cream-light)' }}>
              Receba nossas novidades
            </p>
            <p className="font-body text-sm font-light mt-1 opacity-60 tracking-wide">
              Seja a primeira a saber sobre novas coleções e promoções exclusivas
            </p>
          </div>
          <form className="flex gap-0 w-full md:w-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="seu@email.com"
              className="flex-1 md:w-64 px-4 py-3 font-body text-sm outline-none"
              style={{
                backgroundColor: 'rgba(229,219,210,0.08)',
                border: '1px solid rgba(229,219,210,0.25)',
                borderRight: 'none',
                color: 'var(--cream-light)',
              }}
              aria-label="Email para newsletter"
            />
            <button
              type="submit"
              className="px-6 py-3 font-body text-xs tracking-[0.12em] uppercase transition-all duration-300"
              style={{
                backgroundColor: 'var(--gold)',
                color: 'var(--warm-white)',
                border: '1px solid var(--gold)',
              }}
            >
              Assinar
            </button>
          </form>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <ArizLogo color="var(--cream-light)" size="md" />
            <p className="font-display text-sm font-light mt-4 opacity-70 leading-relaxed">
              Joias com leveza e alma. <br />
              Peças únicas para mulheres únicas.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="https://instagram.com/arizjoias"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Instagram da Ariz Joias"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-body text-xs tracking-[0.2em] uppercase mb-6 opacity-50">Navegação</h3>
            <ul className="space-y-3">
              {[
                { href: '/catalog', label: 'Catálogo' },
                { href: '/catalog?category=aneis', label: 'Anéis' },
                { href: '/catalog?category=colares', label: 'Colares' },
                { href: '/catalog?category=brincos', label: 'Brincos' },
                { href: '/catalog?category=pulseiras', label: 'Pulseiras' },
                { href: '/catalog?category=sets', label: 'Sets' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="font-body text-sm font-light opacity-70 hover:opacity-100 transition-opacity">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-body text-xs tracking-[0.2em] uppercase mb-6 opacity-50">Conta</h3>
            <ul className="space-y-3">
              {[
                { href: '/auth/login', label: 'Entrar' },
                { href: '/auth/register', label: 'Criar Conta' },
                { href: '/account', label: 'Minha Conta' },
                { href: '/account', label: 'Meus Pedidos' },
                { href: '/account', label: 'Favoritos' },
                { href: '/cart', label: 'Carrinho' },
              ].map((l, i) => (
                <li key={i}>
                  <Link href={l.href} className="font-body text-sm font-light opacity-70 hover:opacity-100 transition-opacity">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-body text-xs tracking-[0.2em] uppercase mb-6 opacity-50">Informações</h3>
            <ul className="space-y-3">
              {[
                'Política de Privacidade',
                'Trocas e Devoluções',
                'Prazo de Entrega',
                'Cuidados com as Joias',
                'Fale Conosco',
              ].map((l) => (
                <li key={l}>
                  <span className="font-body text-sm font-light opacity-70 cursor-pointer hover:opacity-100 transition-opacity">
                    {l}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t py-6 px-6"
        style={{ borderColor: 'rgba(229,219,210,0.1)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="font-body text-xs opacity-40 tracking-wide">
            © {new Date().getFullYear()} Ariz Joias. Todos os direitos reservados.
          </p>
          <p className="font-body text-xs opacity-40 tracking-wide">
            Feito com alma ✦
          </p>
        </div>
      </div>
    </footer>
  );
}
