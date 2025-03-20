'use client';

import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const router = useRouter();
  const [deliveryMethod, setDeliveryMethod] = useState('standard');

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const handlePayment = () => {
    clearCart();
    alert('Payment successful!');
  };

  let deliveryCost = 0;
  if (deliveryMethod === 'express') {
    deliveryCost = 15;
  }

  const finalTotal = total + deliveryCost;

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-3xl font-bold">Checkout</h1>
      <div className="mb-4 w-full max-w-md rounded-lg bg-white p-4 shadow">
        <h2 className="mb-2 text-xl font-semibold">Your Items</h2>
        <ul className="mb-4">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.name} ({item.quantity})
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <h3 className="font-bold">Total: ${total.toFixed(2)}</h3>
      </div>
      <h2 className="mb-2 text-xl font-semibold">Shipping Details</h2>
      <form className="mb-4 w-full max-w-md rounded-lg bg-white p-4 shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium">Delivery Method</label>
          <div>
            <label className="flex items-center">
              <input
                type="radio"
                name="delivery"
                value="standard"
                checked={deliveryMethod === 'standard'}
                onChange={() => setDeliveryMethod('standard')}
              />
              <span className="ml-2">Standard Delivery - Free</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="delivery"
                value="port-pickup"
                checked={deliveryMethod === 'port-pickup'}
                onChange={() => setDeliveryMethod('port-pickup')}
              />
              <span className="ml-2">Port Pickup - Available at no additional cost</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="delivery"
                value="direct-to-vessel"
                checked={deliveryMethod === 'direct-to-vessel'}
                onChange={() => setDeliveryMethod('direct-to-vessel')}
              />
              <span className="ml-2">Direct to Vessel - Additional fees may apply</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="delivery"
                value="express"
                checked={deliveryMethod === 'express'}
                onChange={() => setDeliveryMethod('express')}
              />
              <span className="ml-2">Express Delivery - Available for urgent orders - $15.00</span>
            </label>
          </div>
        </div>
        <h3 className="font-bold">Total: ${finalTotal.toFixed(2)}</h3>
      </form>
      <h2 className="mb-2 text-xl font-semibold">Payment Details</h2>
      <form className="mb-4 w-full max-w-md rounded-lg bg-white p-4 shadow">
        <div className="mb-4">
          <label className="block text-sm font-medium">IP Address</label>
          <input
            type="text"
            value="192.168.1.1"
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500"
          />
        </div>
        <Button onClick={handlePayment} className="w-full bg-blue-500 hover:bg-blue-600">
          Pay Now
        </Button>
      </form>
    </div>
  );
}
