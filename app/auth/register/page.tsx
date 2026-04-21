'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArizLogotype } from '@/components/ui/ArizLogo';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('As senhas não coincidem');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter ao menos 6 caracteres');
      return;
    }
    setLoading(true);
    const result = await register(name, email, password);
    if (result.error) {
      setError(result.error);
    } else {
      router.push('/account');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: decorative */}
      <div
        className="hidden lg:flex flex-col items-center justify-center px-16"
        style={{ backgroundColor: 'var(--cream)' }}
      >
        <ArizLogotype size="lg" />
        <div className="mt-16 text-center">
          <h2 className="font-display text-4xl font-light mb-4" style={{ color: 'var(--charcoal)' }}>
            Junte-se à Ariz
          </h2>
          <p className="font-body font-light opacity-60" style={{ color: 'var(--charcoal)' }}>
            Crie sua conta e tenha acesso a ofertas exclusivas, <br />
            lista de favoritos e muito mais.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div
        className="flex flex-col items-center justify-center px-8 md:px-16 py-16"
        style={{ backgroundColor: 'var(--warm-white)' }}
      >
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex justify-center mb-10">
            <ArizLogotype size="md" />
          </div>

          <h1 className="font-display text-3xl font-light mb-2" style={{ color: 'var(--charcoal)' }}>
            Criar Conta
          </h1>
          <p className="font-body text-sm opacity-50 mb-10">
            Já tem uma conta?{' '}
            <Link href="/auth/login" className="opacity-100 underline underline-offset-2" style={{ color: 'var(--sage)' }}>
              Entrar
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            {error && (
              <div
                className="px-4 py-3 font-body text-sm"
                style={{ backgroundColor: 'rgba(196,146,122,0.12)', border: '1px solid var(--rosegold)', color: 'var(--rosegold)' }}
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block font-body text-xs tracking-[0.12em] uppercase mb-2 opacity-60">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-elegant"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label htmlFor="email" className="block font-body text-xs tracking-[0.12em] uppercase mb-2 opacity-60">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-elegant"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block font-body text-xs tracking-[0.12em] uppercase mb-2 opacity-60">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-elegant"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block font-body text-xs tracking-[0.12em] uppercase mb-2 opacity-60">
                Confirmar senha
              </label>
              <input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input-elegant"
                placeholder="Repita a senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary justify-center w-full"
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link href="/" className="font-body text-xs tracking-wide opacity-40 hover:opacity-70 transition-opacity">
              ← Voltar para a loja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
