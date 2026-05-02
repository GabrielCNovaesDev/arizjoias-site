import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CategoryForm } from '@/components/admin/category-form';
import { updateCategory, deleteCategory } from '@/lib/actions/categories';
import { DeleteCategoryButton } from '@/components/admin/delete-category-button';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoriaPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (!category) notFound();

  async function update(formData: FormData) {
    'use server';
    return updateCategory(id, formData);
  }

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
          Editar categoria
        </h1>
      </div>

      <CategoryForm
        action={update}
        defaultValues={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? '',
          display_order: category.display_order,
          image_url: category.image_url ?? '',
        }}
        submitLabel="Salvar alterações"
        extraActions={
          <DeleteCategoryButton categoryId={id} deleteAction={deleteCategory} />
        }
      />
    </div>
  );
}
