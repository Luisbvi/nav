'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [sessionId]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold">Thank You for Your Order!</h1>
        <p className="max-w-md text-gray-600">
          Your payment was successful and your order is being processed. You will receive a
          confirmation email shortly.
        </p>

        {sessionId && (
          <p className="text-sm text-gray-500">Order Reference: {sessionId.substring(0, 8)}...</p>
        )}

        <div className="mt-6 flex gap-4">
          <Link href="/">
            <Button variant="outline">Return Home</Button>
          </Link>
          <Link href="/catalog">
            <Button className="bg-blue-500 text-white hover:bg-blue-600">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </Suspense>
  );
}
