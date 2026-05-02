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

const STATUS_COLORS: Record<OrderStatus, { bg: string; color: string }> = {
  pending_payment: { bg: '#fffbeb', color: '#d97706' },
  paid: { bg: '#f0fdf4', color: '#16a34a' },
  preparing: { bg: '#f0fdf4', color: '#16a34a' },
  shipped: { bg: '#eff6ff', color: '#2563eb' },
  delivered: { bg: '#f0fdf4', color: '#15803d' },
  cancelled: { bg: '#fef2f2', color: '#b91c1c' },
  refunded: { bg: '#f9fafb', color: '#6b7280' },
};

const PAYMENT_LABELS: Record<string, string> = {
  pix: 'PIX',
  credit_card: 'Cartão',
  bolbradesco: 'Boleto',
  pec: 'Boleto',
  debit_card: 'Débito',
};

interface SearchParams {
  status?: string;
  q?: string;
}

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function AdminPedidosPage({ searchParams }: Props) {
  const { status, q } = await searchParams;
  const supabase = await createClient();

  // Explicit admin check — middleware is a second layer, not the only one
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin/pedidos');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('orders')
    .select(`
      id, status, total_cents, payment_method, created_at,
      profiles!profile_id(full_name, email),
      order_items(product_name, quantity)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data: orders } = await query;

  // Client-side search filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filtered = (orders as any[])?.filter((o: any) => {
    if (!q) return true;
    const search = q.toLowerCase();
    const profile = o.profiles as { full_name: string | null; email: string | null } | null;
    return (
      o.id.toLowerCase().includes(search) ||
      profile?.full_name?.toLowerCase().includes(search) ||
      profile?.email?.toLowerCase().includes(search)
    );
  }) ?? [];

  const statusOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'Todos' },
    ...Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    fontSize: 9,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: 'var(--color-text-muted)',
    textAlign: 'left',
    borderBottom: '1px solid var(--color-primary)',
    fontWeight: 400,
    whiteSpace: 'nowrap',
  };

  const tdStyle: React.CSSProperties = {
    padding: '14px 16px',
    fontSize: 12,
    color: 'var(--color-text-muted)',
    borderBottom: '1px solid var(--color-primary)',
    verticalAlign: 'middle',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6 }}>
            Admin
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300, margin: 0 }}>
            Pedidos
          </h1>
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
          {filtered.length} pedido{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <form method="GET" style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por cliente, e-mail ou nº do pedido..."
            style={{
              flex: 1, background: 'var(--color-surface)', border: '1px solid var(--color-primary-dark)',
              padding: '8px 12px', fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--color-text)',
            }}
          />
          {status && <input type="hidden" name="status" value={status} />}
          <button type="submit" className="az-btn az-btn-ghost" style={{ fontSize: 11 }}>Buscar</button>
        </form>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {statusOptions.map((opt) => (
            <Link
              key={opt.value}
              href={`/admin/pedidos?status=${opt.value}${q ? `&q=${q}` : ''}`}
              style={{
                padding: '6px 12px', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
                border: '1px solid var(--color-primary-dark)',
                background: (status ?? 'all') === opt.value ? 'var(--color-text)' : 'transparent',
                color: (status ?? 'all') === opt.value ? 'var(--color-bg)' : 'var(--color-text-muted)',
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-light)', fontSize: 13 }}>
          Nenhum pedido encontrado.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--color-bg)' }}>
            <thead>
              <tr>
                <th style={thStyle}>Pedido</th>
                <th style={thStyle}>Cliente</th>
                <th style={thStyle}>Data</th>
                <th style={thStyle}>Pagamento</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => {
                const status = order.status as OrderStatus;
                const profile = order.profiles as { full_name: string | null; email: string | null } | null;
                const sc = STATUS_COLORS[status];

                return (
                  <tr key={order.id} style={{ transition: 'background 0.1s' }}>
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.08em', color: 'var(--color-text)' }}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: 12, color: 'var(--color-text)' }}>{profile?.full_name ?? '—'}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-light)' }}>{profile?.email ?? ''}</div>
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={tdStyle}>
                      {order.payment_method ? (PAYMENT_LABELS[order.payment_method] ?? order.payment_method) : '—'}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
                      {centsToReais(order.total_cents)}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
                        padding: '3px 8px', background: sc.bg, color: sc.color,
                        border: `1px solid ${sc.color}`, whiteSpace: 'nowrap',
                      }}>
                        {STATUS_LABELS[status]}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
