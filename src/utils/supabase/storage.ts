import { createClient } from "@/utils/supabase/server";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Función para subir una imagen desde el servidor
export async function uploadImageServer(
  file: File,
  bucket: string,
  path: string,
  options?: { upsert?: boolean }
) {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: options?.upsert || false,
      contentType: file.type,
    });

  if (error) {
    throw error;
  }

  // Obtener la URL pública
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(path);

  return { path: data.path, publicUrl };
}

// Función para subir una imagen desde el cliente
export function uploadImageClient() {
  const supabase = createClientComponentClient();

  return {
    upload: async (
      file: File,
      bucket: string,
      path: string,
      options?: { upsert?: boolean }
    ) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          upsert: options?.upsert || false,
          contentType: file.type,
        });

      if (error) {
        throw error;
      }

      // Obtener la URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(path);

      return { path: data.path, publicUrl };
    },

    delete: async (bucket: string, path: string) => {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) {
        throw error;
      }

      return true;
    },

    list: async (bucket: string, folder?: string) => {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder || "");

      if (error) {
        throw error;
      }

      return data;
    },
  };
}
