'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import type { Product } from '@/types';

function formatPrice(p: number) {
  return p.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const MATERIAL_LABELS: Record<string, string> = {
  'ouro-18k': 'Ouro 18k',
  prata: 'Prata 925',
  'banhado-ouro': 'Banho de Ouro',
  'banhado-rosegold': 'Banho Rosé Gold',
};

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, totalItems } = useCart();
  const { initiatePayment, loading: checkoutLoading } = useCheckout();
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    const ids = items.map((i) => i.productId);
    if (ids.length === 0) return;
    Promise.all(
      ids.map((id) =>
        fetch(`/api/products/${id}`)
          .then((r) => r.json())
          .then((d) => d.product as Product)
      )
    ).then((prods) => {
      const map: Record<string, Product> = {};
      prods.forEach((p) => { if (p) map[p.id] = p; });
      setProducts(map);
    });
  }, [items]);

  const subtotal = items.reduce((sum, item) => {
    const p = products[item.productId];
    return sum + (p?.price ?? 0) * item.quantity;
  }, 0);

  const shipping = subtotal >= 299 ? 0 : 18.9;
  const total = subtotal + shipping;

  async function handleCheckout() {
    setCheckoutError('');
    const result = await initiatePayment(items);
    if (result.success) {
      setCheckoutDone(true);
      clearCart();
    } else {
      setCheckoutError(result.error ?? 'Erro ao processar');
    }
  }

  if (checkoutDone) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center gap-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'var(--cream)', color: 'var(--sage)' }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-4xl font-light mb-3" style={{ color: 'var(--charcoal)' }}>
              Pedido Recebido!
            </h1>
            <p className="font-body opacity-60">
              Em breve você receberá uma confirmação por e-mail. <br />
              Obrigada por escolher Ariz Joias.
            </p>
          </div>
          <Link href="/catalog" className="btn-primary">Continuar Comprando</Link>
        </div>
      </MainLayout>
    );
  }

  if (totalItems === 0) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center gap-8">
          <div style={{ color: 'var(--sage)', opacity: 0.4 }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>
          <div>
            <h1 className="font-display text-4xl font-light mb-3" style={{ color: 'var(--charcoal)' }}>
              Seu carrinho está vazio
            </h1>
            <p className="font-body opacity-50">
              Explore nossa coleção e adicione suas joias favoritas
            </p>
          </div>
          <Link href="/catalog" className="btn-primary">Explorar Coleção</Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header */}
      <div className="py-16 px-6 lg:px-12" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-xs tracking-[0.2em] uppercase mb-2" style={{ color: 'var(--sage-light)' }}>
            Revise antes de finalizar
          </p>
          <h1 className="font-display text-4xl font-light" style={{ color: 'var(--charcoal)' }}>
            Carrinho ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items list */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {items.map((item) => {
              const product = products[item.productId];
              if (!product) return null;
              return (
                <div
                  key={`${item.productId}-${item.size}`}
                  className="flex gap-6 p-6"
                  style={{ backgroundColor: 'var(--cream-light)', border: '1px solid var(--cream-dark)' }}
                >
                  <Link href={`/product/${product.id}`} className="relative w-24 h-32 flex-shrink-0 overflow-hidden" style={{ backgroundColor: 'var(--cream)' }}>
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-display text-xl font-light hover:text-[var(--sage)] transition-colors" style={{ color: 'var(--charcoal)' }}>
                          {product.name}
                        </h3>
                      </Link>
                      <p className="font-body text-xs opacity-40 mt-1">
                        {MATERIAL_LABELS[product.material]}
                        {item.size && ` · Tam. ${item.size}`}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center gap-0">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1, item.size)}
                          className="w-8 h-8 flex items-center justify-center transition-colors"
                          style={{ border: '1px solid var(--cream-dark)', color: 'var(--charcoal)' }}
                          aria-label="Diminuir quantidade"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-body text-sm border-t border-b" style={{ borderColor: 'var(--cream-dark)', height: '2rem', lineHeight: '2rem' }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1, item.size)}
                          className="w-8 h-8 flex items-center justify-center transition-colors"
                          style={{ border: '1px solid var(--cream-dark)', color: 'var(--charcoal)' }}
                          aria-label="Aumentar quantidade"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-display text-xl font-light" style={{ color: 'var(--sage)' }}>
                          {formatPrice(product.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          className="opacity-30 hover:opacity-70 transition-opacity"
                          aria-label="Remover item"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="flex flex-col gap-6">
            <div
              className="p-8"
              style={{ backgroundColor: 'var(--cream-light)', border: '1px solid var(--cream-dark)' }}
            >
              <h2 className="font-display text-xl font-light mb-8" style={{ color: 'var(--charcoal)' }}>
                Resumo do Pedido
              </h2>

              <div className="flex flex-col gap-4 mb-6">
                <div className="flex justify-between font-body text-sm">
                  <span className="opacity-60">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="opacity-60">Frete</span>
                  <span className={shipping === 0 ? 'text-[var(--sage)]' : ''}>
                    {shipping === 0 ? 'Grátis' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping === 0 && (
                  <p className="font-body text-xs" style={{ color: 'var(--sage)' }}>
                    ✓ Você ganhou frete grátis!
                  </p>
                )}
                {shipping > 0 && (
                  <p className="font-body text-xs opacity-50">
                    Frete grátis a partir de {formatPrice(299 - subtotal)} a mais
                  </p>
                )}
              </div>

              <div className="h-px mb-6" style={{ backgroundColor: 'var(--cream-dark)' }} />

              <div className="flex justify-between font-display text-2xl font-light mb-8">
                <span>Total</span>
                <span style={{ color: 'var(--sage)' }}>{formatPrice(total)}</span>
              </div>

              {checkoutError && (
                <p className="font-body text-sm mb-4" style={{ color: 'var(--rosegold)' }}>
                  {checkoutError}
                </p>
              )}

              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="btn-primary w-full justify-center"
                style={{ opacity: checkoutLoading ? 0.7 : 1 }}
              >
                {checkoutLoading ? 'Processando...' : 'Finalizar Compra'}
              </button>

              <p className="font-body text-xs text-center mt-4 opacity-40">
                Pagamento seguro via SSL
              </p>
            </div>

            {/* Guarantees */}
            <div className="flex flex-col gap-4 px-2">
              {[
                { icon: '✦', text: 'Embalagem presenteável inclusa' },
                { icon: '✦', text: 'Parcelamento em 6x sem juros' },
                { icon: '✦', text: 'Troca em até 30 dias' },
              ].map((g) => (
                <div key={g.text} className="flex items-center gap-3 font-body text-xs opacity-50">
                  <span style={{ color: 'var(--gold)' }}>{g.icon}</span>
                  {g.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
