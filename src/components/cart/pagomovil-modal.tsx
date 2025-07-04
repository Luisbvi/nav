'use client';

import type React from 'react';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { banks } from '@/utils/orders';
import { usePagomovilInfo } from '@/utils/pagmovil';

interface PagomovilModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (paymentData: PagomovilPaymentData) => void;
  total: number;
  rate: number;
  isSubmitting: boolean;
}

export interface PagomovilPaymentData {
  reference: string;
  name: string;
  bank: string;
  phone: string;
  idNumber: string;
}

export default function PagomovilModal({
  isOpen,
  onClose,
  onSubmit,
  total,
  rate,
  isSubmitting,
}: PagomovilModalProps) {
  const { t } = useLanguage();
  const bolivares = (total * rate).toFixed(2);
  const [formData, setFormData] = useState<PagomovilPaymentData>({
    reference: '',
    name: '',
    bank: '',
    phone: '',
    idNumber: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof PagomovilPaymentData, string>>>({});

  const { pagomovilInfo, loading: pagomovilLoading } = usePagomovilInfo();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement> | string, name?: string) => {
    if (typeof e === 'string' && name) {
      setFormData((prev) => ({
        ...prev,
        [name]: e,
      }));

      if (errors[name as keyof PagomovilPaymentData]) {
        setErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
      return;
    }

    if (typeof e !== 'string') {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      if (errors[name as keyof PagomovilPaymentData]) {
        setErrors((prev) => ({
          ...prev,
          [name]: '',
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PagomovilPaymentData, string>> = {};
    let isValid = true;

    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key as keyof PagomovilPaymentData] =
          t('field_required') || 'This field is required';
        isValid = false;
      }
    });

    if (!/^04\d{2}-\d{7}$/.test(formData.phone)) {
      newErrors.phone = t('invalid_phone_format') || 'Invalid phone format (0412-1234567)';
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {pagomovilLoading || !pagomovilInfo ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-gray-800/80">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Loading...</span>
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative z-10 mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {t('pagomovil_payment')}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="my-4 rounded-md border bg-blue-50 p-4 dark:border-gray-700 dark:bg-blue-900/20">
            <h4 className="mb-3 font-medium text-blue-800 dark:text-blue-300">
              {t('pagomovil_details')}
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{t('id_number')}:</span>
                <span>{pagomovilInfo?.identificationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('bank')}:</span>
                <span>
                  {pagomovilInfo?.bank
                    ? `${pagomovilInfo.bank} - ${banks.find((bank) => bank.code === pagomovilInfo.bank)?.name || 'Banco desconocido'}`
                    : 'Banco no especificado'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('phone')}:</span>
                <span>{pagomovilInfo?.phoneNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('rate')}:</span>
                <span>{rate} Bs x $</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2 dark:border-blue-800">
                <span className="font-medium">{t('amount')}:</span>
                <span className="font-bold">{bolivares} Bs.</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reference">{t('payment_reference')}</Label>
              <Input
                id="reference"
                name="reference"
                placeholder={t('reference_placeholder')}
                value={formData.reference}
                onChange={handleChange}
                className={errors.reference ? 'border-red-500' : ''}
              />
              {errors.reference && <p className="mt-1 text-xs text-red-500">{errors.reference}</p>}
            </div>

            <div>
              <Label htmlFor="name">{t('payer_name')}</Label>
              <Input
                id="name"
                name="name"
                placeholder={t('name_placeholder')}
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="bank">{t('payer_bank')}</Label>
              <Select value={formData.bank} onValueChange={(value) => handleChange(value, 'bank')}>
                <SelectTrigger
                  className={`${errors.bank ? 'border-red-500' : ''} w-full cursor-pointer`}
                >
                  <SelectValue placeholder={t('select_bank')} />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {banks.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.code} - {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.bank && <p className="mt-1 text-xs text-red-500">{errors.bank}</p>}
            </div>

            <div>
              <Label htmlFor="phone">{t('payer_phone')}</Label>
              <Input
                id="phone"
                name="phone"
                placeholder={t('phone_placeholder')}
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div>
              <Label htmlFor="idNumber">{t('payer_id_number')}</Label>
              <Input
                id="idNumber"
                name="idNumber"
                placeholder={t('id_placeholder')}
                value={formData.idNumber}
                onChange={handleChange}
                className={errors.idNumber ? 'border-red-500' : ''}
              />
              {errors.idNumber && <p className="mt-1 text-xs text-red-500">{errors.idNumber}</p>}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 animate-spin text-white"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t('processing')}...
                  </div>
                ) : (
                  t('confirm_payment')
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
