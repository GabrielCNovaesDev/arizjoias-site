import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { centsToReais } from '@/lib/utils/currency';
import { OrderActions } from '@/components/admin/order-actions';

type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

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
  paid: '#16a34a',
  preparing: '#16a34a',
  shipped: '#2563eb',
  delivered: '#15803d',
  cancelled: '#b91c1c',
  refunded: '#6b7280',
};

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de crédito',
  bolbradesco: 'Boleto bancário',
  pec: 'Boleto bancário',
  debit_card: 'Cartão de débito',
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminPedidoDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Explicit admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/admin/pedidos/${id}`);
  const { data: authProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (authProfile?.role !== 'admin') redirect('/');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order } = await (supabase as any)
    .from('orders')
    .select(`
      *,
      profiles!profile_id(full_name, email),
      order_items(*),
      order_status_history(from_status, to_status, notes, created_at, profiles!changed_by(full_name))
    `)
    .eq('id', id)
    .single();

  if (!order) notFound();

  const status = order.status as OrderStatus;
  const profile = order.profiles as { full_name: string | null; email: string | null } | null;
  const history = (order.order_status_history as {
    from_status: string | null;
    to_status: string;
    notes: string | null;
    created_at: string;
    profiles: { full_name: string | null } | null;
  }[]).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const sectionTitle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    fontWeight: 300,
    margin: '0 0 16px',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <Link href="/admin/pedidos" style={{ fontSize: 11, color: 'var(--color-text-light)', letterSpacing: '0.1em', display: 'block', marginBottom: 8 }}>
            ← Todos os pedidos
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, margin: 0 }}>
              Pedido #{id.slice(0, 8).toUpperCase()}
            </h1>
            <span style={{
              fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
              padding: '4px 10px', border: `1px solid ${STATUS_COLORS[status]}`,
              color: STATUS_COLORS[status],
            }}>
              {STATUS_LABELS[status]}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--color-text-light)', marginTop: 6 }}>
            {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

          {/* Items */}
          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-primary)', padding: '24px' }}>
            <h2 style={sectionTitle}>Itens do pedido</h2>
            <div style={{ borderTop: '1px solid var(--color-primary)' }}>
              {(order.order_items as {
                id: string;
                product_name: string;
                product_slug: string;
                product_image_url: string | null;
                unit_price_cents: number;
                quantity: number;
                subtotal_cents: number;
              }[]).map((item) => (
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--color-primary)', alignItems: 'center' }}>
                  <div style={{ width: 56, height: 66, position: 'relative', background: 'var(--color-surface)', overflow: 'hidden' }}>
                    {item.product_image_url ? (
                      <Image src={item.product_image_url} alt={item.product_name} fill className="object-cover" sizes="56px" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'var(--color-surface)' }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--color-text)' }}>{item.product_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 3 }}>
                      {centsToReais(item.unit_price_cents)} × {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>
                    {centsToReais(item.subtotal_cents)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)' }}>
                <span>Subtotal</span><span>{centsToReais(order.subtotal_cents)}</span>
              </div>
              {order.discount_cents > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-sage-dark)' }}>
                  <span>Desconto</span><span>− {centsToReais(order.discount_cents)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--color-text-muted)' }}>
                <span>Frete ({order.shipping_method_name})</span><span>{centsToReais(order.shipping_price_cents)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 500, color: 'var(--color-text)', paddingTop: 10, borderTop: '1px solid var(--color-primary)', marginTop: 4 }}>
                <span>Total</span><span style={{ color: 'var(--color-gold)' }}>{centsToReais(order.total_cents)}</span>
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-primary)', padding: '24px' }}>
            <h2 style={sectionTitle}>Entrega</h2>
            <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
              <strong style={{ color: 'var(--color-text)' }}>{order.shipping_recipient_name}</strong><br />
              {order.shipping_street}, {order.shipping_number}
              {order.shipping_complement ? `, ${order.shipping_complement}` : ''} — {order.shipping_district}<br />
              {order.shipping_city} / {order.shipping_state} · {order.shipping_zip_code.replace(/(\d{5})(\d{3})/, '$1-$2')}<br />
              <span style={{ fontSize: 11, color: 'var(--color-text-light)' }}>
                {order.shipping_method_name} ({order.shipping_company}) · {order.shipping_delivery_days} dias úteis
              </span>
            </div>
            {order.tracking_code && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--color-primary)' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  Código de rastreio
                </div>
                <a
                  href={`https://rastreamento.correios.com.br/app/index.php?objeto=${order.tracking_code}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--color-sage-dark)', letterSpacing: '0.08em' }}
                >
                  {order.tracking_code}
                </a>
              </div>
            )}
          </div>

          {/* Status history */}
          {history.length > 0 && (
            <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-primary)', padding: '24px' }}>
              <h2 style={sectionTitle}>Histórico de status</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {history.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-sage)', marginTop: 4, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--color-text)' }}>
                        {h.from_status ? `${STATUS_LABELS[h.from_status as OrderStatus]} → ` : ''}{STATUS_LABELS[h.to_status as OrderStatus]}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-light)', marginTop: 2 }}>
                        {new Date(h.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {h.profiles?.full_name ? ` · ${h.profiles.full_name}` : ' · Sistema'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Actions */}
          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-primary)', padding: '20px' }}>
            <h2 style={{ ...sectionTitle, fontSize: 15 }}>Ações</h2>
            <OrderActions orderId={id} currentStatus={status} />
          </div>

          {/* Customer */}
          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-primary)', padding: '20px' }}>
            <h2 style={{ ...sectionTitle, fontSize: 15 }}>Cliente</h2>
            <div style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 4 }}>{profile?.full_name ?? '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{profile?.email ?? '—'}</div>
          </div>

          {/* Payment */}
          <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-primary)', padding: '20px' }}>
            <h2 style={{ ...sectionTitle, fontSize: 15 }}>Pagamento</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Método</span>
                <span style={{ color: 'var(--color-text)' }}>
                  {order.payment_method ? (PAYMENT_LABELS[order.payment_method] ?? order.payment_method) : '—'}
                </span>
              </div>
              {order.mp_payment_id && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>ID MP</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-light)' }}>{order.mp_payment_id}</span>
                </div>
              )}
              {order.payment_confirmed_at && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Confirmado em</span>
                  <span style={{ color: 'var(--color-text)' }}>
                    {new Date(order.payment_confirmed_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
