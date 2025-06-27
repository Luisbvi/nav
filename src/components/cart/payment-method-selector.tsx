'use client';

import { useLanguage } from '@/contexts/language-context';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { CreditCard, Banknote, Smartphone } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onMethodChange: (method: string) => void;
  total: number;
  // rate: number;
}

export default function PaymentMethodSelector({
  selectedMethod,
  onMethodChange,
}: PaymentMethodSelectorProps) {
  const { t } = useLanguage();
  const methods = [
    //  { id: 'credit_card', label: t('credit_card') },
    { id: 'cash', label: t('cash') },
    // { id: 'pagomovil', label: t('pagomovil') },
    { id: 'binance', label: 'Binance' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t('payment_methods')}</h3>
      <RadioGroup value={selectedMethod} onValueChange={onMethodChange} className="space-y-3">
        {methods.map((method) => (
          <div
            key={method.id}
            className="flex items-center space-x-2 rounded-md border p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RadioGroupItem value={method.id} id={method.id} />
            <Label htmlFor={method.id} className="flex flex-1 cursor-pointer items-center">
              {/*method.id === 'credit_card' && (
                <CreditCard className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" />
              )*/}
              {method.id === 'cash' && (
                <Banknote className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}

              {method.id === 'binance' && (
                <svg
                  className="mr-2 h-5 w-5 text-gray-600 dark:text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2l3.09 3.09L12 8.18l-3.09-3.09L12 2zm6.36 3.64L22 9.27l-3.64 3.64-2.73-2.73 2.73-2.73zm-12.72 0l2.73 2.73-2.73 2.73L2 9.27l3.64-3.63zM12 9.27l3.09 3.09-3.09 3.09-3.09-3.09L12 9.27zm6.36 6.36l2.73 2.73L18.36 22 15.64 19.27l2.72-2.73zm-12.72 0l2.73 2.73L5.64 22 2.91 19.27l2.73-2.73z" />
                </svg>
              )}
              <span>{method.label}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
