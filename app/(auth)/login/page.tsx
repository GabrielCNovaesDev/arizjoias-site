import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { LoginForm } from './login-form';

export const metadata = { title: 'Entrar' };

export default async function LoginPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Já logado — redireciona para home
  if (user) redirect('/');

  return (
    <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-primary)', padding: '40px 36px' }}>
      <h1 className="az-display" style={{ fontSize: 32, marginBottom: 8 }}>Entrar</h1>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 32 }}>
        Bem-vinda de volta.
      </p>
      <LoginForm />
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 24, textAlign: 'center' }}>
        Ainda não tem conta?{' '}
        <a href="/cadastro" style={{ color: 'var(--color-sage-dark)', borderBottom: '1px solid var(--color-sage)' }}>
          Criar conta
        </a>
      </p>
    </div>
  );
}
