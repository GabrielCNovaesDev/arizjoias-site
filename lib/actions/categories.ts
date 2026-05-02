'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/actions/auth-guard';
import { deleteImage } from '@/lib/supabase/storage';

export async function createCategory(formData: FormData) {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError ?? 'Erro de autenticação.' };

  const name = (formData.get('name') as string).trim();
  const slug = (formData.get('slug') as string).trim();
  const description = (formData.get('description') as string | null)?.trim() || null;
  const display_order = parseInt(formData.get('display_order') as string) || 0;
  const image_url = (formData.get('image_url') as string | null)?.trim() || null;

  if (!name || !slug) {
    return { error: 'Nome e slug são obrigatórios.' };
  }

  // Check duplicate slug
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) {
    return { error: 'Já existe uma categoria com esse slug.' };
  }

  const { error } = await supabase.from('categories').insert({
    name,
    slug,
    description,
    display_order,
    image_url,
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/categorias');
  revalidatePath('/');
  redirect('/admin/categorias');
}

export async function updateCategory(id: string, formData: FormData) {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError ?? 'Erro de autenticação.' };

  const name = (formData.get('name') as string).trim();
  const slug = (formData.get('slug') as string).trim();
  const description = (formData.get('description') as string | null)?.trim() || null;
  const display_order = parseInt(formData.get('display_order') as string) || 0;
  const image_url = (formData.get('image_url') as string | null)?.trim() || null;

  if (!name || !slug) {
    return { error: 'Nome e slug são obrigatórios.' };
  }

  // Check duplicate slug (excluding current)
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .neq('id', id)
    .single();

  if (existing) {
    return { error: 'Já existe outra categoria com esse slug.' };
  }

  const { error } = await supabase
    .from('categories')
    .update({ name, slug, description, display_order, image_url })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/categorias');
  revalidatePath('/');
  redirect('/admin/categorias');
}

export async function deleteCategory(id: string) {
  const { error: authError, supabase } = await requireAdmin();
  if (authError || !supabase) return { error: authError ?? 'Erro de autenticação.' };

  // Check for active products
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)
    .eq('is_active', true);

  if (count && count > 0) {
    return {
      error: `Não é possível excluir: há ${count} produto(s) ativo(s) nessa categoria. Desative-os primeiro.`,
    };
  }

  // Fetch image_url before deleting so we can remove from Storage
  const { data: category } = await supabase
    .from('categories')
    .select('image_url')
    .eq('id', id)
    .single();

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) return { error: error.message };

  // Remove image from Storage (best-effort — don't fail if this errors)
  if (category?.image_url) {
    try {
      const url = new URL(category.image_url);
      // Path after /object/public/categories/
      const pathMatch = url.pathname.match(/\/object\/public\/categories\/(.+)/);
      if (pathMatch) {
        await deleteImage('categories', pathMatch[1]);
      }
    } catch {
      // Non-fatal: image cleanup failure shouldn't block the delete
    }
  }

  revalidatePath('/admin/categorias');
  revalidatePath('/');
  redirect('/admin/categorias');
}
