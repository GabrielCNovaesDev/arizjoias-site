import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { centsToReais } from '@/lib/utils/currency';

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
  paid: 'var(--color-sage-dark)',
  preparing: 'var(--color-sage-dark)',
  shipped: '#2563eb',
  delivered: 'var(--color-sage-dark)',
  cancelled: '#b91c1c',
  refunded: '#6b7280',
};

export default async function MeusPedidosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/conta/pedidos');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders } = await (supabase as any)
    .from('orders')
    .select('id, status, total_cents, created_at, payment_method, order_items(product_name, quantity)')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '80vh', padding: '48px 48px 96px' }}>
      <div style={{ marginBottom: 40 }}>
        <div className="az-eyebrow" style={{ marginBottom: 8 }}>minha conta</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 300, margin: 0 }}>
          Meus pedidos
        </h1>
      </div>

      {!orders?.length ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <p style={{ fontSize: 14, color: 'var(--color-text-muted)', marginBottom: 20 }}>
            Você ainda não fez nenhum pedido.
          </p>
          <Link href="/catalogo" className="az-btn az-btn-primary">
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderTop: '1px solid var(--color-primary)' }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {(orders as any[]).map((order: any) => {
            const status = order.status as OrderStatus;
            const orderNumber = order.id.slice(0, 8).toUpperCase();
            const itemCount = (order.order_items as { quantity: number }[]).reduce(
              (sum, i) => sum + i.quantity, 0
            );
            const firstItemName = (order.order_items as { product_name: string }[])[0]?.product_name ?? '';

            return (
              <Link
                key={order.id}
                href={`/pedido/${order.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 24,
                  padding: '20px 0',
                  borderBottom: '1px solid var(--color-primary)',
                  textDecoration: 'none',
                  alignItems: 'center',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--color-text)' }}>
                      Pedido #{orderNumber}
                    </span>
                    <span style={{
                      fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                      padding: '3px 8px', border: `1px solid ${STATUS_COLORS[status]}`,
                      color: STATUS_COLORS[status],
                    }}>
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                    {firstItemName}{itemCount > 1 ? ` e mais ${itemCount - 1} ${itemCount - 1 === 1 ? 'item' : 'itens'}` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-light)' }}>
                    {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--color-gold)' }}>
                    {centsToReais(order.total_cents)}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 4 }}>
                    Ver detalhes →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
