'use server';

import { uploadImage, deleteImage } from '@/lib/supabase/storage';

const MAX_SIZES = {
  categories: 2 * 1024 * 1024, // 2MB
  products: 5 * 1024 * 1024,   // 5MB
};

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadImageAction(
  formData: FormData
): Promise<{ url: string } | { error: string }> {
  const file = formData.get('file') as File | null;
  const bucket = formData.get('bucket') as 'categories' | 'products' | null;
  const path = formData.get('path') as string | null;

  if (!file || !bucket || !path) {
    return { error: 'Dados incompletos para upload.' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Formato inválido. Use JPG, PNG ou WebP.' };
  }

  const maxSize = MAX_SIZES[bucket];
  if (file.size > maxSize) {
    const mb = maxSize / (1024 * 1024);
    return { error: `Arquivo muito grande. Máximo: ${mb}MB.` };
  }

  return uploadImage(bucket, file, path);
}

export async function deleteImageAction(bucket: string, path: string) {
  return deleteImage(bucket, path);
}
