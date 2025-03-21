'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';

interface StripeCheckoutButtonProps {
  items: { id: string; name: string; price: number; quantity: number }[];
  shippingMethod: string;
  className?: string;
  user: User | null;
}

// Shipping options
const shippingOptions = {
  free: {
    id: 'free',
    name: 'Standard Shipping',
    price: 0,
    estimate: '5-7 business days',
  },
  express: {
    id: 'express',
    name: 'Express Shipping',
    price: 9.99,
    estimate: '2-3 business days',
  },
  overnight: {
    id: 'overnight',
    name: 'Overnight Shipping',
    price: 19.99,
    estimate: 'Next business day',
  },
};

export default function StripeCheckoutButton({
  items,
  shippingMethod,
  className = '',
  user,
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Get the selected shipping option
  const selectedShipping = shippingOptions[shippingMethod as keyof typeof shippingOptions];

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

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
    } catch (error) {
      console.error('Error redirecting to checkout:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className={`w-full bg-blue-500 text-white hover:bg-blue-600 ${className}`}
    >
      {isLoading ? 'Processing...' : 'Proceed to Checkout'}
    </Button>
  );
}
