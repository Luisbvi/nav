'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/contexts/cart-context';

export function CartButton() {
  const { itemCount } = useCart();
  return (
    <Link href="/cart" className="relative">
      <div className="flex h-10 items-center gap-2 rounded-md bg-white px-4 text-blue-500 transition-colors hover:bg-gray-100">
        <ShoppingCart className="h-5 w-5" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {itemCount}
          </span>
        )}
      </div>
    </Link>
  );
}
