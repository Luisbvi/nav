'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { User } from '@supabase/supabase-js';
import { HelpCircle, Truck, MapPin, Package } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
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
  total: number;
  user: User | null;
  items: CartItem[];
}

export default function CartSummary({
  subtotal,
  shippingMethod,
  setShippingMethod,
  shippingOptions,
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
      })
      .catch((error) => {
        console.error('Error fetching exchange rate:', error);
      });
  }, []);

  const selectedShipping = shippingOptions[shippingMethod];

  const getShippingIcon = (method: string) => {
    switch (method) {
      case 'standard':
        return <Truck className="mr-1.5 h-4 w-4" />;
      case 'express':
        return <Package className="mr-1.5 h-4 w-4" />;
      case 'pickup':
        return <MapPin className="mr-1.5 h-4 w-4" />;
      default:
        return <Truck className="mr-1.5 h-4 w-4" />;
    }
  };

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
      className="rounded-lg bg-white p-6 shadow-md md:p-5 dark:bg-gray-800"
    >
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('order_summary')}</h2>

      <div className="mt-6 space-y-4 md:mt-5 md:space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">{t('subtotal')}</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        {/* Shipping section with enhanced design */}
        <div className="w-full rounded-lg bg-gray-50 px-4 py-4 dark:bg-gray-800/50">
          <div className="flex flex-col space-y-3">
            {/* Header with label and tooltip */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {t('shipping')}
                </span>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                        <HelpCircle className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="max-w-xs border bg-white px-3 py-2 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800"
                    >
                      {t('shipping_costs_calculated')}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Mobile price display */}
              <span className="text-sm font-semibold text-gray-900 md:hidden dark:text-gray-100">
                {selectedShipping.price === 0 ? (
                  <Badge
                    variant="outline"
                    className="border-green-200 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                  >
                    Free
                  </Badge>
                ) : (
                  `$${selectedShipping.price.toFixed(2)}`
                )}
              </span>
            </div>

            {/* Shipping selector with fixed responsive layout */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:max-w-[calc(100%-100px)]">
                <Select
                  value={shippingMethod}
                  onValueChange={(value) => setShippingMethod(value as ShippingMethodType)}
                >
                  <SelectTrigger className="h-10 w-full border-gray-300 text-sm shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                    <SelectValue className="flex items-center truncate" />
                  </SelectTrigger>
                  <SelectContent
                    className="max-w-sm border-gray-300 dark:border-gray-600 dark:bg-gray-800"
                    align="start"
                  >
                    {Object.entries(shippingOptions).map(([key, option]) => (
                      <SelectItem
                        key={key}
                        value={key}
                        className="cursor-pointer text-sm hover:bg-gray-100 data-[state=checked]:bg-gray-100 dark:hover:bg-gray-700 dark:data-[state=checked]:bg-gray-700"
                      >
                        <div className="flex items-center truncate">
                          {getShippingIcon(key)}
                          <span className="max-w-[150px] truncate sm:max-w-[200px] md:max-w-[250px]">
                            {option.displayName}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop price display - con ancho fijo y alineación correcta */}
              <div className="hidden sm:block sm:w-20 sm:flex-shrink-0 sm:text-right">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {selectedShipping.price === 0 ? (
                    <Badge
                      variant="outline"
                      className="border-green-200 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
                    >
                      Free
                    </Badge>
                  ) : (
                    `$${selectedShipping.price.toFixed(2)}`
                  )}
                </span>
              </div>
            </div>
          </div>
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

      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="mt-6">
        <Button
          onClick={handleCheckout}
          disabled={isSubmitting || items.length === 0}
          className="w-full cursor-pointer bg-blue-600 py-2.5 text-white transition-colors hover:bg-blue-700 md:text-sm dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
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
