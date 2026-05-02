import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CadastroForm } from './cadastro-form';

export const metadata = { title: 'Criar Conta' };

export default async function CadastroPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) redirect('/');

  return (
    <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-primary)', padding: '40px 36px' }}>
      <h1 className="az-display" style={{ fontSize: 32, marginBottom: 8 }}>Criar Conta</h1>
      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 32 }}>
        Junte-se à casa Ariz.
      </p>
      <CadastroForm />
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 24, textAlign: 'center' }}>
        Já tem conta?{' '}
        <a href="/login" style={{ color: 'var(--color-sage-dark)', borderBottom: '1px solid var(--color-sage)' }}>
          Entrar
        </a>
      </p>
    </div>
  );
}
