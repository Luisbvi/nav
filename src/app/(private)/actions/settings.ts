'use server';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

interface PagomovilData {
  phoneNumber: string;
  bank: string;
  identificationNumber: string;
  holderName: string;
}

interface OperationResult {
  success: boolean;
  error?: string;
}

export async function updatePagomovil(data: PagomovilData): Promise<OperationResult> {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      throw new Error('No se pudo obtener el usuario actual');
    }

    const userId = userData.user.id;

    const { data: existingData, error: fetchError } = await supabase
      .from('pagomovil_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    let result;

    if (existingData) {
      // Update existing record
      result = await supabase
        .from('pagomovil_settings')
        .update({
          phone_number: data.phoneNumber,
          bank: data.bank,
          identification_number: data.identificationNumber,
          holder_name: data.holderName,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);
    } else {
      // Insert new record
      result = await supabase.from('pagomovil_settings').insert({
        user_id: userId,
        phone_number: data.phoneNumber,
        bank: data.bank,
        identification_number: data.identificationNumber,
        holder_name: data.holderName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    if (result.error) {
      throw result.error;
    }

    revalidatePath('/settings');
    return { success: true };
  } catch (error) {
    console.error('Error updating pagomovil settings:', error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Error desconocido' };
  }
}
