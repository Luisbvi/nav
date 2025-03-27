'use client';

import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

import { Button } from '@/components/ui/button';
import type { CartItem } from '@/types';

interface StripeCheckoutButtonProps {
  items: CartItem[];
  shippingMethod: string;
  className?: string;
  user: User | null;
}

// Shipping options with translations
const shippingOptions = {
  free: {
    id: 'free',
    name: {
      en: 'Standard Shipping',
      es: 'Envío Estándar',
      fr: 'Livraison Standard',
      zh: '标准配送',
    },
    price: 0,
    estimate: {
      en: '5-7 business days',
      es: '5-7 días hábiles',
      fr: '5-7 jours ouvrables',
      zh: '5-7 个工作日',
    },
  },
  express: {
    id: 'express',
    name: {
      en: 'Express Shipping',
      es: 'Envío Express',
      fr: 'Livraison Express',
      zh: '快递配送',
    },
    price: 9.99,
    estimate: {
      en: '2-3 business days',
      es: '2-3 días hábiles',
      fr: '2-3 jours ouvrables',
      zh: '2-3 个工作日',
    },
  },
  overnight: {
    id: 'overnight',
    name: {
      en: 'Overnight Shipping',
      es: 'Envío Nocturno',
      fr: 'Livraison de Nuit',
      zh: '隔夜配送',
    },
    price: 19.99,
    estimate: {
      en: 'Next business day',
      es: 'Próximo día hábil',
      fr: 'Prochain jour ouvrable',
      zh: '下一个工作日',
    },
  },
};

export default function StripeCheckoutButton({
  items,
  shippingMethod,
  className,
  user,
}: StripeCheckoutButtonProps) {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  // Get the selected shipping option
  const selectedShipping = shippingOptions[shippingMethod as keyof typeof shippingOptions];

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      setTimeout(async () => {
        setIsLoading(false);
        // Create checkout session on the server
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items,
            shippingMethod,
            shippingPrice: selectedShipping.price,
            user: user,
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
      }, 2000);
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      alert(t('checkout_error') || 'Something went wrong. Please try again.');
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading || items.length === 0}
      className={`w-full bg-blue-500 text-white hover:bg-blue-600 ${className}`}
      aria-label={t('proceed_to_checkout') || 'Proceed to Checkout'}
    >
      {isLoading ? (
        <motion.div className="flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Loader2 className="mr-2 size-4 animate-spin" />
          {t('processing') || 'Processing...'}
        </motion.div>
      ) : (
        t('proceed_to_checkout') || 'Proceed to Checkout'
      )}
    </Button>
  );
}
