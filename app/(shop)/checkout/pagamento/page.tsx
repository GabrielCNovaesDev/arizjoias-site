'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart-store';
import { centsToReais } from '@/lib/utils/currency';

const IconPix = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.9 2.1L6.4 7.6c-.4.4-.4 1 0 1.4l5.5 5.5c.4.4 1 .4 1.4 0l5.5-5.5c.4-.4.4-1 0-1.4L13.3 2.1c-.4-.4-1-.4-1.4 0zm0 13.4L6.4 21c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0l5.5-5.5 5.5 5.5c.4.4 1 .4 1.4 0 .4-.4.4-1 0-1.4l-5.5-5.5c-.4-.4-1-.4-1.4 0z" />
  </svg>
);

const IconCard = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);

const IconBoleto = () => (
  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <path d="M4 4h2v16H4zM8 4h1v16H8zM11 4h2v16h-2zM15 4h1v16h-1zM18 4h2v16h-2z" />
  </svg>
);

type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: 'pix',
    label: 'PIX',
    description: 'Aprovação imediata · Sem taxas adicionais',
    icon: <IconPix />,
  },
  {
    id: 'credit_card',
    label: 'Cartão de crédito',
    description: 'Em até 6x sem juros',
    icon: <IconCard />,
  },
  {
    id: 'boleto',
    label: 'Boleto bancário',
    description: 'Vencimento em 3 dias úteis',
    icon: <IconBoleto />,
  },
];

export default function PagamentoPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const selectedShipping = useCartStore((s) => s.selectedShipping);
  const subtotal = useCartStore((s) => s.getSubtotalCents());
  const total = useCartStore((s) => s.getTotalCents());
  const clear = useCartStore((s) => s.clear);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressId, setAddressId] = useState<string | null>(null);

  // Redirect if cart is empty or no shipping selected
  useEffect(() => {
    if (items.length === 0) {
      router.replace('/carrinho');
    } else if (!selectedShipping) {
      router.replace('/checkout');
    }
  }, [items.length, selectedShipping, router]);

  // Read addressId from localStorage (set by checkout step 1)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ariz-checkout-address-id');
      if (saved) setAddressId(saved);
    } catch {
      // ignore
    }
  }, []);

  async function handlePay() {
    if (!selectedShipping) {
      setError('Dados de entrega incompletos. Volte ao checkout.');
      return;
    }
    if (!addressId) {
      setError('Endereço de entrega não encontrado. Volte ao checkout e selecione um endereço.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
          shipping: selectedShipping,
          addressId,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Erro ao processar pagamento.');
        return;
      }

      if (!data.initPoint) {
        setError('Erro ao obter URL de pagamento. Tente novamente.');
        return;
      }

      // Clear cart only after we have a valid redirect URL
      clear();
      localStorage.removeItem('ariz-checkout-address-id');

      // Redirect to Mercado Pago Checkout Pro
      window.location.href = data.initPoint;
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0 || !selectedShipping) return null;

  const missingAddress = !addressId;

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '80vh', padding: '48px 48px 96px' }}>
      <div style={{ marginBottom: 40 }}>
        <div className="az-eyebrow" style={{ marginBottom: 8 }}>finalizar pedido</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 300, margin: 0 }}>
          Pagamento
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'start' }}>
        {/* Left — payment method */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--color-primary)', paddingBottom: 20 }}>
            {[
              { n: 1, label: 'Endereço', active: false, done: true },
              { n: 2, label: 'Pagamento', active: true, done: false },
              { n: 3, label: 'Confirmação', active: false, done: false },
            ].map((step, i) => (
              <div key={step.n} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && (
                  <div style={{ width: 32, height: 1, background: 'var(--color-primary-dark)', margin: '0 8px' }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: step.done ? 'var(--color-sage)' : step.active ? 'var(--color-sage-dark)' : 'var(--color-surface)',
                    border: `1px solid ${step.active || step.done ? 'var(--color-sage-dark)' : 'var(--color-primary-dark)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 500,
                    color: step.active || step.done ? 'var(--color-bg)' : 'var(--color-text-light)',
                  }}>
                    {step.done ? '✓' : step.n}
                  </div>
                  <span style={{
                    fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                    color: step.active ? 'var(--color-text)' : 'var(--color-text-light)',
                  }}>
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Missing address warning */}
          {missingAddress && (
            <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '12px 16px', fontSize: 13, color: '#92400e' }}>
              Endereço de entrega não encontrado.{' '}
              <Link href="/checkout" style={{ color: '#92400e', fontWeight: 500 }}>
                Volte ao checkout
              </Link>{' '}
              e selecione um endereço antes de continuar.
            </div>
          )}

          {/* Payment method selection */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, margin: '0 0 16px' }}>
              Forma de pagamento
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 20px',
                    border: `1px solid ${paymentMethod === opt.id ? 'var(--color-sage)' : 'var(--color-primary-dark)'}`,
                    background: paymentMethod === opt.id ? 'var(--color-sage-pale)' : 'var(--color-bg)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.id}
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                    style={{ accentColor: 'var(--color-sage-dark)', width: 16, height: 16, flexShrink: 0 }}
                  />
                  <div style={{ color: paymentMethod === opt.id ? 'var(--color-sage-dark)' : 'var(--color-text-muted)', flexShrink: 0 }}>
                    {opt.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 2 }}>{opt.description}</div>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ marginTop: 12, padding: '12px 16px', background: 'var(--color-surface)', border: '1px solid var(--color-primary)', fontSize: 12, color: 'var(--color-text-muted)' }}>
              Ao clicar em "Pagar agora" você será redirecionado para o ambiente seguro do Mercado Pago para concluir o pagamento.
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '12px 16px', fontSize: 13 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button
              onClick={handlePay}
              disabled={loading || missingAddress}
              className="az-btn az-btn-primary"
              style={{ opacity: loading || missingAddress ? 0.5 : 1, minWidth: 200 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Processando...
                </span>
              ) : 'Pagar agora →'}
            </button>
            <Link href="/checkout" style={{ fontSize: 11, color: 'var(--color-text-light)', letterSpacing: '0.1em' }}>
              ← Voltar ao endereço
            </Link>
          </div>
        </div>

        {/* Right — order summary */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-primary)',
          padding: '24px',
          position: 'sticky',
          top: 100,
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, margin: '0 0 20px' }}>
            Resumo do pedido
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {items.map((item) => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)' }}>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                  {item.name} × {item.quantity}
                </span>
                <span style={{ whiteSpace: 'nowrap' }}>{centsToReais(item.priceCents * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--color-primary)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-muted)' }}>
              <span>Subtotal</span>
              <span>{centsToReais(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-muted)' }}>
              <span>Frete ({selectedShipping.name})</span>
              <span>{centsToReais(selectedShipping.priceCents)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 500, color: 'var(--color-text)', paddingTop: 8, borderTop: '1px solid var(--color-primary)', marginTop: 4 }}>
              <span>Total</span>
              <span style={{ color: 'var(--color-gold)' }}>{centsToReais(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
