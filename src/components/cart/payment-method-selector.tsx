'use client';

import { useLanguage } from '@/contexts/language-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Banknote, Smartphone } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  total: number;
  rate: number;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
}: PaymentMethodSelectorProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t('payment_methods')}</h3>

      <RadioGroup value={selectedMethod} onValueChange={onMethodChange} className="space-y-3">
        <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
          <RadioGroupItem value="credit_card" id="credit_card" />
          <Label htmlFor="credit_card" className="flex flex-1 cursor-pointer items-center">
            <CreditCard className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span>{t('credit_card')}</span>
          </Label>
        </div>

        <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
          <RadioGroupItem value="pagomovil" id="pagomovil" />
          <Label htmlFor="pagomovil" className="flex flex-1 cursor-pointer items-center">
            <Smartphone className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span>{t('pagomovil')}</span>
          </Label>
        </div>

        <div className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
          <RadioGroupItem value="cash" id="cash" />
          <Label htmlFor="cash" className="flex flex-1 cursor-pointer items-center">
            <Banknote className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span>{t('cash')}</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
