'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import OrderDetail from '@/components/orders/order-details';
import { Order, ShippingAddress } from '@/types';

export default function OrderDetailPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Check authentication
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .eq('user_id', session.user.id)
          .single();

        if (orderError || !orderData) {
          router.push('/not-found');
          return;
        }

        setOrder(orderData);

        // Fetch shipping address if available
        if (orderData.shipping_address_id) {
          const { data: addressData } = await supabase
            .from('user')
            .select('*')
            .eq('id', orderData.shipping_address_id)
            .single();

          setShippingAddress(addressData);
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, router]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading order details...</p>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-red-500">{error || 'Order not found'}</p>
      </div>
    );
  }

  return <OrderDetail order={order} shippingAddress={shippingAddress || {}} />;
}
