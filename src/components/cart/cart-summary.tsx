'use client';

import type { Dispatch, SetStateAction } from 'react';
import { motion } from 'framer-motion';
import type { User } from '@supabase/supabase-js';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { CartItem } from '@/types';
import type { ShippingMethodType, ShippingOption } from './cart-content';
import StripeCheckoutButton from './stripe-checkout-button';

interface CartSummaryProps {
  subtotal: number;
  shippingMethod: ShippingMethodType;
  setShippingMethod: Dispatch<SetStateAction<ShippingMethodType>>;
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
  const selectedShipping = shippingOptions[shippingMethod];

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-lg bg-white p-6 shadow dark:bg-gray-800"
    >
      <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        {t('order_summary') || 'Order summary'}
      </h2>

      <div className="mt-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">{t('subtotal') || 'Subtotal'}</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {t('price_format', { price: subtotal.toFixed(2) }) || `$${subtotal.toFixed(2)}`}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-gray-600 dark:text-gray-400">
              {t('shipping_estimate') || 'Shipping estimate'}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-56 text-xs">
                    {t('shipping_tooltip') ||
                      'Shipping costs are calculated based on delivery speed and destination'}
                  </p>
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
                <SelectValue placeholder={t('select_shipping') || 'Select shipping'} />
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
              {selectedShipping.price === 0
                ? t('free') || 'Free'
                : t('price_format', { price: selectedShipping.price.toFixed(2) }) ||
                  `$${selectedShipping.price.toFixed(2)}`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-gray-600 dark:text-gray-400">
              {t('tax_estimate') || 'Tax estimate'}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-56 text-xs">
                    {t('tax_tooltip') ||
                      'Tax is calculated based on your shipping address and local regulations'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {t('price_format', { price: taxAmount.toFixed(2) }) || `$${taxAmount.toFixed(2)}`}
          </span>
        </div>

        <Separator className="my-2 dark:bg-gray-700" />

        <div className="flex justify-between">
          <span className="text-base font-medium text-gray-900 dark:text-gray-100">
            {t('order_total') || 'Order total'}
          </span>
          <span className="text-base font-bold text-gray-900 dark:text-gray-100">
            {t('price_format', { price: total.toFixed(2) }) || `$${total.toFixed(2)}`}
          </span>
        </div>
      </div>

      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="mt-6">
        <StripeCheckoutButton
          items={items}
          className="w-full cursor-pointer bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          shippingMethod={shippingMethod}
          user={user}
        />
      </motion.div>
    </motion.div>
  );
}
