'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { centsToReais } from '@/lib/utils/currency';

type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

interface OrderItem {
  id: string;
  product_name: string;
  product_slug: string;
  product_image_url: string | null;
  unit_price_cents: number;
  quantity: number;
  subtotal_cents: number;
}

interface Order {
  id: string;
  status: OrderStatus;
  shipping_recipient_name: string;
  shipping_street: string;
  shipping_number: string;
  shipping_complement: string | null;
  shipping_district: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip_code: string;
  shipping_method_name: string;
  shipping_company: string;
  shipping_price_cents: number;
  shipping_delivery_days: number;
  tracking_code: string | null;
  subtotal_cents: number;
  discount_cents: number;
  total_cents: number;
  payment_method: string | null;
  payment_confirmed_at: string | null;
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: 'Aguardando pagamento',
  paid: 'Pago',
  preparing: 'Em separação',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  refunded: 'Estornado',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending_payment: '#d97706',
  paid: 'var(--color-sage-dark)',
  preparing: 'var(--color-sage-dark)',
  shipped: '#2563eb',
  delivered: 'var(--color-sage-dark)',
  cancelled: '#b91c1c',
  refunded: '#6b7280',
};

const TIMELINE_STEPS: OrderStatus[] = ['paid', 'preparing', 'shipped', 'delivered'];

interface OrderPageClientProps {
  orderId: string;
}

