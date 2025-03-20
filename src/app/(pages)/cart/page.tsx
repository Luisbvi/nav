'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-gray-500">Start adding some items to your cart!</p>
        <Link href="/catalog">
          <Button className="mt-4 bg-blue-400 text-white hover:bg-blue-500">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 sm:px-8 lg:px-12">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="rounded-lg bg-white shadow">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 border-b border-gray-200 p-4 last:border-0 sm:flex-row"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md sm:h-32 sm:w-32">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 96px, 128px"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <Link href={`/product/${item.id}`} className="hover:text-blue-500">
                      <h3 className="font-medium">{item.name}</h3>
                    </Link>
                    <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)} each</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">
                        {item.quantity} {item.unit && <span className="text-sm text-gray-500">{item.unit}</span>}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between">
            <Link href="/catalog">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-600"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-medium">Order Summary</h2>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-lg font-bold">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Link href="/checkout">
              <Button className="mt-6 w-full bg-blue-500 text-white hover:bg-blue-600">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
