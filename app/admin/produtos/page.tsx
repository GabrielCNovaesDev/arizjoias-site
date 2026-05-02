import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import { centsToReais } from '@/lib/utils/currency';

interface Props {
  searchParams: Promise<{ categoria?: string; status?: string; q?: string; page?: string }>;
}

const PAGE_SIZE = 50;

export default async function ProdutosPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1');
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('display_order');

  // Build query
  let query = supabase
    .from('products')
    .select('id, name, slug, price_cents, promotional_price_cents, stock, is_active, is_featured, category_id, categories(name), product_images(url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (params.categoria) query = query.eq('category_id', params.categoria);
  if (params.status === 'ativo') query = query.eq('is_active', true);
  if (params.status === 'inativo') query = query.eq('is_active', false);
  if (params.q) query = query.ilike('name', `%${params.q}%`);

  const { data: products, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 24,
        }}
      >
        <div>
          <div className="az-eyebrow" style={{ marginBottom: 8 }}>gerenciar</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, margin: 0 }}>
            Produtos
          </h1>
        </div>
        <Link href="/admin/produtos/novo" className="az-btn az-btn-primary" style={{ fontSize: 11 }}>
          + Novo produto
        </Link>
      </div>

      {/* Filters */}
      <form
        method="GET"
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
      >
        <input
          name="q"
          defaultValue={params.q ?? ''}
          placeholder="Buscar por nome..."
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-primary-dark)',
            padding: '8px 12px',
            fontSize: 12,
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text)',
            width: 220,
          }}
        />
        <select
          name="categoria"
          defaultValue={params.categoria ?? ''}
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-primary-dark)',
            padding: '8px 12px',
            fontSize: 12,
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text)',
          }}
        >
          <option value="">Todas as categorias</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={params.status ?? ''}
          style={{
            background: 'var(--color-bg)',
            border: '1px solid var(--color-primary-dark)',
            padding: '8px 12px',
            fontSize: 12,
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text)',
          }}
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
        <button type="submit" className="az-btn az-btn-ghost" style={{ fontSize: 11, padding: '8px 20px' }}>
          Filtrar
        </button>
        {(params.q || params.categoria || params.status) && (
          <Link href="/admin/produtos" style={{ fontSize: 11, color: 'var(--color-text-light)', alignSelf: 'center' }}>
            Limpar filtros
          </Link>
        )}
      </form>

      {/* Table */}
      <div style={{ background: 'var(--color-bg)', border: '1px solid var(--color-primary)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-primary)' }}>
              {['Imagem', 'Nome', 'Categoria', 'Preço', 'Estoque', 'Status', 'Destaque', 'Ações'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontSize: 9,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-light)',
                    fontWeight: 400,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!products || products.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                  Nenhum produto encontrado.{' '}
                  <Link href="/admin/produtos/novo" style={{ color: 'var(--color-sage-dark)' }}>
                    Criar o primeiro
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const thumb = Array.isArray(p.product_images) && p.product_images.length > 0
                  ? (p.product_images[0] as { url: string }).url
                  : null;
                const catName = p.categories
                  ? (p.categories as { name: string }).name
                  : '—';

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-surface)' }}>
                    <td style={{ padding: '10px 14px' }}>
                      {thumb ? (
                        <div style={{ width: 44, height: 44, position: 'relative', background: 'var(--color-surface)', overflow: 'hidden' }}>
                          <Image src={thumb} alt={p.name} fill className="object-cover" sizes="44px" />
                        </div>
                      ) : (
                        <div style={{ width: 44, height: 44, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--color-text-light)' }}>—</div>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text)', maxWidth: 200 }}>
                      <div style={{ fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-light)', fontFamily: 'monospace', marginTop: 2 }}>{p.slug}</div>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--color-text-muted)' }}>{catName}</td>
                    <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                      <div style={{ color: 'var(--color-gold)', fontWeight: 500 }}>{centsToReais(p.price_cents)}</div>
                      {p.promotional_price_cents && (
                        <div style={{ fontSize: 10, color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                          {centsToReais(p.promotional_price_cents)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px', color: p.stock < 5 ? 'var(--color-gold-dark)' : 'var(--color-text-muted)' }}>
                      {p.stock}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        fontSize: 9,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        background: p.is_active ? 'var(--color-sage-pale)' : 'var(--color-surface-2)',
                        color: p.is_active ? 'var(--color-sage-dark)' : 'var(--color-text-light)',
                      }}>
                        {p.is_active ? 'ativo' : 'inativo'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: p.is_featured ? 'var(--color-gold)' : 'var(--color-text-light)' }}>
                      {p.is_featured ? '★' : '—'}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Link
                        href={`/admin/produtos/${p.id}`}
                        style={{ fontSize: 11, color: 'var(--color-sage-dark)', borderBottom: '1px solid var(--color-sage-light)', paddingBottom: 1 }}
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, padding: '16px', borderTop: '1px solid var(--color-primary)' }}>
            {page > 1 && (
              <Link
                href={`/admin/produtos?${new URLSearchParams({ ...params, page: String(page - 1) })}`}
                style={{ border: '1px solid var(--color-primary-dark)', padding: '6px 12px', fontSize: 11, color: 'var(--color-text-muted)' }}
              >
                ←
              </Link>
            )}
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{page} / {totalPages}</span>
            {page < totalPages && (
              <Link
                href={`/admin/produtos?${new URLSearchParams({ ...params, page: String(page + 1) })}`}
                style={{ border: '1px solid var(--color-primary-dark)', padding: '6px 12px', fontSize: 11, color: 'var(--color-text-muted)' }}
              >
                →
              </Link>
            )}
          </div>
        )}
      </div>

      {count !== null && (
        <div style={{ marginTop: 12, fontSize: 11, color: 'var(--color-text-light)' }}>
          {count} produto{count !== 1 ? 's' : ''} encontrado{count !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