export function OrderPageClient({ orderId }: OrderPageClientProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    const supabase = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single();

    if (error || !data) {
      setError('Pedido não encontrado.');
      setLoading(false);
      return;
    }

    setOrder(data as Order);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Poll every 5 seconds while pending_payment, stop after 10 minutes
  useEffect(() => {
    if (!order || order.status !== 'pending_payment') return;
    let attempts = 0;
    const MAX_ATTEMPTS = 120; // 10 minutes at 5s intervals
    const interval = setInterval(() => {
      attempts++;
      if (attempts >= MAX_ATTEMPTS) {
        clearInterval(interval);
        return;
      }
      fetchOrder();
    }, 5000);
    return () => clearInterval(interval);
  }, [order, fetchOrder]);

  if (loading) {
    return (
      <div style={{ padding: '80px 48px', textAlign: 'center', color: 'var(--color-text-light)' }}>
        Carregando pedido...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ padding: '80px 48px', textAlign: 'center' }}>
        <p style={{ color: '#b91c1c', marginBottom: 16 }}>{error ?? 'Pedido não encontrado.'}</p>
        <Link href="/conta/pedidos" className="az-btn az-btn-primary">Ver meus pedidos</Link>
      </div>
    );
  }

  const orderNumber = order.id.slice(0, 8).toUpperCase();
  const isPending = order.status === 'pending_payment';
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';
  const currentStepIndex = TIMELINE_STEPS.indexOf(order.status as OrderStatus);

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '80vh', padding: '48px 48px 96px' }}>
      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div className="az-eyebrow" style={{ marginBottom: 8 }}>pedido #{orderNumber}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 300, margin: 0 }}>
            {isPending ? 'Aguardando pagamento' : isCancelled ? 'Pedido cancelado' : 'Pedido confirmado'}
          </h1>
          <span style={{
            fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
            padding: '4px 12px', border: `1px solid ${STATUS_COLORS[order.status]}`,
            color: STATUS_COLORS[order.status],
          }}>
            {STATUS_LABELS[order.status]}
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8 }}>
          Realizado em {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Pending payment notice */}
      {isPending && (
        <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 12, height: 12, border: '2px solid #d97706', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#92400e' }}>Aguardando confirmação do pagamento</div>
            <div style={{ fontSize: 12, color: '#b45309', marginTop: 2 }}>Esta página atualiza automaticamente quando o pagamento for confirmado.</div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Status timeline */}
          {!isCancelled && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, margin: '0 0 20px' }}>
                Acompanhamento
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                {TIMELINE_STEPS.map((step, i) => {
                  const done = currentStepIndex >= i;
                  const active = currentStepIndex === i;
                  return (
                    <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < TIMELINE_STEPS.length - 1 ? 1 : 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: done ? 'var(--color-sage-dark)' : 'var(--color-surface)',
                          border: `2px solid ${done ? 'var(--color-sage-dark)' : 'var(--color-primary-dark)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, color: done ? 'var(--color-bg)' : 'var(--color-text-light)',
                          fontWeight: 500,
                        }}>
                          {done ? '✓' : i + 1}
                        </div>
                        <span style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: active ? 'var(--color-text)' : 'var(--color-text-light)', whiteSpace: 'nowrap' }}>
                          {STATUS_LABELS[step]}
                        </span>
                      </div>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div style={{ flex: 1, height: 2, background: done && currentStepIndex > i ? 'var(--color-sage-dark)' : 'var(--color-primary)', margin: '0 8px', marginBottom: 22 }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Tracking code */}
              {order.tracking_code && (
                <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--color-surface)', border: '1px solid var(--color-primary)' }}>
                  <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                    Código de rastreio
                  </div>
                  <a
                    href={`https://rastreamento.correios.com.br/app/index.php?objeto=${order.tracking_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 16, fontFamily: 'monospace', color: 'var(--color-sage-dark)', letterSpacing: '0.1em' }}
                  >
                    {order.tracking_code}
                  </a>
                  <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 4 }}>
                    Clique para rastrear nos Correios
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Items */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, margin: '0 0 16px' }}>
              Itens do pedido
            </h2>
            <div style={{ borderTop: '1px solid var(--color-primary)' }}>
              {order.order_items.map((item) => (
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--color-primary)', alignItems: 'center' }}>
                  <div style={{ width: 64, height: 76, position: 'relative', background: 'var(--color-surface)', overflow: 'hidden' }}>
                    {item.product_image_url ? (
                      <Image src={item.product_image_url} alt={item.product_name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--color-surface)' }} />
                    )}
                  </div>
                  <div>
                    <Link href={`/produto/${item.product_slug}`} style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 300, color: 'var(--color-text)', textDecoration: 'none' }}>
                      {item.product_name}
                    </Link>
                    <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 4 }}>
                      {centsToReais(item.unit_price_cents)} × {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
                    {centsToReais(item.subtotal_cents)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery address */}
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 300, margin: '0 0 12px' }}>
              Endereço de entrega
            </h2>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.8, padding: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-primary)' }}>
              <strong style={{ color: 'var(--color-text)' }}>{order.shipping_recipient_name}</strong><br />
              {order.shipping_street}, {order.shipping_number}
              {order.shipping_complement ? `, ${order.shipping_complement}` : ''} — {order.shipping_district}<br />
              {order.shipping_city} / {order.shipping_state} · {order.shipping_zip_code.replace(/(\d{5})(\d{3})/, '$1-$2')}<br />
              <span style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 4, display: 'block' }}>
                {order.shipping_method_name} ({order.shipping_company}) · {order.shipping_delivery_days} dias úteis
              </span>
            </div>
          </div>
        </div>

        {/* Right — order summary */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-primary)', padding: '24px', position: 'sticky', top: 100 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 300, margin: '0 0 20px' }}>
            Resumo financeiro
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-muted)' }}>
              <span>Subtotal</span>
              <span>{centsToReais(order.subtotal_cents)}</span>
            </div>
            {order.discount_cents > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-sage-dark)' }}>
                <span>Desconto</span>
                <span>− {centsToReais(order.discount_cents)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--color-text-muted)' }}>
              <span>Frete</span>
              <span>{centsToReais(order.shipping_price_cents)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 500, color: 'var(--color-text)', paddingTop: 10, borderTop: '1px solid var(--color-primary)', marginTop: 4 }}>
              <span>Total</span>
              <span style={{ color: 'var(--color-gold)' }}>{centsToReais(order.total_cents)}</span>
            </div>
          </div>

          {order.payment_method && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-primary)', fontSize: 12, color: 'var(--color-text-muted)' }}>
              <span style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Método de pagamento</span>
              {order.payment_method === 'pix' ? 'PIX' : order.payment_method === 'bolbradesco' || order.payment_method === 'pec' ? 'Boleto' : 'Cartão de crédito'}
            </div>
          )}

          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/conta/pedidos" className="az-btn az-btn-ghost" style={{ textAlign: 'center', display: 'block' }}>
              Ver todos os pedidos
            </Link>
            <Link href="/catalogo" style={{ textAlign: 'center', fontSize: 11, color: 'var(--color-text-light)', letterSpacing: '0.1em', display: 'block' }}>
              Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
