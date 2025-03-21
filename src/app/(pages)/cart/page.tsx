'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/cart-context';
import StripeCheckoutButton from '@/components/cart/StripeCheckoutButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

// Define shipping option type for better type safety
interface ShippingOption {
  name: string;
  price: number;
  estimatedDelivery: string;
  displayName: string;
}

// Define shipping method type
type ShippingMethodType = 'free' | 'express' | 'overnight';

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart } = useCart();
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodType>('free');
  const [user, setUser] = useState<User | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase]);

  // Define shipping options with proper typing
  const shippingOptions: Record<ShippingMethodType, ShippingOption> = {
    free: {
      name: 'Standard',
      displayName: 'Standard (5-7 days)',
      price: 0,
      estimatedDelivery: '5-7 business days',
    },
    express: {
      name: 'Express',
      displayName: 'Express (2-3 days)',
      price: 9.99,
      estimatedDelivery: '2-3 business days',
    },
    overnight: {
      name: 'Overnight',
      displayName: 'Overnight (Next day)',
      price: 19.99,
      estimatedDelivery: 'Next business day',
    },
  };

  const selectedShipping = shippingOptions[shippingMethod];
  const finalTotal = total + selectedShipping.price;

  if (items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-gray-500">Add items to your cart to get started!</p>
        <Link href="/catalog">
          <Button className="mt-4 bg-blue-400 text-white hover:bg-blue-500">Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-8 sm:px-8 lg:px-12">
      <h1 className="mb-8 text-3xl font-bold">Your Shopping Cart</h1>

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
                    <p className="mt-1 text-sm text-gray-500">
                      ${item.price.toFixed(2)} per {item.unit || 'item'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">
                        {item.quantity}{' '}
                        {item.unit && <span className="text-sm text-gray-500">{item.unit}</span>}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
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
                        aria-label="Remove item"
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
              <Button variant="outline">Browse More Products</Button>
            </Link>
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-600"
              onClick={clearCart}
              aria-label="Clear shopping cart"
            >
              Empty Cart
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

              {/* Streamlined shipping method and price display */}
              <div className="flex items-center justify-between">
                <div className="flex-shrink-0">
                  <span className="text-gray-500">Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={shippingMethod}
                    onValueChange={(value) => setShippingMethod(value as ShippingMethodType)}
                  >
                    <SelectTrigger className="w-auto min-w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">{shippingOptions.free.displayName}</SelectItem>
                      <SelectItem value="express">{shippingOptions.express.displayName}</SelectItem>
                      <SelectItem value="overnight">
                        {shippingOptions.overnight.displayName}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="font-medium">
                    {selectedShipping.price === 0
                      ? '$0.00'
                      : `$${selectedShipping.price.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Expected arrival: {selectedShipping.estimatedDelivery}
              </p>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-medium">Total</span>
                  <span className="text-lg font-bold">${finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <StripeCheckoutButton
              items={items}
              className="mt-6"
              shippingMethod={shippingMethod}
              user={user || null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
