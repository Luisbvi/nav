'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client'; // Asegúrate de tener esto configurado

export interface BinancePaymentData {
  name: string;
  reference: string;
  amount: number;
}

interface BinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: BinancePaymentData) => void;
  total: number;
  isSubmitting: boolean;
}

export default function BinanceModal({
  isOpen,
  onClose,
  onSubmit,
  total,
  isSubmitting,
}: BinanceModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    reference: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [binanceUser, setBinanceUser] = useState<string>('');
  const [loadingBinanceUser, setLoadingBinanceUser] = useState<boolean>(true);

  const totalInBolivars = total;

  useEffect(() => {
    const fetchBinanceUser = async () => {
      const supabase = createClient();
      try {
        setLoadingBinanceUser(true);
        const { data, error } = await supabase.from('settings').select('binance').single();

        if (error) throw error;

        if (data?.binance?.email) {
          setBinanceUser(data.binance.email);
        }
      } catch (error) {
        console.error('Error fetching Binance user:', error);
      } finally {
        setLoadingBinanceUser(false);
      }
    };

    if (isOpen) {
      fetchBinanceUser();
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('name_required');
    }

    if (!formData.reference.trim()) {
      newErrors.reference = t('reference_required');
    } else if (formData.reference.length < 6) {
      newErrors.reference = t('reference_min_length');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const paymentData: BinancePaymentData = {
      name: formData.name,
      reference: formData.reference,
      amount: totalInBolivars,
    };

    onSubmit(paymentData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <svg
              className="h-6 w-6 text-yellow-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l3.09 3.09L12 8.18l-3.09-3.09L12 2zm6.36 3.64L22 9.27l-3.64 3.64-2.73-2.73 2.73-2.73zm-12.72 0l2.73 2.73-2.73 2.73L2 9.27l3.64-3.63zM12 9.27l3.09 3.09-3.09 3.09-3.09-3.09L12 9.27zm6.36 6.36l2.73 2.73L18.36 22 15.64 19.27l2.72-2.73zm-12.72 0l2.73 2.73L5.64 22 2.91 19.27l2.73-2.73z" />
            </svg>
            {t('binance_payment')}
          </DialogTitle>
          <DialogDescription>{t('binance_payment_description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment amount display */}
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('amount_to_pay') || 'Amount to pay'}:
              </span>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {total.toFixed(2)} $
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ${total.toFixed(2)} USDT
                </div>
              </div>
            </div>
          </div>

          {/* Binance user info */}
          {loadingBinanceUser ? (
            <div className="flex items-center justify-center p-4">
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {t('loading')}...
            </div>
          ) : binanceUser ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <h4 className="mb-1 font-medium text-blue-800 dark:text-blue-200">
                {t('send_to') || 'Send to'}:
              </h4>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {binanceUser}
              </p>
              <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                {t('binance_user_instructions') ||
                  'Please send the exact amount to this Binance ID'}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-red-800 dark:text-red-200">
                {t('binance_user_not_found') ||
                  'Binance payment information not available. Please contact support.'}
              </p>
            </div>
          )}

          {/* Payment instructions */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <h4 className="mb-2 font-medium text-yellow-800 dark:text-yellow-200">
              {t('payment_instructions') || 'Payment Instructions'}:
            </h4>
            <ul className="space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
              <li>• {t('binance_instruction_1')}</li>
              <li>• {t('binance_instruction_2')}</li>
              <li>• {t('binance_instruction_3')}</li>
            </ul>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="binance-name">{t('full_name')}</Label>
              <Input
                id="binance-name"
                type="text"
                placeholder={t('enter_full_name') || 'Enter your full name'}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="binance-reference">{t('payment_reference')}</Label>
              <Input
                id="binance-reference"
                type="text"
                placeholder={t('enter_payment_reference') || 'Enter your payment reference'}
                value={formData.reference}
                onChange={(e) => handleInputChange('reference', e.target.value)}
                className={errors.reference ? 'border-red-500' : ''}
              />
              {errors.reference && <p className="text-sm text-red-500">{errors.reference}</p>}
            </div>
          </form>
        </div>

        <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !binanceUser}
            className="w-full bg-yellow-600 hover:bg-yellow-700 sm:w-auto dark:bg-yellow-500 dark:hover:bg-yellow-600"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {t('processing')}...
              </div>
            ) : (
              t('confirm_payment')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
