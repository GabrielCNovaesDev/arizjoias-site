import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { updateProduct, deleteProduct, duplicateProduct } from '@/lib/actions/products';
import { ProductForm } from '@/components/admin/product-form';
import { DeleteProductButton } from '@/components/admin/delete-product-button';
import { centsToReais } from '@/lib/utils/currency';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProdutoPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select('*, product_images(url, alt_text, display_order)')
      .eq('id', id)
      .single(),
    supabase.from('categories').select('id, name').order('display_order'),
  ]);

  if (!product) notFound();

  const sortedImages = (product.product_images ?? []).sort(
    (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
  );

  async function update(formData: FormData) {
    'use server';
    return updateProduct(id, formData);
  }

  // Format prices back to display format
  const priceDisplay = (product.price_cents / 100).toFixed(2).replace('.', ',');
  const promoDisplay = product.promotional_price_cents
    ? (product.promotional_price_cents / 100).toFixed(2).replace('.', ',')
    : '';

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 300, margin: 0 }}>
            {product.name}
          </h1>
          <div style={{ fontSize: 11, color: 'var(--color-text-light)', textAlign: 'right' }}>
            <div>Última atualização</div>
            <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>
              {new Date(product.updated_at).toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
      </div>

      <ProductForm
        action={update}
        categories={categories ?? []}
        defaultValues={{
          name: product.name,
          slug: product.slug,
          description: product.description ?? '',
          category_id: product.category_id,
          material: product.material ?? '',
          price: priceDisplay,
          promotional_price: promoDisplay,
          stock: product.stock,
          weight_grams: product.weight_grams,
          width_cm: product.width_cm,
          height_cm: product.height_cm,
          length_cm: product.length_cm,
          is_active: product.is_active,
          is_featured: product.is_featured,
          images: sortedImages.map((img: { url: string; alt_text: string | null }) => ({
            url: img.url,
            alt_text: img.alt_text,
          })),
        }}
        submitLabel="Salvar alterações"
        extraActions={
          <DeleteProductButton
            productId={id}
            deleteAction={deleteProduct}
            duplicateAction={duplicateProduct}
          />
        }
      />
    </div>
  );
}
