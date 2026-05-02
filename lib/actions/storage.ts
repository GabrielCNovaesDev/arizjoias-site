'use server';

import { requireAdmin } from '@/lib/actions/auth-guard';
import { uploadImage, deleteImage } from '@/lib/supabase/storage';

const MAX_SIZES: Record<'categories' | 'products', number> = {
  categories: 2 * 1024 * 1024, // 2MB
  products: 5 * 1024 * 1024,   // 5MB
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_BUCKETS: ReadonlyArray<string> = ['categories', 'products'];

export async function uploadImageAction(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  const { error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  const file = formData.get('file') as File | null;
  const bucketRaw = formData.get('bucket') as string | null;
  const path = formData.get('path') as string | null;

  if (!file || !bucketRaw || !path) {
    return { error: 'Dados incompletos para upload.' };
  }

  // Restrict to known buckets only
  if (!ALLOWED_BUCKETS.includes(bucketRaw)) {
    return { error: 'Bucket inválido.' };
  }
  const bucket = bucketRaw as 'categories' | 'products';

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Formato inválido. Use JPG, PNG ou WebP.' };
  }

  const maxSize = MAX_SIZES[bucket];
  if (file.size > maxSize) {
    const mb = maxSize / (1024 * 1024);
    return { error: `Arquivo muito grande. Máximo: ${mb}MB.` };
  }

  // Sanitize path — prevent path traversal
  const safePath = path.replace(/\.\./g, '').replace(/^\/+/, '');
  if (!safePath) return { error: 'Caminho de arquivo inválido.' };

  return uploadImage(bucket, file, safePath);
}

export async function deleteImageAction(
  bucket: 'categories' | 'products',
  path: string
) {
  const { error: authError } = await requireAdmin();
  if (authError) return { error: authError };

  if (!ALLOWED_BUCKETS.includes(bucket)) {
    return { error: 'Bucket inválido.' };
  }

  const safePath = path.replace(/\.\./g, '').replace(/^\/+/, '');
  if (!safePath) return { error: 'Caminho inválido.' };

  return deleteImage(bucket, safePath);
}
