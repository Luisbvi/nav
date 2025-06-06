'use server';

import { createClient } from '@/utils/supabase/client';

interface PagomovilData {
  phoneNumber: string;
  bank: string;
  identificationNumber: string;
  holderName: string;
}

interface SettingsData {
  pagomovil: PagomovilData | string;
}

export async function getPagomovilSettings(): Promise<SettingsData | null> {
  try {
    const supabase = createClient();

    // Buscar la configuración en la tabla settings (solo habrá un registro)
    const { data, error } = await supabase
      .from('settings')
      .select('pagomovil')
      .eq('id', 1) // Siempre usamos el registro con ID 1
      .single();

    if (error) {
      // Si no existe el registro, retornamos null para crear uno nuevo
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching pagomovil settings:', error);
    throw error;
  }
}

export async function updatePagomovil(pagomovilData: PagomovilData): Promise<void> {
  try {
    const supabase = createClient();

    // Intentar actualizar el registro con ID 1
    const { data: existingData } = await supabase
      .from('settings')
      .select('id')
      .eq('id', 1)
      .single();

    if (existingData) {
      // Si existe, actualizar
      const { error } = await supabase
        .from('settings')
        .update({
          pagomovil: JSON.stringify(pagomovilData),
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) {
        throw error;
      }
    } else {
      // Si no existe, crear nuevo registro con ID 1
      const { error } = await supabase.from('settings').insert({
        id: 1,
        pagomovil: JSON.stringify(pagomovilData),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error updating pagomovil settings:', error);
    throw error;
  }
}
