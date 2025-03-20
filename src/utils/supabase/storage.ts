'use client';

import { createClient } from '@/utils/supabase/client';

// Función para subir una imagen desde el cliente
export async function upload(
  file: File,
  bucket: string,
  fileName: string,
  options = { upsert: false }
) {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, options);

  if (error) throw error;

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName);

  return { data, publicUrl: publicUrl.publicUrl };
}
