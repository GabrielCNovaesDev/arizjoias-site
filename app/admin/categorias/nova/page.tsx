import Link from 'next/link';
import { createCategory } from '@/lib/actions/categories';
import { CategoryForm } from '@/components/admin/category-form';

export default function NovaCategoriaPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <Link
          href="/admin/categorias"
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
          ← Categorias
        </Link>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 36,
            fontWeight: 300,
            margin: 0,
          }}
        >
          Nova categoria
        </h1>
      </div>

      <CategoryForm action={createCategory} submitLabel="Criar categoria" />
    </div>
  );
}
