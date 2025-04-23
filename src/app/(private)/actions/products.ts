'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { ProductResponse, CategoryResponse } from '@/types';

export async function addProduct(formData: FormData): Promise<ProductResponse> {
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
      return { success: false, error: 'Required fields are missing' };
    }

    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        category: customCategory || category,
        price,
        unit,
        stock,
        description,
        image_url: imageUrl,
      })
      .select();

    if (error) {
      throw error;
    }

    revalidatePath('/dashboard');
    return { success: true, products: data };
  } catch (error) {
    console.error('Error adding product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to add product',
    };
  }
}

export async function deleteProduct(id: string): Promise<ProductResponse> {
  try {
    const supabase = await createClient();

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

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product',
    };
  }
}

export async function updateProduct(id: string, formData: FormData): Promise<ProductResponse> {
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
      return { success: false, error: 'Required fields are missing' };
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        name,
        category: customCategory || category,
        price,
        unit,
        stock,
        description,
        image_url: imageUrl,
      })
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    revalidatePath('/dashboard');
    return { success: true, products: data };
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product',
    };
  }
}

export async function getCategories(): Promise<CategoryResponse> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .select('category')
      .not('category', 'is', null);

    if (error) {
      throw error;
    }

    const categories = [...new Set(data.map((item: { category: string }) => item.category))];
    return { categories };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch categories',
    };
  }
}
