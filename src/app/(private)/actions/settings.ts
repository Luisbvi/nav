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

    const { error: updateError } = await supabase
      .from('settings')
      .update({
        pagomovil: JSON.stringify({
          phoneNumber: data.phoneNumber,
          bank: data.bank,
          identificationNumber: data.identificationNumber,
          holderName: data.holderName,
        }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    if (updateError) {
      throw new Error(updateError.message);
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

export const updateBinance = async (binanceData: { email: string }) => {
  const supabase = await createClient();
  const { error } = await supabase
    .from('settings')
    .update({ binance: { email: binanceData.email } })
    .single();

  if (error) {
    throw error.message;
  }
};
