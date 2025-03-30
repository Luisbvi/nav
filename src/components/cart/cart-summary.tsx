'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { User } from '@supabase/supabase-js';
import { HelpCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/language-context';
import { useRouter } from 'next/navigation';
import type { CartItem } from '@/types';
import type { ShippingMethodType, ShippingOption } from './cart-content';
import PaymentMethodSelector from './payment-method-selector';
import PagomovilModal, { type PagomovilPaymentData } from './pagomovil-modal';
import { USDRes } from '@/utils/supabase/types';

interface CartSummaryProps {
  subtotal: number;
  shippingMethod: ShippingMethodType;
  setShippingMethod: (value: ShippingMethodType) => void;
  shippingOptions: Record<ShippingMethodType, ShippingOption>;
  taxAmount: number;
  total: number;
  user: User | null;
  items: CartItem[];
}

export default function CartSummary({
  subtotal,
  shippingMethod,
  setShippingMethod,
  shippingOptions,
  taxAmount,
  total,
  user,
  items,
}: CartSummaryProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [showPagomovilModal, setShowPagomovilModal] = useState(false);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    fetch('https://pydolarve.org/api/v1/dollar?page=bcv')
      .then((res) => res.json())
      .then(({ monitors }: USDRes) => {
        setRate(monitors.usd.price);
      });
  }, []);

  const selectedShipping = shippingOptions[shippingMethod];

  const handleCheckout = async () => {
    try {
      setIsSubmitting(true);

      if (paymentMethod === 'pagomovil') {
        setShowPagomovilModal(true);
        setIsSubmitting(false);
        return;
      }

      if (paymentMethod === 'cash') {
        const response = await fetch('/api/create-cash-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items,
            shippingMethod,
            shippingPrice: selectedShipping.price,
            user,
            total: total,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.redirectUrl) {
          router.push(data.redirectUrl);
        } else {
          throw new Error('Failed to create order');
        }

        return;
      }

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingMethod,
          shippingPrice: selectedShipping.price,
          user,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePagomovilSubmit = async (paymentData: PagomovilPaymentData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/create-pagomovil-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          shippingMethod,
          shippingPrice: selectedShipping.price,
          user,
          paymentData,
          total: total * rate,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error processing Pagomovil payment:', error);
      alert('Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-lg bg-white p-6 shadow dark:bg-gray-800"
    >
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('order_summary')}</h2>

      <div className="mt-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-gray-600 dark:text-gray-400">{t('shipping')}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-56 text-xs">{t('shipping_costs_calculated')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={shippingMethod}
              onValueChange={(value) => setShippingMethod(value as ShippingMethodType)}
            >
              <SelectTrigger className="h-8 w-auto min-w-32 cursor-pointer border-gray-200 dark:border-gray-700 dark:hover:bg-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-gray-700">
                <SelectItem
                  className="cursor-pointer dark:hover:bg-gray-500 dark:focus:bg-gray-600"
                  value="free"
                >
                  {shippingOptions.free.displayName}
                </SelectItem>
                <SelectItem value="express" className="cursor-pointer dark:hover:bg-gray-600">
                  {shippingOptions.express.displayName}
                </SelectItem>
                <SelectItem value="overnight" className="cursor-pointer dark:hover:bg-gray-600">
                  {shippingOptions.overnight.displayName}
                </SelectItem>
              </SelectContent>
            </Select>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {selectedShipping.price === 0 ? 'Free' : `$${selectedShipping.price.toFixed(2)}`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-gray-600 dark:text-gray-400">{t('tax')}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-56 text-xs">{t('tax_calculated')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            ${taxAmount.toFixed(2)}
          </span>
        </div>

        <Separator className="my-2 dark:bg-gray-700" />

        <div className="flex justify-between">
          <span className="text-base font-medium text-gray-900 dark:text-gray-100">
            {t('total')}
          </span>
          <span className="text-base font-bold text-gray-900 dark:text-gray-100">
            ${total.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <PaymentMethodSelector
          selectedMethod={paymentMethod}
          onMethodChange={setPaymentMethod}
          total={Number.parseFloat(total.toFixed(2))}
          rate={rate}
        />
      </div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6">
        <Button
          onClick={handleCheckout}
          disabled={isSubmitting || items.length === 0}
          className="w-full cursor-pointer bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
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
            t('proceed_to_checkout')
          )}
        </Button>
      </motion.div>

      {/* Pagomovil Modal */}
      {showPagomovilModal && (
        <PagomovilModal
          isOpen={showPagomovilModal}
          onClose={() => setShowPagomovilModal(false)}
          onSubmit={handlePagomovilSubmit}
          total={total}
          rate={rate}
          isSubmitting={isSubmitting}
        />
      )}
    </motion.div>
  );
}
