import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { KpiCard } from '@/components/admin/kpi-card';

const IconBox = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 8 12 4l9 4v9l-9 4-9-4Z" /><path d="M3 8l9 4 9-4" /><path d="M12 12v9" />
  </svg>
);
const IconCheck = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const IconTag = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2H2v10l10 10 10-10L12 2z" /><circle cx="7" cy="7" r="1.5" fill="currentColor" />
  </svg>
);
const IconAlert = () => (
  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch KPI data in parallel
  const [
    { count: totalProducts },
    { count: activeProducts },
    { count: totalCategories },
    { data: lowStockProducts },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase
      .from('products')
      .select('id, name, slug, stock, is_active')
      .eq('is_active', true)
      .lt('stock', 5)
      .order('stock', { ascending: true })
      .limit(5),
  ]);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div className="az-eyebrow" style={{ marginBottom: 8 }}>visão geral</div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 300,
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          Dashboard
        </h1>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 40,
        }}
      >
        <KpiCard
          label="Total de produtos"
          value={totalProducts ?? 0}
          icon={<IconBox />}
          accent="var(--color-sage)"
        />
        <KpiCard
          label="Produtos ativos"
          value={activeProducts ?? 0}
          sub={`${totalProducts ? Math.round(((activeProducts ?? 0) / totalProducts) * 100) : 0}% do catálogo`}
          icon={<IconCheck />}
          accent="var(--color-sage-dark)"
        />
        <KpiCard
          label="Categorias"
          value={totalCategories ?? 0}
          icon={<IconTag />}
          accent="var(--color-gold)"
        />
        <KpiCard
          label="Estoque baixo"
          value={lowStockProducts?.length ?? 0}
          sub="menos de 5 unidades"
          icon={<IconAlert />}
          accent="var(--color-gold-dark)"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Low stock */}
        <div
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-primary)',
            padding: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 18,
                fontWeight: 300,
                margin: 0,
              }}
            >
              Estoque crítico
            </h2>
            <Link href="/admin/produtos" className="az-btn-link" style={{ fontSize: 10 }}>
              Ver todos
            </Link>
          </div>

          {!lowStockProducts || lowStockProducts.length === 0 ? (
            <p style={{ fontSize: 12, color: 'var(--color-text-light)', margin: 0 }}>
              Nenhum produto com estoque baixo.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--color-surface)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--color-text)' }}>{p.name}</div>
                    <div
                      style={{
                        fontSize: 10,
                        color: p.is_active ? 'var(--color-sage)' : 'var(--color-text-light)',
                        marginTop: 2,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {p.is_active ? 'ativo' : 'inativo'}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: p.stock === 0 ? 'var(--color-gold-dark)' : 'var(--color-text-muted)',
                    }}
                  >
                    {p.stock} un.
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Last orders placeholder */}
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
            Últimos pedidos
          </h2>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px 0',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
              Disponível na Sprint 4
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
