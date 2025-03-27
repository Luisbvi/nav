import { Suspense } from 'react';
import CheckoutSuccess from '@/components/checkout/checkout-success';

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      }
    >
      <CheckoutSuccess />
    </Suspense>
  );
}
