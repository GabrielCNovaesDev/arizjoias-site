'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Aguardando',
  confirmed: 'Confirmado',
  processing: 'Em preparação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { favorites } = useFavorites();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <MainLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--cream-dark)', borderTopColor: 'var(--sage)' }} />
        </div>
      </MainLayout>
    );
  }

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="py-16 px-6 lg:px-12" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div>
            <p className="font-body text-xs tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--sage-light)' }}>
              Minha Conta
            </p>
            <h1 className="font-display text-4xl font-light" style={{ color: 'var(--charcoal)' }}>
              Olá, {user.name.split(' ')[0]}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="font-body text-xs tracking-[0.1em] uppercase opacity-50 hover:opacity-100 transition-opacity"
            style={{ color: 'var(--charcoal)' }}
          >
            Sair
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Profile card */}
          <div
            className="p-8"
            style={{ backgroundColor: 'var(--cream-light)', border: '1px solid var(--cream-dark)' }}
          >
            <h2 className="font-display text-xl font-light mb-6" style={{ color: 'var(--charcoal)' }}>
              Dados Pessoais
            </h2>
            <div className="flex flex-col gap-5">
              {[
                { label: 'Nome', value: user.name },
                { label: 'E-mail', value: user.email },
              ].map((f) => (
                <div key={f.label}>
                  <p className="font-body text-xs tracking-[0.1em] uppercase opacity-40 mb-1">{f.label}</p>
                  <p className="font-body text-sm">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--cream-dark)' }}>
              <p className="font-body text-xs tracking-[0.1em] uppercase opacity-40 mb-3">Endereço</p>
              <p className="font-body text-sm opacity-50 italic">
                Nenhum endereço cadastrado
              </p>
              <button className="btn-outline mt-4 text-xs py-2 px-4">
                Adicionar endereço
              </button>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div
              className="p-8"
              style={{ backgroundColor: 'var(--cream-light)', border: '1px solid var(--cream-dark)' }}
            >
              <h2 className="font-display text-xl font-light mb-6" style={{ color: 'var(--charcoal)' }}>
                Histórico de Pedidos
              </h2>
              <div className="flex flex-col items-center py-12 gap-4 opacity-40">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <p className="font-display text-xl font-light">Nenhum pedido ainda</p>
                <p className="font-body text-sm text-center">
                  Seus pedidos aparecerão aqui após a compra
                </p>
              </div>
              <Link href="/catalog" className="btn-primary mt-2">
                Explorar Catálogo
              </Link>
            </div>

            {/* Favorites */}
            <div
              className="p-8"
              style={{ backgroundColor: 'var(--cream-light)', border: '1px solid var(--cream-dark)' }}
            >
              <h2 className="font-display text-xl font-light mb-6" style={{ color: 'var(--charcoal)' }}>
                Favoritos
                {favorites.length > 0 && (
                  <span className="ml-3 font-body text-sm opacity-40">({favorites.length})</span>
                )}
              </h2>
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-3 opacity-40">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                  </svg>
                  <p className="font-body text-sm">Nenhum favorito salvo</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {favorites.map((id) => (
                    <Link
                      key={id}
                      href={`/product/${id}`}
                      className="font-body text-sm px-4 py-2 transition-colors"
                      style={{ backgroundColor: 'var(--cream)', color: 'var(--sage)' }}
                    >
                      Ver produto
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
