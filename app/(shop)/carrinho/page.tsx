'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart-store';
import { ShippingCalculator } from '@/components/shop/shipping-calculator';
import { centsToReais } from '@/lib/utils/currency';

const IconTrash = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
);

const IconBag = () => (
  <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8Z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

export default function CarrinhoPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const selectedShipping = useCartStore((s) => s.selectedShipping);
  const getSubtotalCents = useCartStore((s) => s.getSubtotalCents);
  const getTotalCents = useCartStore((s) => s.getTotalCents);

  const [removingId, setRemovingId] = useState<string | null>(null);

  function handleRemove(productId: string) {
    setRemovingId(productId);
    setTimeout(() => {
      removeItem(productId);
      setRemovingId(null);
    }, 250);
  }

  const subtotal = getSubtotalCents();
  const total = getTotalCents();
  const canCheckout = items.length > 0 && !!selectedShipping;

  if (items.length === 0) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 48px',
          gap: 20,
          textAlign: 'center',
        }}
      >
        <div style={{ color: 'var(--color-primary-dark)' }}>
          <IconBag />
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 300,
            margin: 0,
            color: 'var(--color-text)',
          }}
        >
          Seu carrinho está vazio
        </h1>
        <p style={{ fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 360, margin: 0 }}>
          Explore nossas peças e adicione as que mais combinam com você.
        </p>
        <Link href="/catalogo" className="az-btn az-btn-primary" style={{ marginTop: 8 }}>
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '80vh', padding: '48px 48px 96px' }}>
      <div style={{ marginBottom: 36 }}>
        <div className="az-eyebrow" style={{ marginBottom: 8 }}>seu pedido</div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 44,
            fontWeight: 300,
            margin: 0,
          }}
        >
          Carrinho
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'start' }}>
        {/* Items list */}
        <div>
          <div style={{ borderTop: '1px solid var(--color-primary)' }}>
            {items.map((item) => (
              <div
                key={item.productId}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr auto',
                  gap: 20,
                  padding: '20px 0',
                  borderBottom: '1px solid var(--color-primary)',
                  opacity: removingId === item.productId ? 0 : 1,
                  transition: 'opacity 0.25s',
                  alignItems: 'center',
                }}
              >
                {/* Image */}
                <Link href={`/produto/${item.slug}`}>
                  <div
                    style={{
                      width: 80,
                      height: 96,
                      position: 'relative',
                      background: 'var(--color-surface)',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--color-surface)' }} />
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Link
                    href={`/produto/${item.slug}`}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 18,
                      fontWeight: 300,
                      color: 'var(--color-text)',
                      textDecoration: 'none',
                    }}
                  >
                    {item.name}
                  </Link>
                  <div style={{ fontSize: 13, color: 'var(--color-gold)', fontWeight: 500 }}>
                    {centsToReais(item.priceCents)}
                    <span style={{ fontSize: 11, color: 'var(--color-text-light)', fontWeight: 300, marginLeft: 6 }}>
                      por unidade
                    </span>
                  </div>

                  {/* Quantity control */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid var(--color-primary-dark)',
                      }}
                    >
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        style={{
                          width: 32,
                          height: 36,
                          background: 'none',
                          border: 'none',
                          fontSize: 16,
                          cursor: 'pointer',
                          color: 'var(--color-text-muted)',
                          fontFamily: 'var(--font-body)',
                        }}
                        aria-label="Diminuir quantidade"
                      >
                        −
                      </button>
                      <span
                        style={{
                          width: 32,
                          textAlign: 'center',
                          fontSize: 13,
                          color: 'var(--color-text)',
                        }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        style={{
                          width: 32,
                          height: 36,
                          background: 'none',
                          border: 'none',
                          fontSize: 16,
                          cursor: item.quantity >= item.maxStock ? 'not-allowed' : 'pointer',
                          color:
                            item.quantity >= item.maxStock
                              ? 'var(--color-text-light)'
                              : 'var(--color-text-muted)',
                          fontFamily: 'var(--font-body)',
                        }}
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.productId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-light)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-body)',
                        padding: 0,
                      }}
                      aria-label={`Remover ${item.name} do carrinho`}
                    >
                      <IconTrash /> Remover
                    </button>
                  </div>
                </div>

                {/* Item total */}
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    color: 'var(--color-text)',
                    textAlign: 'right',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {centsToReais(item.priceCents * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <Link
              href="/catalogo"
              className="az-btn-link"
              style={{ fontSize: 11 }}
            >
              ← Continuar comprando
            </Link>
          </div>
        </div>

        {/* Summary sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Shipping calculator */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-primary)',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 300,
                margin: '0 0 16px',
              }}
            >
              Frete
            </h2>
            <ShippingCalculator />
          </div>

          {/* Coupon placeholder */}
          <div
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-primary)',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 300,
                margin: '0 0 16px',
              }}
            >
              Cupom de desconto
            </h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="Código do cupom"
                disabled
                style={{
                  flex: 1,
                  background: 'var(--color-bg)',
                  border: '1px solid var(--color-primary-dark)',
                  padding: '9px 12px',
                  fontSize: 12,
                  fontFamily: 'var(--font-body)',
                  color: 'var(--color-text-light)',
                  opacity: 0.6,
                }}
              />
              <button
                disabled
                style={{
                  background: 'var(--color-primary-dark)',
                  border: 'none',
                  padding: '9px 16px',
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-light)',
                  cursor: 'not-allowed',
                  fontFamily: 'var(--font-body)',
                  opacity: 0.5,
                }}
              >
                Aplicar
              </button>
            </div>
            <div style={{ fontSize: 10, color: 'var(--color-text-light)', marginTop: 6 }}>
              Disponível em breve
            </div>
          </div>

          {/* Order summary */}
          <div
            style={{
              background: 'var(--color-bg)',
              border: '1px solid var(--color-primary)',
              padding: '24px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 300,
                margin: '0 0 20px',
              }}
            >
              Resumo do pedido
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-muted)' }}>
                <span>Subtotal</span>
                <span>{centsToReais(subtotal)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-muted)' }}>
                <span>Frete</span>
                <span>
                  {selectedShipping
                    ? centsToReais(selectedShipping.priceCents)
                    : '—'}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 16,
                  fontWeight: 500,
                  color: 'var(--color-text)',
                  paddingTop: 12,
                  borderTop: '1px solid var(--color-primary)',
                  marginTop: 4,
                }}
              >
                <span>Total</span>
                <span style={{ color: 'var(--color-gold)' }}>{centsToReais(total)}</span>
              </div>

              {selectedShipping && (
                <div style={{ fontSize: 10, color: 'var(--color-text-light)', textAlign: 'right' }}>
                  {selectedShipping.name} · {selectedShipping.deliveryDays} {selectedShipping.deliveryDays === 1 ? 'dia útil' : 'dias úteis'}
                </div>
              )}
            </div>

            <Link
              href="/checkout"
              className="az-btn az-btn-primary"
              style={{
                display: 'block',
                textAlign: 'center',
                marginTop: 20,
                opacity: canCheckout ? 1 : 0.4,
                pointerEvents: canCheckout ? 'auto' : 'none',
              }}
              aria-disabled={!canCheckout}
              tabIndex={canCheckout ? 0 : -1}
            >
              Finalizar compra
            </Link>

            {!selectedShipping && items.length > 0 && (
              <p style={{ fontSize: 11, color: 'var(--color-text-light)', textAlign: 'center', marginTop: 8 }}>
                Calcule o frete para continuar
              </p>
            )}

            {/* Trust */}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['Pagamento 100% seguro', 'Trocas em 30 dias', 'Embalagem presente inclusa'].map((t) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-text-light)' }}>
                  <span style={{ color: 'var(--color-sage)' }}>✓</span> {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
