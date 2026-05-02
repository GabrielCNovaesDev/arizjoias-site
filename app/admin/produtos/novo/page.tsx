import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createProduct } from '@/lib/actions/products';
import { ProductForm } from '@/components/admin/product-form';

export default async function NovoProdutoPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('display_order');

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/admin/produtos"
          style={{
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--color-text-light)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 16,
          }}
        >
          ← Produtos
        </Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, margin: 0 }}>
          Novo produto
        </h1>
      </div>

      <ProductForm
        action={createProduct}
        categories={categories ?? []}
        submitLabel="Criar produto"
      />
    </div>
  );
}
