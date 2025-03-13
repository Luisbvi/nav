'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface ProductResponse {
  success?: boolean;
  error?: string;
}

interface CategoryResponse {
  categories?: string[];
  error?: string;
}

export async function addProduct(formData: FormData): Promise<ProductResponse> {
  try {
    const supabase = await createClient();

    // Extraer datos del formulario
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const customCategory = formData.get('customCategory') as string;
    const price = parseFloat(formData.get('price') as string);
    const unit = formData.get('unit') as string;
    const stock = parseInt(formData.get('stock') as string);
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;

    // Validar datos básicos
    if (!name || !category || isNaN(price) || isNaN(stock)) {
      return { error: 'Faltan campos requeridos' };
    }

    // Insertar producto
    const { error } = await supabase.from('products').insert({
      name,
      category: customCategory || category,
      price,
      unit,
      stock,
      description,
      image_url: imageUrl,
    });

    if (error) {
      throw error;
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error: Error | unknown) {
    console.error('Error al añadir producto:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

export async function deleteProduct(id: string): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();

    // Primero eliminar la imagen si existe
    const { data: product } = await supabase
      .from('products')
      .select('image_url')
      .eq('id', id)
      .single();

    if (product?.image_url) {
      const path = product.image_url.split('/').pop();
      if (path) {
        await supabase.storage.from('products-images').remove([`images/${path}`]);
      }
    }

    // Eliminar el producto
    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      throw error;
    }

    revalidatePath('/dashboard');
    return {};
  } catch (error: Error | unknown) {
    console.error('Error al eliminar producto:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

export async function updateProduct(id: string, formData: FormData): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();

    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const customCategory = formData.get('customCategory') as string;
    const price = parseFloat(formData.get('price') as string);
    const unit = formData.get('unit') as string;
    const stock = parseInt(formData.get('stock') as string);
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;

    if (!name || !category || isNaN(price) || isNaN(stock)) {
      return { error: 'Faltan campos requeridos' };
    }

    const { error } = await supabase
      .from('products')
      .update({
        name,
        category: customCategory || category,
        price,
        unit,
        stock,
        description,
        image_url: imageUrl || null,
      })
      .eq('id', id);

    if (error) {
      throw error;
    }

    revalidatePath('/dashboard');
    return {};
  } catch (error: Error | unknown) {
    console.error('Error al actualizar producto:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}

export async function getCategories(): Promise<CategoryResponse> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('products').select('category').order('category');

    if (error) {
      throw error;
    }

    const categories = [...new Set(data.map((item) => item.category))];
    return { categories };
  } catch (error: Error | unknown) {
    console.error('Error al obtener categorías:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error occurred' };
  }
}
