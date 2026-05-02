import { createClient } from '@/lib/supabase/server';

export async function uploadImage(
  bucket: 'categories' | 'products',
  file: File,
  path: string
): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, cacheControl: '3600' });

  if (error) return { error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return { url: publicUrl };
}

export async function deleteImage(bucket: string, path: string) {
  const supabase = await createClient();
  return supabase.storage.from(bucket).remove([path]);
}
