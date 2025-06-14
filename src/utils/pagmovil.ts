// utils/pagomovil.ts
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect, useCallback } from 'react';

export interface PagomovilInfo {
  phoneNumber: string;
  bank: string;
  identificationNumber: string;
  holderName: string;
}

/**
 * Obtiene la información de Pagomovil del admin para mostrar en el checkout
 */
export async function getPagomovilInfo(): Promise<PagomovilInfo | null> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('settings')
      .select('pagomovil')
      .eq('id', 1)
      .single();

    if (error || !data?.pagomovil) {
      return null;
    }

    const pagomovilData =
      typeof data.pagomovil === 'string' ? JSON.parse(data.pagomovil) : data.pagomovil;

    return pagomovilData;
  } catch (error) {
    console.error('Error fetching pagomovil info:', error);
    return null;
  }
}

/**
 * Formatea la información de Pagomovil para mostrar al usuario
 */
export function formatPagomovilInfo(info: PagomovilInfo): {
  displayPhone: string;
  displayBank: string;
  displayId: string;
  displayName: string;
} {
  return {
    displayPhone: info.phoneNumber.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3'),
    displayBank: info.bank,
    displayId: info.identificationNumber.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.'),
    displayName: info.holderName,
  };
}

/**
 * Hook para usar en componentes de React (lado cliente)
 */
export function usePagomovilInfo() {
  const [pagomovilInfo, setPagomovilInfo] = useState<PagomovilInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPagomovilInfo = useCallback(async () => {
    try {
      setLoading(true);
      const info = await getPagomovilInfo();
      setPagomovilInfo(info);
      setError(null);
    } catch (err) {
      setError('Error loading payment information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPagomovilInfo();
  }, [fetchPagomovilInfo]);

  return { pagomovilInfo, loading, error, refetch: fetchPagomovilInfo };
}

export const useBinanceInfo = () => {
  const [binanceInfo, setBinanceInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error: supabaseError } = await supabase
        .from('settings')
        .select('binance')
        .single();

      if (supabaseError) throw supabaseError;

      setBinanceInfo(data?.binance || {});
      setError(null);
    } catch (err) {
      setError('Error loading Binance information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { binanceInfo, loading, error, refetch };
};
