import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';

export default async function CategoriasPage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from('categories')
    .select('*, products(count)')
    .order('display_order');

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 32,
        }}
      >
        <div>
          <div className="az-eyebrow" style={{ marginBottom: 8 }}>
            gerenciar
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 36,
              fontWeight: 300,
              margin: 0,
            }}
          >
            Categorias
          </h1>
        </div>
        <Link
          href="/admin/categorias/nova"
          className="az-btn az-btn-primary"
          style={{ fontSize: 11 }}
        >
          + Nova categoria
        </Link>
      </div>

      <div
        style={{
          background: 'var(--color-bg)',
          border: '1px solid var(--color-primary)',
          overflowX: 'auto',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-primary)' }}>
              {['Imagem', 'Nome', 'Slug', 'Ordem', 'Produtos', 'Ações'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '10px 16px',
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
            {!categories || categories.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: '40px 16px',
                    textAlign: 'center',
                    color: 'var(--color-text-light)',
                  }}
                >
                  Nenhuma categoria cadastrada.{' '}
                  <Link href="/admin/categorias/nova" style={{ color: 'var(--color-sage-dark)' }}>
                    Criar a primeira
                  </Link>
                </td>
              </tr>
            ) : (
              categories.map((cat) => {
                const productCount = Array.isArray(cat.products)
                  ? (cat.products[0] as { count: number } | undefined)?.count ?? 0
                  : 0;
                return (
                  <tr
                    key={cat.id}
                    style={{ borderBottom: '1px solid var(--color-surface)' }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      {cat.image_url ? (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            position: 'relative',
                            background: 'var(--color-surface)',
                            overflow: 'hidden',
                          }}
                        >
                          <Image
                            src={cat.image_url}
                            alt={cat.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            background: 'var(--color-surface)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            color: 'var(--color-text-light)',
                          }}
                        >
                          —
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text)', fontWeight: 400 }}>
                      {cat.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: 11 }}>
                      {cat.slug}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>
                      {cat.display_order}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-muted)' }}>
                      {productCount}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Link
                        href={`/admin/categorias/${cat.id}`}
                        style={{
                          fontSize: 11,
                          color: 'var(--color-sage-dark)',
                          letterSpacing: '0.08em',
                          textDecoration: 'none',
                          borderBottom: '1px solid var(--color-sage-light)',
                          paddingBottom: 1,
                        }}
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
      </div>
    </div>
  );
}
