'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/actions/auth-guard';
import { deleteImage } from '@/lib/supabase/storage';
import { reaisToCents } from '@/lib/utils/currency';
import { slugify } from '@/lib/utils/slugify';

function parseProductForm(formData: FormData) {
  const name = (formData.get('name') as string).trim();
  const slug = (formData.get('slug') as string).trim();
  const description = (formData.get('description') as string | null)?.trim() || null;
  const category_id = (formData.get('category_id') as string | null) || null;
  const material = (formData.get('material') as string | null)?.trim() || null;

  const price_cents = reaisToCents(formData.get('price') as string);
  const promo_raw = (formData.get('promotional_price') as string | null)?.trim();
  const promotional_price_cents =
    promo_raw ? reaisToCents(promo_raw) : null;

  const stock = parseInt(formData.get('stock') as string) || 0;
  const weight_grams = parseInt(formData.get('weight_grams') as string) || 0;
  const width_cm = parseFloat(formData.get('width_cm') as string) || 0;
  const height_cm = parseFloat(formData.get('height_cm') as string) || 0;
  const length_cm = parseFloat(formData.get('length_cm') as string) || 0;
  const is_active = formData.getAll('is_active').includes('true');
  const is_featured = formData.getAll('is_featured').includes('true');

  return {
    name,
    slug,
    description,
    category_id,
    material,
    price_cents,
    promotional_price_cents,
    stock,
    weight_grams,
    width_cm,
    height_cm,
    length_cm,
    is_active,
    is_featured,
  };
}

function validateProduct(data: ReturnType<typeof parseProductForm>) {
  if (!data.name) return 'Nome é obrigatório.';
  if (!data.slug) return 'Slug é obrigatório.';
  if (isNaN(data.price_cents) || data.price_cents <= 0) return 'Preço inválido.';
  if (
    data.promotional_price_cents !== null &&
    (isNaN(data.promotional_price_cents) || data.promotional_price_cents >= data.price_cents)
  ) {
    return 'Preço promocional deve ser menor que o preço normal.';
  }
  if (data.stock < 0) return 'Estoque não pode ser negativo.';
  return null;
}

export async function createProduct(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError ?? 'Erro de autenticação.' };

  const data = parseProductForm(formData);
  const validationError = validateProduct(data);
  if (validationError) return { error: validationError };

  // Check duplicate slug
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', data.slug)
    .single();

  if (existing) return { error: 'Já existe um produto com esse slug.' };

  const { data: product, error } = await supabase
    .from('products')
    .insert(data)
    .select('id')
    .single();

  if (error) return { error: error.message };

  // Save images
  const imageUrls = formData.getAll('image_urls[]') as string[];
  const imageAlts = formData.getAll('image_alts[]') as string[];

  const validImages = imageUrls.filter(Boolean);
  if (validImages.length > 0) {
    const images = validImages.map((url, i) => ({
      product_id: product.id,
      url,
      alt_text: imageAlts[i] || data.name,
      display_order: i,
    }));
    await supabase.from('product_images').insert(images);
  }

  revalidatePath('/admin/produtos');
  revalidatePath('/');
  redirect('/admin/produtos');
}

export async function updateProduct(id: string, formData: FormData) {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError ?? 'Erro de autenticação.' };

  const data = parseProductForm(formData);
  const validationError = validateProduct(data);
  if (validationError) return { error: validationError };

  // Check duplicate slug (excluding current)
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', data.slug)
    .neq('id', id)
    .single();

  if (existing) return { error: 'Já existe outro produto com esse slug.' };

  const { error } = await supabase
    .from('products')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };

  // Fetch old images to remove orphaned Storage files
  const { data: oldImages } = await supabase
    .from('product_images')
    .select('url')
    .eq('product_id', id);

  const newImageUrls = (formData.getAll('image_urls[]') as string[]).filter(Boolean);

  // Remove Storage files that are no longer referenced
  if (oldImages) {
    for (const img of oldImages) {
      if (!newImageUrls.includes(img.url)) {
        try {
          const url = new URL(img.url);
          const pathMatch = url.pathname.match(/\/object\/public\/products\/(.+)/);
          if (pathMatch) await deleteImage('products', pathMatch[1]);
        } catch {
          // Non-fatal
        }
      }
    }
  }

  // Replace image records
  await supabase.from('product_images').delete().eq('product_id', id);

  if (newImageUrls.length > 0) {
    const imageAlts = formData.getAll('image_alts[]') as string[];
    const images = newImageUrls.map((url, i) => ({
      product_id: id,
      url,
      alt_text: imageAlts[i] || data.name,
      display_order: i,
    }));
    await supabase.from('product_images').insert(images);
  }

  revalidatePath('/admin/produtos');
  revalidatePath(`/produto/${data.slug}`);
  revalidatePath('/');
  redirect('/admin/produtos');
}

export async function deleteProduct(id: string) {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError ?? 'Erro de autenticação.' };

  // Fetch images before deleting
  const { data: images } = await supabase
    .from('product_images')
    .select('url')
    .eq('product_id', id);

  // Delete image records
  await supabase.from('product_images').delete().eq('product_id', id);

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { error: error.message };

  // Remove Storage files (best-effort)
  if (images) {
    for (const img of images) {
      try {
        const url = new URL(img.url);
        const pathMatch = url.pathname.match(/\/object\/public\/products\/(.+)/);
        if (pathMatch) await deleteImage('products', pathMatch[1]);
      } catch {
        // Non-fatal
      }
    }
  }

  revalidatePath('/admin/produtos');
  revalidatePath('/');
  redirect('/admin/produtos');
}

export async function duplicateProduct(id: string) {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError ?? 'Erro de autenticação.' };

  const { data: product } = await supabase
    .from('products')
    .select('*, product_images(*)')
    .eq('id', id)
    .single();

  if (!product) return { error: 'Produto não encontrado.' };

  const baseSlug = slugify(`${product.name} copia`);

  // Ensure unique slug (max 20 attempts)
  let finalSlug = baseSlug;
  let attempt = 1;
  while (attempt <= 20) {
    const { data: dup } = await supabase
      .from('products')
      .select('id')
      .eq('slug', finalSlug)
      .single();
    if (!dup) break;
    finalSlug = `${baseSlug}-${++attempt}`;
  }

  const { data: newProduct, error } = await supabase
    .from('products')
    .insert({
      name: `${product.name} (cópia)`,
      slug: finalSlug,
      description: product.description,
      category_id: product.category_id,
      material: product.material,
      price_cents: product.price_cents,
      promotional_price_cents: product.promotional_price_cents,
      stock: product.stock,
      weight_grams: product.weight_grams,
      width_cm: product.width_cm,
      height_cm: product.height_cm,
      length_cm: product.length_cm,
      is_active: false, // copy starts inactive
      is_featured: false,
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  // Copy image records (same URLs — no need to duplicate Storage files)
  if (product.product_images?.length > 0) {
    const images = product.product_images.map(
      (img: { url: string; alt_text: string | null; display_order: number }) => ({
        product_id: newProduct.id,
        url: img.url,
        alt_text: img.alt_text,
        display_order: img.display_order,
      })
    );
    await supabase.from('product_images').insert(images);
  }

  revalidatePath('/admin/produtos');
  redirect(`/admin/produtos/${newProduct.id}`);
}
