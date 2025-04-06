'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { User } from '@supabase/supabase-js';
import CartItemList from './cart-item-list';
import CartSummary from './cart-summary';
import { useCart } from '@/contexts/cart-context';
import EmptyCart from './empty-cart';
import { useLanguage } from '@/contexts/language-context';

export interface ShippingOption {
  name: string;
  price: number;
  estimatedDelivery: string;
  displayName: string;
}

export type ShippingMethodType = 'free' | 'express' | 'overnight';

interface CartContentProps {
  user: User | null;
}

export default function CartContent({ user }: CartContentProps) {
  const { t } = useLanguage();
  const { items, total } = useCart();
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodType>('free');

  if (items.length === 0) {
    return <EmptyCart />;
  }

  const shippingOptions: Record<ShippingMethodType, ShippingOption> = {
    free: {
      name: 'Standard',
      displayName: t('shipping_standard') || 'Standard (5-7 days)',
      price: 0,
      estimatedDelivery: t('delivery_standard') || '5-7 business days',
    },
    express: {
      name: 'Express',
      displayName: t('shipping_express') || 'Express (2-3 days)',
      price: 9.99,
      estimatedDelivery: t('delivery_express') || '2-3 business days',
    },
    overnight: {
      name: 'Overnight',
      displayName: t('shipping_overnight') || 'Overnight (Next day)',
      price: 19.99,
      estimatedDelivery: t('delivery_overnight') || 'Next business day',
    },
  };

  const selectedShipping = shippingOptions[shippingMethod];
  const finalTotal = total + selectedShipping.price;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="px-4 py-8 md:py-6"
    >
      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-8 text-3xl font-bold text-gray-900 md:mb-6 md:text-2xl dark:text-gray-100"
      >
        {t('shopping_cart') || 'Shopping Cart'}
      </motion.h1>
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-4">
        <div className="w-full">
          <CartItemList items={items} />
        </div>
        <div className="w-full">
          <CartSummary
            subtotal={total}
            shippingMethod={shippingMethod}
            setShippingMethod={setShippingMethod}
            shippingOptions={shippingOptions}
            total={finalTotal}
            user={user}
            items={items}
          />
        </div>
      </div>
    </motion.div>
  );
}
