'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';
import { Order } from '@/types';

export default function OrdersPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoading(true);

        // Get user session
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        const { user } = session;

        // Get orders
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (orderError) {
          throw orderError;
        }

        if (orderData) {
          setOrders(orderData);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        alert('Error loading orders!');
      } finally {
        setLoading(false);
      }
    };

    getOrders();
  }, [router, supabase]);

  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="spinner"></div>
          <p className="mt-4">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">My Orders</h1>

      <div className="rounded-lg bg-white p-6 shadow-md">
        {orders.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">You have no orders yet</p>
            <Link
              href="/"
              className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-md border p-4 transition hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">{formatOrderDate(order.order_date)}</p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'pending'
                          ? 'bg-blue-100 text-blue-800'
                          : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.status === 'completed'
                      ? 'Completed'
                      : order.status === 'pending'
                        ? 'Pending'
                        : order.status === 'cancelled'
                          ? 'Cancelled'
                          : 'Pending'}
                  </span>
                </div>

                <div className="mt-2">
                  <p className="text-sm">
                    <span className="font-medium">Total:</span> ${order.total.toFixed(2)}
                  </p>
                </div>

                <div className="mt-2">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
