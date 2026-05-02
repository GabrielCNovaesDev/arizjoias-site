'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(
        error.message === 'Invalid login credentials'
          ? 'E-mail ou senha incorretos.'
          : error.message
      );
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="email" className="az-eyebrow">E-mail</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid var(--color-primary-dark)',
            padding: '10px 0',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--color-text)',
            outline: 'none',
            width: '100%',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="password" className="az-eyebrow">Senha</label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          style={{
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid var(--color-primary-dark)',
            padding: '10px 0',
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'var(--color-text)',
            outline: 'none',
            width: '100%',
          }}
        />
      </div>

      {error && (
        <p style={{ fontSize: 12, color: '#c0392b', margin: 0 }} role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="az-btn az-btn-primary"
        style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
